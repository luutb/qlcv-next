"use client";

import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { createCustomer, updateCustomer, customerQueryKeys, type Customer, type CustomerRequest } from "../../api/customers.api";
import { customerError } from "../../model/customer-feedback";

export const customerFields = [
  ["name", "Tên khách hàng", 255], ["company_name", "Công ty / Tổ chức", 255], ["tax_code", "Mã số thuế", 50],
  ["id_number", "Số giấy tờ định danh", 50], ["contact_email", "Email", 255], ["contact_phone", "Điện thoại", 20], ["address", "Địa chỉ", 500], ["note", "Ghi chú", 2000],
] as const;

export function CustomerEditor({ customer, onClose, onSaved }: { customer?: Customer; onClose: () => void; onSaved: (message: string) => void }) {
  const [draft, setDraft] = useState<CustomerRequest>({ name: customer?.name ?? "", company_name: customer?.company_name ?? "", tax_code: customer?.tax_code ?? "", id_number: customer?.id_number ?? "", contact_email: customer?.contact_email ?? "", contact_phone: customer?.contact_phone ?? "", address: customer?.address ?? "", note: customer?.note ?? "" });
  const token = useAccessToken(); const user = useCurrentUserQuery(); const client = useQueryClient();
  const canManage = Boolean(token && hasAuthorizedAction(user.data, "customers.manage") && !customer?.is_deleted);
  const save = useMutation({
    mutationFn: () => {
      if (!token || !canManage) throw new Error("Không có quyền sửa khách hàng.");
      const input = { ...draft };
      for (const [key] of customerFields) { const value = draft[key]?.trim() ?? ""; if (key === "name") input.name = value; else input[key] = value || null; }
      return customer ? updateCustomer({ accessToken: token }, customer.id, input) : createCustomer({ accessToken: token }, input);
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: customerQueryKeys.all }); onSaved(customer ? "Đã cập nhật khách hàng." : "Đã thêm khách hàng."); onClose(); },
  });
  return <Dialog className="directory-dialog" open fullWidth maxWidth="sm" onClose={save.isPending ? undefined : onClose} aria-labelledby="customer-editor-title">
    <form onSubmit={(event) => { event.preventDefault(); if (canManage && draft.name.trim() && !save.isPending) save.mutate(); }}>
      <DialogTitle id="customer-editor-title">{customer ? "Sửa khách hàng" : "Thêm khách hàng"}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        {save.error && <Alert severity="error">{customerError(save.error, "Không lưu được khách hàng. Kiểm tra thông tin rồi thử lại.")}</Alert>}
        {!canManage && <Alert severity="warning">Bạn không có quyền sửa hoặc khách hàng đã được lưu trữ.</Alert>}
        {customerFields.map(([key, label, maxLength]) => <TextField key={key} label={label} autoFocus={key === "name"} required={key === "name"} type={key === "contact_email" ? "email" : key === "contact_phone" ? "tel" : "text"} multiline={key === "note" || key === "address"} minRows={key === "note" ? 3 : undefined} value={draft[key] ?? ""} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} slotProps={{ htmlInput: { maxLength } }} disabled={!canManage || save.isPending} />)}
      </Stack></DialogContent>
      <DialogActions><Button disabled={save.isPending} onClick={onClose}>Hủy</Button><Button type="submit" variant="contained" disabled={!canManage || !draft.name.trim() || save.isPending}>{save.isPending ? "Đang lưu…" : "Lưu khách hàng"}</Button></DialogActions>
    </form>
  </Dialog>;
}
