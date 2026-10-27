import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { environment } from "@/config/environment";
import "./globals.css";
import "./workspace.css";

const bodyFont = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: environment.appName,
  description: "Quản lý công việc pháp lý theo tenant, project và task.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={bodyFont.variable}>
        <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
