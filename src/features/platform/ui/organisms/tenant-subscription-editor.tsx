"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { ApiProblem, getSafeApiErrorMessage } from "@/services/http";
import { platformApi } from "../../api/platform.api";
import { usePlatformAccess, usePlatformQuery, useRefreshPlatform } from "../../hooks/use-platform";
import { subscriptionStatuses, type PlatformPlan, type SubscriptionStatus, type TenantSubscription, type TenantUsage } from "../../model/tenant-contracts";
import { planPrice, subscriptionLabels, storageSize, resourceCount } from "../../model/tenant-format";
import { PlatformError } from "./platform-feedback";
import { PlatformPlanEditor } from "./platform-plan-editor";

function localTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value), pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function TenantSubscriptionEditor({ tenantId, current, usage, onClose, onSaved }: { usage: TenantUsage; tenantId: string; current: TenantSubscription | null; onClose: () => void; onSaved: () => void }) {
  const access = usePlatformAccess(false), refresh = useRefreshPlatform();
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [planNotice, setPlanNotice] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(current?.plan ?? null);
  const [base] = useState(() => ({ plan_id: current?.plan.id ?? "", status: current?.configured_status ?? "ACTIVE", start: localTime(current?.starts_at ?? new Date().toISOString()), end: localTime(current?.ends_at ?? null) }));
  const [status, setStatus] = useState<SubscriptionStatus>(base.status), [start, setStart] = useState(base.start), [end, setEnd] = useState(base.end);
  const [search, setSearch] = useState(""), [searchQuery, setSearchQuery] = useState(""), [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false), [discard, setDiscard] = useState(false), [conflict, setConflict] = useState(false);
  const [validationTime] = useState(() => Date.now());
  const query = usePlatformQuery(["plans-for-subscription", page, searchQuery], "platform.plans.read", (signal) => platformApi.plans({ page, limit: 25, q: searchQuery, is_active: "true" }, signal), false);
  const options = [ ...(selectedPlan ? [selectedPlan] : []), ...(query.data?.items.filter((plan) => plan.id !== selectedPlan?.id) ?? []) ];
  const dirty = JSON.stringify(base) !== JSON.stringify({ plan_id: selectedPlan?.id ?? "", status, start, end });
  useEffect(() => { if (!dirty) return; const warn = (event: BeforeUnloadEvent) => event.preventDefault(); window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const startMs = start ? new Date(start).getTime() : null, endMs = end ? new Date(end).getTime() : null;
  let periodError = "";
  if ((startMs !== null && !Number.isFinite(startMs)) || (endMs !== null && !Number.isFinite(endMs))) periodError = "Ngày bắt đầu hoặc kết thúc không hợp lệ.";
  else if ((status === "ACTIVE" || status === "TRIALING") && startMs === null) periodError = "Gói đang sử dụng hoặc dùng thử cần ngày bắt đầu.";
  else if (status === "TRIALING" && endMs === null) periodError = "Gói dùng thử cần ngày kết thúc.";
  else if (startMs !== null && endMs !== null && endMs <= startMs) periodError = "Ngày kết thúc phải sau ngày bắt đầu.";
  else if ((status === "ACTIVE" || status === "TRIALING") && ((startMs !== null && startMs > validationTime) || (endMs !== null && endMs <= validationTime))) periodError = "Gói đang sử dụng hoặc dùng thử phải nằm trong thời gian hiệu lực hiện tại.";
  else if (status === "EXPIRED" && (endMs === null || endMs > validationTime)) periodError = "Gói hết hạn cần ngày kết thúc đã qua.";
  const save = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!access.can("platform.tenants.manage") || !selectedPlan || periodError) throw new Error("Không thể cập nhật đăng ký gói.");
      return platformApi.assignSubscription(tenantId, { version: current?.version ?? "0", plan_id: selectedPlan.id, plan_version: selectedPlan.version, status, starts_at: start ? new Date(start).toISOString() : null, ends_at: end ? new Date(end).toISOString() : null });
    },
    onError: (error) => { if (error instanceof ApiProblem && (error.problem.code === "VERSION_CONFLICT" || error.problem.code === "PLAN_VERSION_CONFLICT")) setConflict(true); },
    onSuccess: async () => { await refresh(); onSaved(); },
  });
  const close = () => { if (!save.isPending) { if (dirty) setDiscard(true); else onClose(); } };
  return <><Dialog open fullWidth maxWidth="sm" onClose={close} aria-labelledby="tenant-subscription-editor-title"><form noValidate onSubmit={(event) => { event.preventDefault(); setSubmitted(true); if (dirty && selectedPlan && !periodError && !conflict && !save.isPending) save.mutate(); }}><DialogTitle id="tenant-subscription-editor-title">{current ? "Cập nhật gói của tenant" : "Gán gói cho tenant"}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
    {query.allowed && <div className="tenant-plan-search"><TextField label="Tìm gói để gán" size="small" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} /><Button disabled={query.isFetching || save.isPending} onClick={() => { setSearchQuery(search.trim()); setPage(1); }}>Tìm gói</Button></div>}
    {query.allowed && query.isPending && <Alert severity="info">Đang tải danh mục gói cước…</Alert>}
    {planNotice && <Alert severity="success" onClose={() => setPlanNotice("")}>{planNotice}</Alert>}
    <PlatformError error={query.error} retry={() => query.refetch()} />
    {query.allowed && !query.error && query.data?.pagination.total === 0 && <Alert severity="info">{searchQuery ? "Không có gói phù hợp với từ khóa. Thử tìm kiếm khác hoặc tạo gói mới." : "Chưa có gói cho phép gán. Tạo gói mới hoặc bật lại gói trong danh mục gói cước."}</Alert>}
    {access.can("platform.plans.manage") && <Button variant="outlined" disabled={save.isPending} onClick={() => setCreatingPlan(true)}>Tạo gói cước mới</Button>}
    <TextField select label="Gói cước" required value={selectedPlan?.id ?? ""} disabled={save.isPending} onChange={(event) => { const plan = options.find((item) => item.id === event.target.value); if (plan) { setSelectedPlan(plan); save.reset(); } }} error={submitted && !selectedPlan} helperText={submitted && !selectedPlan ? "Chọn gói trước khi lưu." : "Gói ngừng gán mới chỉ có thể giữ lại cho đăng ký đã sử dụng gói đó."}><MenuItem value="">Chọn gói cước</MenuItem>{options.map((plan) => <MenuItem key={plan.id} value={plan.id}>{plan.name} · {plan.code}{!plan.is_active ? " (ngừng gán mới)" : ""}</MenuItem>)}</TextField>
    {query.data && query.data.pagination.total > 25 && <div className="tenant-option-pagination"><Button disabled={page <= 1 || query.isFetching || save.isPending} onClick={() => setPage(page - 1)}>Trước</Button><span>Trang {page}</span><Button disabled={page * 25 >= query.data.pagination.total || query.isFetching || save.isPending} onClick={() => setPage(page + 1)}>Sau</Button></div>}
    {!query.allowed && <Alert severity="info">Bạn không có quyền đọc danh mục gói. Có thể giữ gói hiện tại và chỉnh trạng thái nếu được cấp quyền quản lý tenant.</Alert>}
    {selectedPlan && <div className="tenant-subscription-price"><strong>{planPrice(selectedPlan.price_amount, selectedPlan.currency)}</strong>{selectedPlan.billing_interval && <span>/{selectedPlan.billing_interval === "MONTHLY" ? "tháng" : "năm"}</span>}</div>}
    {selectedPlan && <section aria-label="Xem trước hạn mức của tenant"><h3>Sau khi áp dụng {selectedPlan.name}</h3><p>Số đang dùng / hạn mức gói được chọn. Chưa lưu thay đổi.</p><dl className="platform-detail-list">{[
      { label: "Thành viên", used: usage.members_total, limit: selectedPlan.limits.members, format: resourceCount },
      { label: "Dự án", used: usage.projects_total, limit: selectedPlan.limits.projects, format: resourceCount },
      { label: "Lưu trữ đã ghi nhận", used: usage.storage.recorded_bytes, limit: selectedPlan.limits.storage_bytes, format: storageSize },
    ].map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.format(item.used)} / {item.limit === null ? "Không giới hạn" : item.format(item.limit)}{item.used !== null && item.limit !== null && item.used > item.limit ? " — Vượt hạn mức gói được chọn" : ""}</dd></div>)}</dl>{!usage.storage.is_complete && <Alert severity="warning">Dung lượng chưa đo đầy đủ; số ghi nhận có thể thấp hơn thực tế.</Alert>}<Alert severity="info">Gán gói cập nhật quyền tính năng và hạn mức. Dữ liệu cũ được giữ; thao tác tạo thêm sẽ bị chặn khi vượt mức.</Alert></section>}
    <TextField select label="Trạng thái đăng ký" value={status} disabled={save.isPending} onChange={(event) => { const value = subscriptionStatuses.find((item) => item === event.target.value); if (value) { setStatus(value); save.reset(); } }}>{subscriptionStatuses.map((value) => <MenuItem key={value} value={value}>{subscriptionLabels[value]}</MenuItem>)}</TextField>
    <TextField label="Ngày bắt đầu" type="datetime-local" value={start} disabled={save.isPending} onChange={(event) => { setStart(event.target.value); save.reset(); }} slotProps={{ inputLabel: { shrink: true } }} />
    <TextField label="Ngày kết thúc" type="datetime-local" value={end} disabled={save.isPending} onChange={(event) => { setEnd(event.target.value); save.reset(); }} slotProps={{ inputLabel: { shrink: true } }} />
    {submitted && periodError && <Alert severity="warning">{periodError}</Alert>}
    <Alert severity="info">Thao tác này cập nhật quyền và hạn mức của tenant. Chưa tạo hóa đơn hoặc thu tiền tự động.</Alert>
    {conflict && <Alert severity="warning">Đăng ký hoặc gói được chọn đã thay đổi ở phiên khác. Bản nháp đang được giữ lại; đóng biểu mẫu và tải bản mới trước khi cập nhật.</Alert>}
    {save.error && <Alert severity="error">{save.error instanceof ApiProblem && save.error.problem.code === "PLAN_INACTIVE" ? "Gói này đã ngừng gán mới. Hãy chọn gói khác." : save.error instanceof ApiProblem && save.error.problem.code === "INVALID_SUBSCRIPTION_PERIOD" ? "Thời gian hiệu lực không phù hợp với trạng thái đăng ký." : getSafeApiErrorMessage(save.error, "Không cập nhật được gói của tenant.")}</Alert>}
  </Stack></DialogContent><DialogActions><Button disabled={save.isPending} onClick={close}>Hủy</Button><Button type="submit" variant="contained" disabled={!access.can("platform.tenants.manage") || save.isPending || conflict || !dirty}>{save.isPending ? "Đang lưu…" : "Lưu đăng ký"}</Button></DialogActions></form></Dialog><Dialog open={discard} onClose={() => setDiscard(false)} aria-labelledby="tenant-subscription-discard-title"><DialogTitle id="tenant-subscription-discard-title">Bỏ thay đổi đăng ký gói?</DialogTitle><DialogContent>Bản nháp chưa lưu sẽ bị bỏ.</DialogContent><DialogActions><Button onClick={() => setDiscard(false)}>Tiếp tục nhập</Button><Button color="error" onClick={onClose}>Bỏ thay đổi</Button></DialogActions></Dialog>{creatingPlan && <PlatformPlanEditor preview={false} onClose={() => setCreatingPlan(false)} onSaved={(_message, plan) => { setCreatingPlan(false); setPlanNotice(plan.is_active ? "Đã tạo và chọn gói mới. Lưu đăng ký để gán gói cho tenant." : "Đã tạo gói ở trạng thái ngừng gán mới. Bật cho phép gán trong danh mục để sử dụng gói này."); if (plan.is_active) { setSelectedPlan(plan); save.reset(); } }} />}</>;
}
