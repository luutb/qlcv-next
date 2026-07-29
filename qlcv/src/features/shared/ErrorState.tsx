"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";
import { getApiErrorCode, getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { LockedState } from "./LockedState";
import { NoPermissionState } from "./NoPermissionState";
import { StaleDataState } from "./StaleDataState";

export function ErrorState({
  error,
  message = "Có lỗi xảy ra",
  onRetry,
}: {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
}) {
  const code = error ? getApiErrorCode(error) : undefined;
  const resolvedMessage = error ? getUserFacingErrorMessage(error) : message;
  const debugInfo =
    process.env.NODE_ENV !== "production" && error ? getDebugErrorInfo(error) : undefined;

  if (code === "FORBIDDEN") {
    return <NoPermissionState message={resolvedMessage} />;
  }

  if (code === "LOCKED") {
    return <LockedState reason={resolvedMessage} />;
  }

  if (code === "VERSION_CONFLICT") {
    return <StaleDataState message={resolvedMessage} onReload={onRetry} />;
  }

  return (
    <Alert severity="error" role="alert">
      <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
        <Typography>{resolvedMessage}</Typography>
        {debugInfo ? <Typography variant="caption">{debugInfo}</Typography> : null}
        {onRetry ? (
          <Button size="small" color="inherit" onClick={onRetry}>
            Thử lại
          </Button>
        ) : null}
      </Stack>
    </Alert>
  );
}
