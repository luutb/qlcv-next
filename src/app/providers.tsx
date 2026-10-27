"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createQueryClient } from "@/services/query";
import { qlcvTheme } from "@/shared/theme/theme";
import { useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { SessionGuard } from "@/features/auth";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(createQueryClient);

  return <AppRouterCacheProvider><ThemeProvider theme={qlcvTheme}><CssBaseline /><QueryClientProvider client={queryClient}><SessionGuard>{children}</SessionGuard></QueryClientProvider></ThemeProvider></AppRouterCacheProvider>;
}
