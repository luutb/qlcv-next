"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { AUTHORIZATION_ACTIONS, USER_ROLE_LABELS, getRoleActionCeiling, type AuthorizationAction, type UserRole } from "@/features/auth/model/current-user";
import { getSafeApiErrorMessage } from "@/services/http";
import { useRolePermissions, useSaveRolePermissions } from "../../hooks/use-role-permissions";
import { RolePermissionFormatError, type CanonicalRole } from "../../api/role-permissions.api";
import { getEffectiveActions, permissionDependencies as dependencies } from "../../model/role-policy";


const categories: ReadonlyArray<{ title: string; actions: ReadonlyArray<{ key: AuthorizationAction; label: string }> }> = [
  { title: "Tổng quan", actions: [{ key: "dashboard.people.read", label: "Xem chỉ số nhân sự" }, { key: "dashboard.finance.read", label: "Xem chỉ số tài chính" }] },
  { title: "Dự án", actions: [{ key: "projects.read", label: "Xem dự án" }, { key: "projects.create", label: "Tạo dự án" }, { key: "projects.finance.read", label: "Xem tài chính dự án" }, { key: "projects.assign-team", label: "Gán đội nhóm" }, { key: "projects.override-conflict", label: "Bỏ qua xung đột phân công" }, { key: "projects.complete", label: "Hoàn tất dự án" }] },
  { title: "Khách hàng và đội nhóm", actions: [{ key: "customers.read", label: "Xem khách hàng" }, { key: "customers.manage", label: "Quản lý khách hàng" }, { key: "teams.read", label: "Xem đội nhóm" }, { key: "teams.manage", label: "Quản lý đội nhóm" }] },
  { title: "Công việc", actions: [{ key: "tasks.access", label: "Truy cập công việc" }, { key: "tasks.create", label: "Tạo công việc" }, { key: "tasks.assign", label: "Giao người thực hiện" }, { key: "tasks.finance.read", label: "Xem số liệu tài chính" }, { key: "tasks.update-amount", label: "Sửa số tiền" }, { key: "tasks.complete-deposit", label: "Xác nhận tiền cọc" }] },
  { title: "Nhãn", actions: [{ key: "labels.read", label: "Xem nhãn" }, { key: "labels.manage", label: "Tạo và sửa nhãn" }, { key: "labels.assign-normal", label: "Gắn nhãn thông thường" }, { key: "labels.assign-financial", label: "Gắn nhãn tài chính" }] },
  { title: "Nhân sự và hồ sơ", actions: [{ key: "users.manage", label: "Quản lý nhân viên và hồ sơ" }] },
  { title: "Phân hệ khác", actions: [{ key: "invoices.read", label: "Xem hóa đơn" }, { key: "invoices.generate", label: "Tạo hóa đơn" }, { key: "invoices.update-status", label: "Cập nhật trạng thái hóa đơn" }, { key: "documents.read", label: "Xem tài liệu" }, { key: "documents.lock", label: "Khóa tài liệu" }, { key: "time-entries.read", label: "Xem thời gian làm việc" }, { key: "reports.read", label: "Xem báo cáo" }, { key: "audit.read", label: "Xem nhật ký" }, { key: "audit.verify", label: "Xác minh nhật ký" }, { key: "tenant-settings.manage", label: "Quản lý cấu hình tenant" }, { key: "tenant-data.purge", label: "Xóa dữ liệu tenant" }] },
];

