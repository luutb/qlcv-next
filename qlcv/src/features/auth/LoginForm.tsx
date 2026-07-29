"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "@/api/auth.api";
import { getApiErrorPayload, getUserFacingErrorMessage } from "@/api/errors";
import { authStore } from "./auth.store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));
  const displayReturnUrl = returnUrl || "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFieldErrors: typeof fieldErrors = {};
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      nextFieldErrors.username = "Vui lòng nhập tên đăng nhập hoặc email.";
    }

    if (!password) {
      nextFieldErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({
        username: trimmedUsername,
        password,
      });
      const profile = await authStore.refreshUser();
      router.replace(returnUrl || (profile.role === "LAWYER" ? "/projects/board" : "/dashboard"));
    } catch (caughtError) {
      const payload = getApiErrorPayload(caughtError);
      const detail = payload?.detail ?? payload?.message ?? "Đăng nhập thất bại";

      if (detail.includes("MFA code is required")) {
        setError("Tài khoản chưa thể đăng nhập do cấu hình MFA phía máy chủ.");
      } else if (payload?.code === "INVALID_MFA_TOKEN") {
        setError("Tài khoản chưa thể đăng nhập do cấu hình MFA phía máy chủ.");
      } else {
        setError(getUserFacingErrorMessage(caughtError));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function clearError(field: "username" | "password") {
    setError(null);
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <main className="login-shell">
      <aside className="login-context-panel" aria-label="Bối cảnh sản phẩm">
        <div className="login-brand-lockup">
          <div className="login-brand-mark" aria-hidden="true">
            LL
          </div>
          <div>
            <p className="login-brand-name">Lean Legal Engine</p>
            <p className="login-brand-subtitle">Hệ thống vận hành công việc pháp lý nội bộ</p>
          </div>
        </div>

        <section className="login-context-content">
          <p className="login-eyebrow">Không gian làm việc nội bộ</p>
          <h1 className="login-context-title">Lean Legal Engine</h1>
          <p className="login-context-copy">Pháp lý vận hành gọn gàng, bảo mật và có kiểm soát.</p>
          <span className="login-company-pill">Truy cập dành cho nhân viên</span>
        </section>
      </aside>

      <section className="login-form-panel" aria-label="Form đăng nhập">
        <div className="login-auth-card">
          <div className="login-mobile-lockup login-brand-lockup">
            <div className="login-brand-mark" aria-hidden="true">
              LL
            </div>
            <div>
              <p className="login-brand-name">Lean Legal Engine</p>
              <p className="login-brand-subtitle">Hệ thống vận hành công việc pháp lý nội bộ</p>
            </div>
          </div>

          <p className="login-step-label">Đăng nhập nội bộ</p>
          <h2 className="login-auth-title">Chào mừng trở lại</h2>
          <p className="login-auth-copy">Nhập thông tin tài khoản công ty để tiếp tục vào Lean Legal Engine.</p>
          <div className="login-return-target" title={displayReturnUrl}>
            Sau đăng nhập: {displayReturnUrl}
          </div>

          {searchParams.get("expired") === "1" ? (
            <div className="login-alert login-alert--warn" role="status" aria-live="polite">
              Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.
            </div>
          ) : null}

          {error ? (
            <div className="login-alert" role="status" aria-live="polite">
              {error}
            </div>
          ) : null}

          <form className="login-auth-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <div className="login-field-row">
                <label htmlFor="identity">Tên đăng nhập hoặc email</label>
              </div>
              <input
                id="identity"
                name="identity"
                type="text"
                autoComplete="username"
                placeholder="name@company.vn"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  clearError("username");
                }}
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby="identityError"
              />
              <p className="login-field-error" id="identityError" aria-live="polite">
                {fieldErrors.username}
              </p>
            </div>

            <div className="login-field">
              <div className="login-field-row">
                <label htmlFor="password">Mật khẩu</label>
                <span className="login-field-hint">Bắt buộc</span>
              </div>
              <div className="login-input-shell">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby="passwordError"
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  aria-label={passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? "Ẩn" : "Hiện"}
                </button>
              </div>
              <p className="login-field-error" id="passwordError" aria-live="polite">
                {fieldErrors.password}
              </p>
            </div>

            <div className="login-form-options">
              <label className="login-checkbox-label" htmlFor="remember">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(event) => setRememberSession(event.target.checked)}
                />
                Ghi nhớ phiên đăng nhập
              </label>
              <a href="#forgot-password">Quên mật khẩu?</a>
            </div>

            <button className="login-primary-button" type="submit" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <p className="login-auth-footnote">
            Hệ thống chỉ dành cho nhân viên được cấp quyền. Mọi truy cập có thể được ghi nhận phục vụ kiểm soát nội bộ.
          </p>
        </div>
      </section>
    </main>
  );
}

function getSafeReturnUrl(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return "";
  }

  return value;
}
