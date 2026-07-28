import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ThemeRegistry from "@/components/ThemeRegistry";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QLCV - Quản Lý Công Việc",
  description: "Hệ thống quản lý công việc và hồ sơ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeRegistry>
            <AuthProvider>
              <NotificationProvider>
                {children}
                <Toaster position="top-right" />
              </NotificationProvider>
            </AuthProvider>
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
