import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingState({ message = "Đang tải dữ liệu…" }: { message?: string }) {
  return (
    <Box role="status" aria-live="polite" sx={{ py: 4, px: 2 }}>
      <Stack spacing={1.5} sx={{ alignItems: "center" }}>
        <CircularProgress size={28} aria-hidden="true" />
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    </Box>
  );
}
