"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField } from "@mui/material";
import { ApiProblem, createIdempotencyKey, getSafeApiErrorMessage } from "@/services/http";
import { platformApi } from "../../api/platform.api";
import { usePlatformAccess, useRefreshPlatform } from "../../hooks/use-platform";
import { platformAccountValidation, type PlatformAccount, type PlatformAccountRole } from "../../model/platform-contracts";

type Props = { account?: PlatformAccount; preview: boolean; onClose: () => void; onSaved: (message: string) => void };
export function PlatformAccountEditor({ account, preview, onClose, onSaved }: Props) {
  const access = usePlatformAccess(preview);
  const refresh = useRefreshPlatform();
  const [username, setUsername] = useState("");
  const [name, setName] = useState(account?.display_name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PlatformAccountRole>(account?.role ?? "ADMIN");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [versionConflict, setVersionConflict] = useState(false);
  const [key] = useState(createIdempotencyKey);
  const creating = !account;
  const ownAccount = account?.id === access.user.data?.id;
  const errors = platformAccountValidation({ username, display_name: name, email, password }, creating);
  const dirty = creating ? Boolean(username || name || email || password || role !== "ADMIN") : name.trim() !== account.display_name || email.trim() !== (account.email ?? "") || role !== account.role;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const promoting = role === "SUPER_ADMIN" && account?.role !== "SUPER_ADMIN";
  const save = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!access.can("platform.admins.manage")) throw new Error("Bạn chưa được cấp quyền quản lý tài khoản quản trị.");
      const values = { display_name: name.trim(), email: email.trim() || null, role };
      return account ? platformApi.updateAccount(account.id, { ...values, version: account.version }) : platformApi.createAccount({ ...values, username: username.trim(), password }, key);
    },
    onError: (error) => { if (error instanceof ApiProblem && error.problem.code === "VERSION_CONFLICT") setVersionConflict(true); },
    onSuccess: async () => { setPassword(""); await refresh(); onSaved(creating ? "Đã tạo tài khoản quản trị." : "Đã cập nhật tài khoản quản trị."); },
  });
  const conflict = versionConflict;
  const submit = () => {
    setSubmitted(true);
    if (!preview && !save.isPending && !conflict && !Object.keys(errors).length && (!promoting || acknowledged) && dirty) save.mutate();
  };
  const close = () => { if (save.isPending) return; if (dirty) setDiscard(true); else onClose(); };
  const errorMessage = save.error instanceof ApiProblem && save.error.problem.code === "ACCOUNT_EXISTS" ? "Tên đăng nhập hoặc email đã được sử dụng. Hãy chọn thông tin khác." : save.error instanceof ApiProblem && save.error.problem.code === "LAST_SUPER_ADMIN" ? "Không thể hạ quyền Super Admin hoạt động cuối cùng." : getSafeApiErrorMessage(save.error, "Không lưu được tài khoản. Vui lòng thử lại.");
  return <><Dialog open onClose={close} fullWidth maxWidth="sm" aria-labelledby="platform-account-editor-title"><form noValidate onSubmit={(event) => { event.preventDefault(); submit(); }}><DialogTitle id="platform-account-editor-title">{creating ? "Tạo tài khoản quản trị" : `Chỉnh sửa ${account.username}`}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
    {preview && <Alert severity="info">Biểu mẫu xem trước. Thông tin nhập tại đây sẽ không được gửi hoặc lưu vào hệ thống.</Alert>}
    {creating && <TextField label="Tên đăng nhập" required value={username} disabled={save.isPending} autoComplete="off" onChange={(event) => { setUsername(event.target.value); save.reset(); }} error={submitted && Boolean(errors.username)} helperText={submitted ? errors.username : "Dùng chữ cái, chữ số và dấu . _ -"} slotProps={{ htmlInput: { maxLength: 100 } }} />}
    <TextField label="Tên hiển thị" required autoFocus value={name} disabled={save.isPending} onChange={(event) => { setName(event.target.value); save.reset(); }} error={submitted && Boolean(errors.display_name)} helperText={submitted && errors.display_name} slotProps={{ htmlInput: { maxLength: 200 } }} />
    <TextField label="Email" type="email" value={email} disabled={save.isPending} autoComplete="off" onChange={(event) => { setEmail(event.target.value); save.reset(); }} error={submitted && Boolean(errors.email)} helperText={submitted && errors.email} slotProps={{ htmlInput: { maxLength: 254 } }} />
    <TextField select label="Vai trò" value={role} disabled={save.isPending || ownAccount} onChange={(event) => { if (event.target.value === "ADMIN" || event.target.value === "SUPER_ADMIN") { setRole(event.target.value); setAcknowledged(false); save.reset(); } }} helperText={ownAccount ? "Không thể tự thay đổi vai trò tài khoản đang đăng nhập." : role === "SUPER_ADMIN" ? "Truy cập khu quản trị hệ thống và quản lý tài khoản Admin." : "Quản lý nghiệp vụ của đơn vị, không truy cập khu Super Admin."}><MenuItem value="ADMIN">Admin</MenuItem><MenuItem value="SUPER_ADMIN">Super Admin</MenuItem></TextField>
    {creating && <TextField label="Mật khẩu ban đầu" required type="password" value={password} disabled={save.isPending} autoComplete="new-password" onChange={(event) => { setPassword(event.target.value); save.reset(); }} error={submitted && Boolean(errors.password)} helperText={submitted && errors.password ? errors.password : "Ít nhất 12 ký tự, tối đa 72 byte. Không gửi mật khẩu qua kênh công khai."} />}
    {promoting && <FormControlLabel control={<Checkbox checked={acknowledged} disabled={save.isPending} onChange={(event) => setAcknowledged(event.target.checked)} />} label="Tôi xác nhận cấp quyền quản trị toàn hệ thống cho tài khoản này." />}
    {submitted && promoting && !acknowledged && <Alert severity="warning">Cần xác nhận phạm vi quyền Super Admin trước khi lưu.</Alert>}
    {versionConflict && <Alert severity="warning">Tài khoản đã thay đổi ở phiên khác. Đóng biểu mẫu, tải lại danh sách rồi mở lại để sửa bản mới.</Alert>}
    {save.error && <Alert severity="error">{errorMessage}{conflict && save.error instanceof ApiProblem && save.error.problem.code !== "ACCOUNT_EXISTS" && <p>Bản nháp được giữ lại. Đóng biểu mẫu và tải lại danh sách trước khi sửa tiếp.</p>}</Alert>}
  </Stack></DialogContent><DialogActions><Button disabled={save.isPending} onClick={close}>Hủy</Button><Button type="submit" variant="contained" disabled={preview || !access.can("platform.admins.manage") || save.isPending || !dirty || conflict}>{save.isPending ? "Đang lưu…" : creating ? "Tạo tài khoản" : "Lưu thay đổi"}</Button></DialogActions></form></Dialog>
    <Dialog open={discard} onClose={() => setDiscard(false)} aria-labelledby="platform-discard-title"><DialogTitle id="platform-discard-title">Bỏ các thay đổi đang nhập?</DialogTitle><DialogContent>Thông tin chưa lưu sẽ bị bỏ khi đóng biểu mẫu.</DialogContent><DialogActions><Button onClick={() => setDiscard(false)}>Tiếp tục nhập</Button><Button color="error" onClick={onClose}>Bỏ thay đổi</Button></DialogActions></Dialog>
  </>;
}

