"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { ProjectBoardCard } from "@/api/projects.api";
import type { WorkflowFinancialBlockedDetails } from "@/api/errors";
import { formatCurrency } from "./workflow-board.utils";

export type PaymentRequiredFormValues = {
  incoming_payment_confirmation: number;
  payment_method: string;
  payment_note?: string;
};

type PaymentRequiredModalProps = {
  open: boolean;
  project?: ProjectBoardCard | null;
  targetStepKey?: string | null;
  details?: WorkflowFinancialBlockedDetails | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: PaymentRequiredFormValues) => void;
};

export function PaymentRequiredModal({
  open,
  project,
  targetStepKey,
  details,
  loading,
  onCancel,
  onSubmit,
}: PaymentRequiredModalProps) {
  const [formValues, setFormValues] = useState<PaymentRequiredFormValues>({
    incoming_payment_confirmation: details?.incoming_payment_confirmation ?? 0,
    payment_method: "BANK_TRANSFER",
    payment_note: "",
  });

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Cần xác nhận thanh toán</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="warning">
            Backend chặn chuyển bước vì bước đích cần điều kiện thanh toán.
          </Alert>

          <Typography color="text.secondary">
            Project <strong>{project?.name}</strong> sẽ được chuyển tới{" "}
            <strong>{targetStepKey ?? "step đã chọn"}</strong> sau khi xác nhận tiền.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Số tiền cần thu
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatCurrency(details?.required_amount)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Đã thu hiện tại
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatCurrency(details?.current_paid)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Số tiền backend gợi ý
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {formatCurrency(details?.incoming_payment_confirmation)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tổng sau xác nhận
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatCurrency(details?.new_total_paid)}</Typography>
            </Box>
          </Box>

          <TextField
            label="Số tiền xác nhận"
            type="number"
            value={formValues.incoming_payment_confirmation}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                incoming_payment_confirmation: Number(event.target.value),
              }))
            }
            fullWidth
          />
          <TextField
            select
            label="Phương thức thanh toán"
            value={formValues.payment_method}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                payment_method: event.target.value,
              }))
            }
            fullWidth
          >
            <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
            <MenuItem value="CASH">Tiền mặt</MenuItem>
            <MenuItem value="CARD">Thẻ</MenuItem>
            <MenuItem value="OTHER">Khác</MenuItem>
          </TextField>
          <TextField
            label="Ghi chú"
            value={formValues.payment_note ?? ""}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                payment_note: event.target.value,
              }))
            }
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formValues)}
          disabled={loading}
        >
          Xác nhận và chuyển bước
        </Button>
      </DialogActions>
    </Dialog>
  );
}
