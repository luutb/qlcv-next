import { Alert, LinearProgress } from "@mui/material";

export type MutationStatus = "idle" | "pending" | "success" | "error";

export function MutationFeedback({
  status,
  pendingMessage = "Đang lưu thay đổi…",
  successMessage = "Đã lưu thay đổi.",
  errorMessage = "Không thể lưu thay đổi. Vui lòng thử lại.",
}: {
  status: MutationStatus;
  pendingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}) {
  if (status === "idle") {
    return null;
  }

  if (status === "pending") {
    return (
      <Alert severity="info" role="status" aria-live="polite" icon={false}>
        <LinearProgress aria-hidden="true" sx={{ mb: 1 }} />
        {pendingMessage}
      </Alert>
    );
  }

  return (
    <Alert
      severity={status === "success" ? "success" : "error"}
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
    >
      {status === "success" ? successMessage : errorMessage}
    </Alert>
  );
}