export function PlatformAccountStatusDialog({ account, onClose, onSaved }: { account: PlatformAccount; onClose: () => void; onSaved: (message: string) => void }) {
  const access = usePlatformAccess(false);
  const refresh = useRefreshPlatform();
  const save = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!access.can("platform.admins.manage") || account.id === access.user.data?.id) throw new Error("Không thể thực hiện thao tác này với tài khoản hiện tại.");
      return platformApi.updateAccount(account.id, { version: account.version, is_active: !account.is_active });
    },
    onSuccess: async () => { await refresh(); onSaved(account.is_active ? "Đã vô hiệu hóa tài khoản." : "Đã kích hoạt tài khoản."); },
  });
  const failed = save.error instanceof ApiProblem ? save.error.problem.code : "";
  return <Dialog open onClose={save.isPending ? undefined : onClose} maxWidth="xs" fullWidth aria-labelledby="platform-account-status-title"><DialogTitle id="platform-account-status-title">{account.is_active ? "Vô hiệu hóa tài khoản?" : "Kích hoạt tài khoản?"}</DialogTitle><DialogContent><p><strong>{account.display_name}</strong> ({account.username})</p><p>{account.is_active ? "Tài khoản sẽ không thể đăng nhập hoặc tiếp tục dùng phiên hiện tại. Dữ liệu đã tạo được giữ nguyên." : "Tài khoản sẽ được phép đăng nhập với vai trò và quyền hiện tại."}</p>{save.error && <Alert severity="error">{failed === "LAST_SUPER_ADMIN" ? "Không thể vô hiệu hóa Super Admin hoạt động cuối cùng." : failed === "VERSION_CONFLICT" ? "Tài khoản đã thay đổi ở phiên khác. Đóng hộp thoại và tải lại danh sách." : getSafeApiErrorMessage(save.error, "Không cập nhật được trạng thái tài khoản.")}</Alert>}</DialogContent><DialogActions><Button disabled={save.isPending} onClick={onClose}>Hủy</Button><Button variant="contained" color={account.is_active ? "error" : "primary"} disabled={save.isPending || !access.can("platform.admins.manage") || Boolean(failed)} onClick={() => save.mutate()}>{save.isPending ? "Đang cập nhật…" : account.is_active ? "Vô hiệu hóa" : "Kích hoạt"}</Button></DialogActions></Dialog>;
}
