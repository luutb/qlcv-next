import { Alert, AlertTitle } from "@mui/material";

export function LockedState({
  reason = "Dữ liệu đang bị khóa và chưa thể thay đổi.",
}: {
  reason?: string;
}) {
  return (
    <Alert severity="info" role="status">
      <AlertTitle>Dữ liệu đang bị khóa</AlertTitle>
      {reason}
    </Alert>
  );
}
