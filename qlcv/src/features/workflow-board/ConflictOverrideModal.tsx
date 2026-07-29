"use client";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import type { ProjectBoardCard } from "@/api/projects.api";

type ConflictOverrideModalProps = {
  open: boolean;
  project?: ProjectBoardCard | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (overrideJustification: string) => void;
};

export function ConflictOverrideModal({
  open,
  project,
  loading,
  onCancel,
  onSubmit,
}: ConflictOverrideModalProps) {
  const [overrideJustification, setOverrideJustification] = useState("");

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Ghi đè conflict</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="error">
            Thao tác nhạy cảm audit. Chỉ ghi đè conflict khi đã có cơ sở nghiệp vụ rõ ràng.
          </Alert>
          <Typography color="text.secondary">
            Project: <strong>{project?.name}</strong>
          </Typography>
          <TextField
            label="Lý do ghi đè"
            multiline
            minRows={5}
            value={overrideJustification}
            onChange={(event) => setOverrideJustification(event.target.value)}
            helperText="Tối thiểu 50 ký tự."
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          variant="contained"
          color="error"
          disabled={loading}
          onClick={() => onSubmit(overrideJustification)}
        >
          Ghi đè conflict
        </Button>
      </DialogActions>
    </Dialog>
  );
}
