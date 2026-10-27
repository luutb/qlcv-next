"use client";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { archiveCustomer, restoreCustomer, customerQueryKeys, type Customer } from "../../api/customers.api";
import { customerError } from "../../model/customer-feedback";

export function CustomerStatusDialog({ customer, onClose, onSaved }: { customer: Customer; onClose: () => void; onSaved: (message: string) => void }) {
  const token = useAccessToken(); const user = useCurrentUserQuery(); const client = useQueryClient();
  const allowed = hasAuthorizedAction(user.data, "customers.manage");
  const save = useMutation({
    mutationFn: () => { if (!token || !allowed) throw new Error("Không có quyền quản lý khách hàng."); return customer.is_deleted ? restoreCustomer({ accessToken: token }, customer.id) : archiveCustomer({ accessToken: token }, customer.id); },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: customerQueryKeys.all }); onSaved(customer.is_deleted ? "Đã khôi phục khách hàng." : "Đã lưu trữ khách hàng. Bật ‘Hiện khách hàng đã lưu trữ’ để xem hoặc khôi phục."); onClose(); },
  });
  return <Dialog className="directory-dialog" open fullWidth maxWidth="sm" onClose={save.isPending ? undefined : onClose} aria-labelledby="customer-status-title">
    <DialogTitle id="customer-status-title">{customer.is_deleted ? "Khôi phục khách hàng?" : "Lưu trữ khách hàng?"}</DialogTitle>
    <DialogContent><p><strong>{customer.name}</strong></p><p>{customer.is_deleted ? "Khách hàng sẽ xuất hiện lại trong danh sách hoạt động." : "Thông tin khách hàng được giữ lại và có thể khôi phục. Khách hàng đã gắn với công việc có thể bị chặn lưu trữ."}</p>{save.error && <Alert severity="error">{customerError(save.error, "Không đổi được trạng thái khách hàng.")}</Alert>}</DialogContent>
    <DialogActions><Button disabled={save.isPending} onClick={onClose}>Hủy</Button><Button variant="contained" color={customer.is_deleted ? "primary" : "warning"} disabled={!allowed || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Đang lưu…" : customer.is_deleted ? "Khôi phục" : "Lưu trữ"}</Button></DialogActions>
  </Dialog>;
}
