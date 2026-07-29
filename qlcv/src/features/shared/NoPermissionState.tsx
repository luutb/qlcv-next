import { Alert, AlertTitle } from "@mui/material";

export function NoPermissionState({
  message = "Bạn không có quyền truy cập nội dung này.",
}: {
  message?: string;
}) {
  return (
    <Alert severity="warning" role="alert">
      <AlertTitle>Không có quyền truy cập</AlertTitle>
      {message}
    </Alert>
  );
}
