"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField } from "@mui/material";
import { ApiProblem, createIdempotencyKey, getSafeApiErrorMessage } from "@/services/http";
import { platformApi } from "../../api/platform.api";
import { usePlatformAccess, useRefreshPlatform } from "../../hooks/use-platform";
import type { PlatformPlan } from "../../model/tenant-contracts";
import { planDraft, validatePlanDraft, type PlanDraft } from "../../model/plan-draft";

import { planPresets, quotaChoices } from "../../model/plan-presets";
import { PLAN_FEATURES } from "../../model/plan-features";
import { PlanQuotaField } from "./plan-quota-field";

export function PlatformPlanEditor({ plan, preview, onClose, onSaved }: { plan?: PlatformPlan; preview: boolean; onClose: () => void; onSaved: (message: string, saved: PlatformPlan) => void }) {
  const access = usePlatformAccess(preview), refresh = useRefreshPlatform();
  const [base] = useState(() => planDraft(plan)), [draft, setDraft] = useState(base);
  const [submitted, setSubmitted] = useState(false), [discard, setDiscard] = useState(false), [conflict, setConflict] = useState(false);
  const [key] = useState(createIdempotencyKey);
  const dirty = JSON.stringify(base) !== JSON.stringify(draft), validated = validatePlanDraft(draft);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const save = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!access.can("platform.plans.manage") || !validated.input) throw new Error("Không thể lưu cấu hình gói cước.");
      return plan ? platformApi.updatePlan(plan.id, { ...validated.input, version: plan.version }) : platformApi.createPlan(validated.input, key);
    },
    onError: (error) => { if (error instanceof ApiProblem && error.problem.code === "VERSION_CONFLICT") setConflict(true); },
    onSuccess: async (saved) => { await refresh(); onSaved(plan ? "Đã cập nhật gói cước." : "Đã tạo gói cước.", saved); },
  });
  const update = <K extends keyof PlanDraft>(field: K, value: PlanDraft[K]) => { setDraft({ ...draft, [field]: value }); save.reset(); };
  const close = () => { if (!save.isPending) { if (dirty) setDiscard(true); else onClose(); } };
  return <><Dialog open fullWidth maxWidth="md" onClose={close} aria-labelledby="platform-plan-editor-title"><form noValidate onSubmit={(event) => { event.preventDefault(); setSubmitted(true); if (!preview && !save.isPending && !conflict && dirty && validated.input) save.mutate(); }}><DialogTitle id="platform-plan-editor-title">{plan ? "Chỉnh sửa gói cước" : "Tạo gói cước"}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
    {preview && <Alert severity="info">Biểu mẫu xem trước. Không gửi hoặc lưu thay đổi.</Alert>}
    {!plan && <TextField select label="Điền nhanh từ mẫu gói" value="" disabled={save.isPending} helperText="Mẫu tham khảo, chưa đặt phí. Chọn mẫu rồi chỉnh thông tin và nhấn Tạo gói để lưu." onChange={(event) => { const preset = planPresets.find((item) => item.code === event.target.value); if (preset) { setDraft({ ...draft, ...preset }); save.reset(); } }}><MenuItem value="">Chọn mẫu gói</MenuItem>{planPresets.map((preset) => <MenuItem key={preset.code} value={preset.code}>{preset.name} · {preset.members} người · {preset.projects} dự án · {preset.storage_gb} GB</MenuItem>)}</TextField>}
    <div className="platform-form-grid"><TextField required label="Mã gói" value={draft.code} onChange={(event) => update("code", event.target.value.toUpperCase())} disabled={save.isPending} error={submitted && Boolean(validated.errors.code)} helperText={submitted ? validated.errors.code : "Mã định danh duy nhất của gói."} slotProps={{ htmlInput: { maxLength: 64 } }} /><TextField required label="Tên gói" value={draft.name} onChange={(event) => update("name", event.target.value)} disabled={save.isPending} error={submitted && Boolean(validated.errors.name)} helperText={submitted && validated.errors.name} slotProps={{ htmlInput: { maxLength: 200 } }} /></div>
    <TextField label="Mô tả" multiline minRows={2} value={draft.description} onChange={(event) => update("description", event.target.value)} disabled={save.isPending} error={submitted && Boolean(validated.errors.description)} helperText={submitted && validated.errors.description} slotProps={{ htmlInput: { maxLength: 2000 } }} />
    <FormControlLabel control={<Checkbox checked={draft.priced} onChange={(event) => update("priced", event.target.checked)} disabled={save.isPending} />} label="Cấu hình phí niêm yết" />
    {draft.priced && <div className="platform-form-grid"><TextField label="Phí niêm yết" required value={draft.price} onChange={(event) => update("price", event.target.value)} disabled={save.isPending} error={submitted && Boolean(validated.errors.price)} helperText={submitted ? validated.errors.price : "Dùng dấu chấm cho phần thập phân."} slotProps={{ htmlInput: { inputMode: "decimal", maxLength: 19 } }} /><TextField label="Tiền tệ" required value={draft.currency} onChange={(event) => update("currency", event.target.value.toUpperCase())} disabled={save.isPending} error={submitted && Boolean(validated.errors.currency)} helperText={submitted && validated.errors.currency} slotProps={{ htmlInput: { maxLength: 3 } }} /><TextField select label="Chu kỳ" value={draft.interval} disabled={save.isPending} onChange={(event) => { if (event.target.value === "MONTHLY" || event.target.value === "YEARLY") update("interval", event.target.value); }}><MenuItem value="MONTHLY">Theo tháng</MenuItem><MenuItem value="YEARLY">Theo năm</MenuItem></TextField></div>}
    <fieldset><legend>Tính năng được sử dụng trong gói</legend>
    {plan && !plan.features_configured && <Alert severity="warning">Gói cũ chưa được cấu hình tính năng. Chọn các tính năng rồi lưu để kích hoạt quyền cho tenant đang dùng gói.</Alert>}
    <div className="platform-form-grid">{PLAN_FEATURES.map(({ key: feature, label }) => <FormControlLabel key={feature} control={<Checkbox checked={draft.features.includes(feature)} disabled={save.isPending} onChange={(event) => update("features", event.target.checked ? [...draft.features, feature] : draft.features.filter((item) => item !== feature))} />} label={label} />)}</div>
    {submitted && validated.errors.features && <Alert severity="error">{validated.errors.features}</Alert>}</fieldset>
    <Alert severity="info">Gói giới hạn tính năng; từng tài khoản vẫn phải có quyền vai trò tương ứng. Hợp đồng cần cả Công việc và Tài chính. Không chọn tính năng nào nghĩa là gói không cấp quyền nghiệp vụ.</Alert>
    <h3 className="platform-form-section-title">Hạn mức sử dụng</h3><div className="platform-form-grid">{([{ key: "members", label: "Số thành viên tối đa" }, { key: "projects", label: "Số dự án tối đa" }, { key: "storage_gb", label: "Dung lượng lưu trữ tối đa (GB)" }] as const).map(({ key: field, label }) => <PlanQuotaField key={field} label={label} value={draft[field]} options={quotaChoices[field]} storage={field === "storage_gb"} onChange={(value) => update(field, value)} disabled={save.isPending} error={submitted ? validated.errors[field] : undefined} />)}</div>
    <FormControlLabel control={<Checkbox checked={draft.is_active} onChange={(event) => update("is_active", event.target.checked)} disabled={save.isPending} />} label="Cho phép gán gói này cho tenant" />
    <Alert severity="info">Lưu gói không phát sinh thu tiền. Quyền tính năng và hạn mức được áp dụng cho tenant đang dùng gói; hạ hạn mức không xóa dữ liệu cũ nhưng chặn tạo thêm khi vượt mức. Ngừng gán mới không hủy đăng ký hiện có.</Alert>
    {conflict && <Alert severity="warning">Gói cước đã được sửa ở phiên khác. Bản nháp đang được giữ lại; đóng biểu mẫu, tải danh sách mới rồi mở lại để sửa.</Alert>}
    {save.error && <Alert severity="error">{save.error instanceof ApiProblem && save.error.problem.code === "PLAN_CODE_EXISTS" ? "Mã gói đã tồn tại. Hãy dùng mã khác." : getSafeApiErrorMessage(save.error, "Không lưu được gói cước.")}</Alert>}
  </Stack></DialogContent><DialogActions><Button disabled={save.isPending} onClick={close}>Hủy</Button><Button type="submit" variant="contained" disabled={preview || !access.can("platform.plans.manage") || save.isPending || conflict || !dirty}>{save.isPending ? "Đang lưu…" : plan ? "Lưu thay đổi" : "Tạo gói"}</Button></DialogActions></form></Dialog><Dialog open={discard} onClose={() => setDiscard(false)} aria-labelledby="platform-plan-discard-title"><DialogTitle id="platform-plan-discard-title">Bỏ bản nháp gói cước?</DialogTitle><DialogContent>Thông tin chưa lưu sẽ bị bỏ khi đóng biểu mẫu.</DialogContent><DialogActions><Button onClick={() => setDiscard(false)}>Tiếp tục nhập</Button><Button color="error" onClick={onClose}>Bỏ thay đổi</Button></DialogActions></Dialog></>;
}
