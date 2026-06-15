import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";

export function ErrorState({
  error,
  message = "Có lỗi xảy ra",
}: {
  error?: unknown;
  message?: string;
}) {
  const debugInfo = error ? getDebugErrorInfo(error) : undefined;

  return (
    <p role="alert">
      {error ? getUserFacingErrorMessage(error) : message}
      {debugInfo ? <small> {debugInfo}</small> : null}
    </p>
  );
}
