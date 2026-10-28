"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { ApiProblem, createIdempotencyKey, getSafeApiErrorMessage } from "@/services/http";
import { platformApi } from "../../api/platform.api";
import { usePlatformAccess, usePlatformQuery, useRefreshPlatform } from "../../hooks/use-platform";
import type { PlatformPlan, TenantDetail } from "../../model/tenant-contracts";
import { PlatformError } from "./platform-feedback";

export function TenantCreationDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (tenant: TenantDetail) => void }) {
  const access = usePlatformAccess(false), refresh = useRefreshPlatform();
  const key = useRef(createIdempotencyKey());
  const formRef = useRef<HTMLFormElement>(null);
  const [created, setCreated] = useState<TenantDetail | null>(null);
  const [plan, setPlan] = useState<PlatformPlan | null>(null);
  const plans = usePlatformQuery(["tenant-create-plans"], "platform.plans.read", (signal) => platformApi.plans({ page: 1, limit: 100, q: "", is_active: "true" }, signal), false);
  const create = useMutation({ retry: false, mutationFn: async () => {
    if (!access.can("platform.tenants.manage")) throw new Error("Bạn không có quyền thêm tenant.");
    const form = formRef.current;
    if (!form) throw new Error("Biểu mẫu đã đóng.");
    const values = new FormData(form);
    const input = { name: String(values.get("name") ?? "").trim(), slug: String(values.get("slug") ?? "").trim().toLowerCase(), email: String(values.get("email") ?? "").trim(), phone: String(values.get("phone") ?? "").trim(), address: String(values.get("address") ?? "").trim(), admin: { username: String(values.get("admin_username") ?? "").trim(), display_name: String(values.get("admin_name") ?? "").trim(), email: String(values.get("admin_email") ?? "").trim() || null, password: String(values.get("admin_password") ?? "") }, plan_id: plan?.id ?? null, ...(plan ? { plan_version: plan.version } : {}) };
    return platformApi.createTenant(input, key.current);
  }, onSuccess: async (tenant) => { const password = formRef.current?.elements.namedItem("admin_password"); if (password instanceof HTMLInputElement) password.value = ""; setCreated(tenant); await refresh(); }, onError: () => { /* The same idempotency key is retained for safe retries. */ } });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!create.isPending && access.can("platform.tenants.manage")) create.mutate(); };
  const code = create.error instanceof ApiProblem ? create.error.problem.code : "";
  const error = code === "TENANT_SLUG_EXISTS" ? "Mã tenant đã được sử dụng. Hãy chọn mã khác." : code === "IDEMPOTENCY_CONFLICT" ? "Yêu cầu đã thay đổi sau lần gửi trước. Đóng biểu mẫu và tạo lại." : code === "PLAN_INACTIVE" || code === "PLAN_VERSION_CONFLICT" ? "Gói đã thay đổi. Tải lại biểu mẫu và chọn lại gói." : create.error ? getSafeApiErrorMessage(create.error, "Không thể tạo tenant. Có thể thử lại an toàn.") : "";
  if (created) return <Dialog open fullWidth maxWidth="sm" onClose={() => onCreated(created)} aria-labelledby="tenant-created-title">
    <DialogTitle id="tenant-created-title">Đã tạo tenant và tài khoản Admin</DialogTitle>
    <DialogContent><Stack spacing={2}>
      <Alert severity="success">{created.name} đã sẵn sàng đăng nhập.</Alert>
      <Typography>Gửi thông tin sau cùng mật khẩu ban đầu cho Admin qua kênh riêng. Hệ thống chưa gửi email mời tự động.</Typography>
      <TextField label="Trang đăng nhập" value="/login" slotProps={{ input: { readOnly: true } }} />
      <TextField label="Mã đơn vị" value={created.slug} slotProps={{ input: { readOnly: true } }} />
      {created.admins.map((admin) => <TextField key={admin.id} label="Tên đăng nhập Admin" value={admin.username} slotProps={{ input: { readOnly: true } }} />)}
      <Alert severity="info">Mật khẩu ban đầu đã được xóa khỏi biểu mẫu. Admin dùng mã đơn vị, tên đăng nhập và mật khẩu đã thiết lập để đăng nhập.</Alert>
      {!created.subscription && <Alert severity="warning">Tenant chưa được gán gói. Admin đăng nhập được, nhưng cần gán gói có hiệu lực để sử dụng nghiệp vụ.</Alert>}
    </Stack></DialogContent>
    <DialogActions><Button variant="contained" onClick={() => onCreated(created)}>Xem tenant</Button></DialogActions>
  </Dialog>;
  return <Dialog open fullWidth maxWidth="sm" onClose={() => !create.isPending && onClose()} aria-labelledby="create-tenant-title"><form ref={formRef} onSubmit={submit}>
    <DialogTitle id="create-tenant-title">Thêm tenant và Admin đầu tiên</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <Typography component="h3" variant="subtitle1">Thông tin đơn vị</Typography>
      <TextField name="name" label="Tên đơn vị" required autoFocus disabled={create.isPending} slotProps={{ htmlInput: { maxLength: 200 } }} />
      <TextField name="slug" label="Mã đơn vị đăng nhập" required helperText="3–63 ký tự thường, số hoặc dấu gạch nối." disabled={create.isPending} slotProps={{ htmlInput: { minLength: 3, maxLength: 63, pattern: "[a-z][a-z0-9-]{2,62}" } }} />
      <TextField name="email" label="Email liên hệ" type="email" disabled={create.isPending} />
      <TextField name="phone" label="Điện thoại" disabled={create.isPending} slotProps={{ htmlInput: { maxLength: 40 } }} />
      <TextField name="address" label="Địa chỉ" multiline minRows={2} disabled={create.isPending} slotProps={{ htmlInput: { maxLength: 500 } }} />
      <Typography component="h3" variant="subtitle1">Tài khoản Admin đầu tiên (bắt buộc)</Typography>
      <Alert severity="info">Tenant bắt đầu với vùng dữ liệu riêng và một tài khoản Admin. Dữ liệu hiện có không được sao chép.</Alert>
      <TextField name="admin_username" label="Tên đăng nhập Admin" helperText="3–100 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch nối." autoComplete="off" required disabled={create.isPending} slotProps={{ htmlInput: { minLength: 3, maxLength: 100, pattern: "[a-zA-Z0-9_.-]{3,100}" } }} />
      <TextField name="admin_name" label="Tên Admin" required disabled={create.isPending} slotProps={{ htmlInput: { maxLength: 200 } }} />
      <TextField name="admin_email" label="Email Admin" type="email" disabled={create.isPending} />
      <TextField name="admin_password" label="Mật khẩu ban đầu" type="password" required autoComplete="new-password" helperText="Tối thiểu 12 ký tự. Ghi nhận để bàn giao riêng cho Admin; mật khẩu sẽ được xóa khỏi biểu mẫu sau khi tạo." disabled={create.isPending} slotProps={{ htmlInput: { minLength: 12, maxLength: 72 } }} />
      {plans.allowed && <TextField select label="Gói sử dụng (không bắt buộc)" value={plan?.id ?? ""} disabled={create.isPending || plans.isPending} onChange={(event) => setPlan(plans.data?.items.find((item) => item.id === event.target.value) ?? null)}><MenuItem value="">Chưa gán gói</MenuItem>{plans.data?.items.map((item) => <MenuItem key={item.id} value={item.id}>{item.name} · {item.code}</MenuItem>)}</TextField>}
      {plans.allowed && plans.error && <PlatformError error={plans.error} retry={() => plans.refetch()} />}
      {!plans.allowed && <Alert severity="info">Bạn chưa có quyền xem danh mục gói; tenant sẽ được tạo chưa gán gói.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </Stack></DialogContent>
    <DialogActions><Button disabled={create.isPending} onClick={onClose}>Hủy</Button><Button type="submit" variant="contained" disabled={!access.can("platform.tenants.manage") || create.isPending}>{create.isPending ? "Đang tạo tenant…" : "Tạo tenant và Admin"}</Button></DialogActions>
  </form></Dialog>;
}
