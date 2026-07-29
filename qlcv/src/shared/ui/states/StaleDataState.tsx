"use client";

import { Alert, AlertTitle, Button, Stack } from "@mui/material";

export function StaleDataState({
  message = "Dữ liệu đã thay đổi. Vui lòng tải lại trước khi tiếp tục.",
  onReload,
}: {
  message?: string;
  onReload?: () => void;
}) {
  const handleReload = onReload ?? (() => window.location.reload());

  return (
    <Alert severity="warning" role="alert">
      <AlertTitle>Dữ liệu không còn mới</AlertTitle>
      <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
        <span>{message}</span>
        <Button size="small" color="inherit" onClick={handleReload}>
          Tải lại dữ liệu
        </Button>
      </Stack>
    </Alert>
  );
}
