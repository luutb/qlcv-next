"use client";

import { Alert, AlertTitle, Button, Stack } from "@mui/material";

export function StaleDataState({
  message = "Dữ liệu đã thay đổi. Vui lòng tải lại trước khi tiếp tục.",
  onReload,
}: {
  message?: string;
  onReload?: () => void;
}) {
  return (
    <Alert severity="warning" role="alert">
      <AlertTitle>Dữ liệu không còn mới</AlertTitle>
      <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
        <span>{message}</span>
        {onReload ? (
          <Button size="small" color="inherit" onClick={onReload}>
            Tải lại dữ liệu
          </Button>
        ) : null}
      </Stack>
    </Alert>
  );
}
