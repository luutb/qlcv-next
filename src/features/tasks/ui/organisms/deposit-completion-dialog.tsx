"use client";

import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { getSafeApiErrorMessage } from "@/services/http";

export function DepositCompletionDialog({ title, allowed, pending, error, onConfirm, onClose }: { title: string; allowed: boolean; pending: boolean; error: unknown; onConfirm: (amount: number) => void; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const value = Number(amount.replaceAll(".", "").replaceAll(",", "").replaceAll(" ", ""));
  const valid = /^(?:[1-9]\d*|[1-9]\d{0,2}(?:[., ]\d{3})+)$/.test(amount) && Number.isSafeInteger(value) && value > 0 && value <= 9999999999999;
  return <Dialog open onClose={() => { if (!pending) onClose(); }} fullWidth maxWidth="xs" aria-labelledby="deposit-completion-title"><DialogTitle id="deposit-completion-title">Xác nhận tiền cọc</DialogTitle><form onSubmit={event => { event.preventDefault(); if (allowed && valid && !pending) onConfirm(value); }}><DialogContent sx={{ display: "grid", gap: 2 }}><p style={{ margin: 0, fontWeight: 600, overflowWrap: "anywhere" }}>{title}</p><Alert severity={allowed ? "info" : "warning"}>{allowed ? "Nhập số tiền cọc đã nhận để hoàn thành công việc. Số tiền và người xác nhận sẽ được lưu lại." : "Kế toán hoặc quản trị viên cần xác nhận số tiền cọc trước khi công việc được hoàn thành."}</Alert><TextField autoFocus fullWidth label="Số tiền cọc đã nhận (VNĐ)" value={amount} disabled={!allowed || pending} onChange={event => setAmount(event.target.value)} slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 22 } }} error={Boolean(amount) && !valid} helperText={valid ? `${value.toLocaleString("vi-VN")} VNĐ` : "Nhập số tiền nguyên dương, ví dụ 5.000.000"} />{Boolean(error) && <Alert severity="error">{getSafeApiErrorMessage(error, "Không lưu được tiền cọc. Vui lòng thử lại.")}</Alert>}</DialogContent><DialogActions><Button disabled={pending} onClick={onClose}>Hủy</Button><Button type="submit" variant="contained" disabled={!allowed || !valid || pending}>{pending ? "Đang lưu…" : "Xác nhận và hoàn thành"}</Button></DialogActions></form></Dialog>;
}
