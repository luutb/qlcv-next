"use client";

import { useState } from "react";
import { MenuItem, Stack, TextField } from "@mui/material";

export function PlanQuotaField({ label, value, options, storage = false, disabled, error, onChange }: {
  label: string; value: string; options: number[]; storage?: boolean; disabled: boolean;
  error?: string; onChange: (value: string) => void;
}) {
  const [custom, setCustom] = useState(false);
  const selection = custom || (value !== "" && !options.some((option) => String(option) === value)) ? "custom" : value;
  return <Stack spacing={1}>
    <TextField select label={label} value={selection} disabled={disabled} error={Boolean(error)}
      helperText={error || (storage ? "1 GB = 1.024³ byte; để trống nghĩa là không giới hạn." : "Chọn hạn mức hoặc nhập số riêng.")}
      onChange={(event) => { const next = event.target.value; setCustom(next === "custom"); if (next !== "custom") onChange(next); }}>
      <MenuItem value="">Không giới hạn</MenuItem>
      {options.map((option) => <MenuItem key={option} value={String(option)}>{option.toLocaleString("vi-VN")}{storage ? " GB" : ""}</MenuItem>)}
      <MenuItem value="custom">Nhập giá trị khác</MenuItem>
    </TextField>
    {selection === "custom" && <TextField label={`${label} — giá trị riêng`} type="number" value={value} disabled={disabled}
      error={Boolean(error)} helperText={error || "0 là hạn mức bằng 0; để trống nghĩa là không giới hạn."}
      onChange={(event) => onChange(event.target.value)} slotProps={{ htmlInput: { min: 0, step: storage ? "any" : 1 } }} />}
  </Stack>;
}