export function RolePermissionScreen() {
  const [role, setRole] = useState<CanonicalRole>("PARTNER");
  const permissions = useRolePermissions(role);
  const roles: CanonicalRole[] = [permissions.user.data?.account_scope === "organization" ? "ADMIN" : "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"];
  const save = useSaveRolePermissions(role);
  const [draftState, setDraftState] = useState<{ role: CanonicalRole; baseline: Record<AuthorizationAction, boolean>; actions: Record<AuthorizationAction, boolean> } | null>(null);
  const [success, setSuccess] = useState("");
  const [pendingRole, setPendingRole] = useState<CanonicalRole | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const baseline = useMemo(() => permissions.data ? getEffectiveActions(role, permissions.data) : getRoleActionCeiling(role), [permissions.data, role]);

  const activeDraft = draftState?.role === role ? draftState : null;
  const draft = activeDraft?.actions ?? baseline;
  const setDraft = (actions: Record<AuthorizationAction, boolean>) => {
    setSuccess("");
    save.reset();
    setDraftState({ role, baseline: activeDraft?.baseline ?? baseline, actions });
  };
  const changeAction = (action: AuthorizationAction, checked: boolean) => {
    const next = { ...draft, [action]: checked };
    for (const [write, read] of dependencies) next[write] = next[write] && next[read];
    setDraft(next);
  };
  const dirty = AUTHORIZATION_ACTIONS.some((action) => draft[action] !== (activeDraft?.baseline ?? baseline)[action]);
  const changedOnServer = Boolean(activeDraft && AUTHORIZATION_ACTIONS.some((action) => activeDraft.baseline[action] !== baseline[action]));
  const canRecover = permissions.error instanceof RolePermissionFormatError;
  const canReset = (permissions.isSuccess || canRecover) && !permissions.isFetching && !save.isPending;
  const canSave = permissions.isSuccess && !permissions.isFetching && !changedOnServer && !save.isPending;
  const selectRole = (next: CanonicalRole) => {
    setRole(next); setDraftState(null); setSuccess(""); save.reset(); setPendingRole(null);
  };
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  const hasDefaultPolicy = permissions.data?.some((entry) => entry.resource === "default" && (Object.keys(entry.actions).length > 0 || entry.field_level || Object.keys(entry.conditions ?? {}).length > 0)) ?? false;
  const unsupported = permissions.data?.some((entry) => entry.field_level || Object.keys(entry.conditions ?? {}).length > 0) ?? false;

  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/admin/permissions" />} topbar={<WorkhubTopbar />}><main id="main-content" className="workhub-content directory-content">
    <div className="directory-heading"><div><h1>Thiết lập quyền theo vai trò</h1><p>Giới hạn quyền dùng chung cho mọi tài khoản có vai trò này.</p></div><Button component={Link} href="/users" variant="outlined">Quản lý nhân viên</Button></div>
    {permissions.user.isPending ? <p role="status">Đang xác minh quyền quản trị…</p> : permissions.user.error ? <Alert severity="error" action={<Button onClick={() => permissions.user.refetch()}>Thử lại</Button>}>Không xác minh được tài khoản quản trị.</Alert> : !permissions.allowed ? <Alert severity="warning">Chỉ quản trị viên mới được thiết lập quyền theo vai trò.</Alert> : <>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
          <TextField select label="Vai trò cần cấu hình" value={role} disabled={save.isPending} onChange={(event) => { const value = event.target.value; if (roles.includes(value as CanonicalRole)) { if (dirty) setPendingRole(value as CanonicalRole); else selectRole(value as CanonicalRole); } }} sx={{ minWidth: 250 }}>
            {roles.map((value) => <MenuItem key={value} value={value}>{USER_ROLE_LABELS[value as UserRole]}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button disabled={!dirty || save.isPending || permissions.isPending} onClick={() => { setDraftState(null); save.reset(); setSuccess(""); }}>Hủy thay đổi</Button>
            <Button disabled={!canReset || !permissions.allowed || (!hasDefaultPolicy && !canRecover)} onClick={() => setConfirmReset(true)}>Khôi phục mặc định</Button>
            <Button variant="contained" disabled={!dirty || !canSave} onClick={() => save.mutate(draft, { onSuccess: () => { setDraftState(null); setSuccess("Đã lưu thiết lập quyền."); }, onError: () => setSuccess("") })}>{save.isPending ? "Đang lưu…" : "Lưu quyền"}</Button>
          </Stack>
        </Stack>
        <p>Mặc định khi chưa có thiết lập riêng: quyền theo vai trò được hệ thống hỗ trợ. Có thể tắt quyền; không thể bật quyền ngoài giới hạn này.</p>
      </Paper>
      {permissions.isPending && <p role="status">Đang tải cấu hình quyền…</p>}
      {permissions.error && <Alert severity="error" action={<Button onClick={() => permissions.refetch()}>Thử lại</Button>}>{getSafeApiErrorMessage(permissions.error, "Không tải được cấu hình quyền.")}</Alert>}
      {save.error && <Alert severity="error" sx={{ mb: 2 }}>{getSafeApiErrorMessage(save.error, "Không lưu được cấu hình quyền.")}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {canRecover && <Alert severity="warning" sx={{ mb: 2 }}>Dữ liệu chính sách không hợp lệ. Bạn có thể khôi phục chính sách chung về mặc định. Nếu lỗi nằm ở chính sách theo tài nguyên, cần hỗ trợ kỹ thuật để sửa chính sách đó.</Alert>}
      {permissions.user.data?.authorization_unavailable && <Alert severity="warning" sx={{ mb: 2 }}>Cấu hình quyền quản trị đang lỗi nên các nghiệp vụ bị khóa. Hãy chọn vai trò Quản trị viên và khôi phục chính sách chung để sửa; giới hạn theo tài nguyên cần được đội kỹ thuật xử lý.</Alert>}
      {changedOnServer && <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={() => { setDraftState(null); save.reset(); }}>Tải cấu hình mới</Button>}>Cấu hình quyền đã thay đổi trong lúc bạn chỉnh sửa. Bản nháp được giữ lại; hãy tải cấu hình mới trước khi lưu.</Alert>}
      {unsupported && <Alert severity="warning" sx={{ mb: 2 }}>Đang có điều kiện hoặc giới hạn trường chưa được hỗ trợ. Hệ thống sẽ từ chối quyền của vai trò này cho đến khi chính sách đó được sửa.</Alert>}
      {permissions.isSuccess && <>
        {permissions.data.some((entry) => entry.resource !== "default") && <Alert severity="info" sx={{ mb: 2 }}>Vai trò có thêm giới hạn theo phạm vi tài nguyên. Màn hình này chỉnh chính sách chung; các giới hạn riêng vẫn tiếp tục có hiệu lực.</Alert>}
        {categories.map((category) => <Paper key={category.title} variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: 2 }}><h2>{category.title}</h2><div className="role-permission-grid">{category.actions.map(({ key, label }) => {
          const supported = getRoleActionCeiling(role)[key];
          const missingAccess = dependencies.some(([write, read]) => write === key && !draft[read]);
          const restrictedByResource = permissions.data.some((entry) => entry.resource !== "default" && Object.entries(entry.actions).some(([action, allowed]) => {
            const scopedAction = !action.startsWith(`${entry.resource}.`) ? `${entry.resource}.${action}` : action;
            return scopedAction === key && !allowed;
          }));
          return <FormControlLabel key={key} control={<Checkbox checked={draft[key]} disabled={!supported || restrictedByResource || missingAccess || save.isPending || !permissions.isSuccess || changedOnServer} onChange={(event) => changeAction(key, event.target.checked)} />} label={<span>{label}{!supported && <small className="role-permission-unavailable"> · Chưa hỗ trợ với vai trò này</small>}{restrictedByResource && <small className="role-permission-unavailable"> · Bị giới hạn theo phạm vi khác</small>}{supported && missingAccess && <small className="role-permission-unavailable"> · Cần cấp quyền truy cập liên quan</small>}</span>} />;
        })}</div></Paper>)}
      </>}
    </>}
    <Dialog open={pendingRole !== null} onClose={() => setPendingRole(null)} aria-labelledby="discard-permission-title">
      <DialogTitle id="discard-permission-title">Bỏ thay đổi chưa lưu?</DialogTitle>
      <DialogContent>Các thay đổi của vai trò hiện tại chưa được lưu. Đổi vai trò sẽ bỏ bản nháp này.</DialogContent>
      <DialogActions><Button onClick={() => setPendingRole(null)}>Tiếp tục chỉnh sửa</Button><Button color="warning" onClick={() => { if (pendingRole) selectRole(pendingRole); }}>Bỏ thay đổi và chuyển</Button></DialogActions>
    </Dialog>
    <Dialog open={confirmReset} onClose={save.isPending ? undefined : () => setConfirmReset(false)} aria-labelledby="reset-permission-title">
      <DialogTitle id="reset-permission-title">Khôi phục quyền mặc định?</DialogTitle>
      <DialogContent>Quyền của mọi tài khoản có vai trò {USER_ROLE_LABELS[role]} sẽ về giới hạn mặc định. Các giới hạn riêng theo tài nguyên vẫn có hiệu lực.</DialogContent>
      <DialogActions><Button disabled={save.isPending} onClick={() => setConfirmReset(false)}>Hủy</Button><Button color="warning" disabled={!canReset} onClick={() => { setConfirmReset(false); save.mutate({}, { onSuccess: () => { setDraftState(null); setSuccess("Đã khôi phục giới hạn mặc định của vai trò."); }, onError: () => setSuccess("") }); }}>Khôi phục mặc định</Button></DialogActions>
    </Dialog>
  </main></WorkspaceTemplate>;
}
