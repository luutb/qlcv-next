import { Stack, Typography } from "@mui/material";

export function NoPermissionPage({ pathname }: { pathname: string }) {
  return <Stack spacing={2}><Typography variant="h4" sx={{ fontWeight: 700 }}>Không có quyền truy cập</Typography><Typography color="text.secondary">{pathname}</Typography></Stack>;
}
