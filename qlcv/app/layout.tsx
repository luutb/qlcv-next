import type { Metadata } from "next";
import { AppProviders } from "@/app/providers";
import { AppShell } from "@/features/shared/AppShell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Lean Legal Engine",
  description: "Lean legal project workflow board",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
