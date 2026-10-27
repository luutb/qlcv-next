"use client";

import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { getSafeApiErrorMessage } from "@/services/http";
import { login } from "@/features/auth/api/auth.api";
import { safeReturnPath, saveAccessToken } from "@/features/auth/model/session";
import { useRouter } from "next/navigation";
import { FormEvent, useSyncExternalStore, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const subscribeToLocation = (listener: () => void) => {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
};

export function LoginForm() {
  const router = useRouter();
  const client = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const reason = useSyncExternalStore(subscribeToLocation, () => new URLSearchParams(window.location.search).get("reason"), () => null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login({ username: String(form.get("username") ?? "").trim(), tenant_slug: String(form.get("tenant_slug") ?? "").trim() || undefined, password: String(form.get("password") ?? ""), totp_code: String(form.get("totp_code") ?? "").trim() || undefined });
      client.clear();
      saveAccessToken(result.accessToken);
      router.replace(safeReturnPath(new URLSearchParams(window.location.search).get("next")));
    } catch (cause) {
      setError(getSafeApiErrorMessage(cause, "Không thể kết nối đến máy chủ. Vui lòng thử lại."));
    } finally { setIsSubmitting(false); }
  }

  return <form className="login-form" onSubmit={onSubmit} aria-busy={isSubmitting}>
    {reason === "expired" && <p className="auth-session-notice" role="status">Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.</p>}
    {reason === "logout-failed" && <p className="auth-session-notice" role="alert">Đã xóa phiên trên trình duyệt nhưng chưa xác nhận được việc kết thúc phiên trên máy chủ. Vui lòng đăng nhập lại và đổi mật khẩu nếu cần thu hồi các phiên.</p>}
    <FormField id="tenant_slug" name="tenant_slug" label="Mã đơn vị (bỏ trống với quản trị nền tảng hoặc tenant cũ)" placeholder="Ví dụ: cong-ty-abc" autoComplete="organization" disabled={isSubmitting} />
    <FormField id="username" name="username" label="Tên đăng nhập" placeholder="Nhập tên đăng nhập" autoComplete="username" required disabled={isSubmitting} />
    <div className="auth-password"><FormField id="password" name="password" label="Mật khẩu" placeholder="Nhập mật khẩu" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={isSubmitting} /><button type="button" className="auth-password-toggle" aria-controls="password" aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Ẩn" : "Hiện"}</button></div>
    <details className="auth-mfa"><summary>Tài khoản có xác thực hai bước?</summary><FormField id="totp_code" name="totp_code" label="Mã xác thực" placeholder="Mã từ ứng dụng xác thực" inputMode="numeric" autoComplete="one-time-code" disabled={isSubmitting} /></details>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <Button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}</Button>
  </form>;
}
