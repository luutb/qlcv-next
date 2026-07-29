import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

export function EmptyState({
  message = "Không có dữ liệu",
  description,
  action,
}: {
  message?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Box role="status" sx={{ py: 4, px: 2, textAlign: "center" }}>
      <Stack spacing={1.5} sx={{ alignItems: "center" }}>
        <Typography variant="h6">{message}</Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
        {action}
      </Stack>
    </Box>
  );
}
