"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { VersionConflictError } from "@/api/client";
import { getUserFacingErrorMessage } from "@/api/errors";
import {
  getCurrentUser,
  updateCurrentUser,
  type ManagedUser,
} from "@/api/users.api";
import { authStore } from "@/features/auth";
import { ProfileDocumentsPanel } from "@/features/profile-documents";
import { ErrorState, MutationFeedback, StaleDataState } from "@/shared/ui";

type FormValues = { username: string; email: string };
type MutationState = "idle" | "pending" | "success" | "error";

export function ProfilePage() {
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [values, setValues] = useState<FormValues>({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [mutationState, setMutationState] = useState<MutationState>("idle");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  const loadProfile = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    try {
      const profile = await getCurrentUser(signal);
      authStore.setUser(profile);
      setUser(profile);
      setValues({ username: profile.username, email: profile.email });
      setStale(false);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setLoadError(error);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => loadProfile(controller.signal));
    return () => controller.abort();
  }, [loadProfile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || mutationState === "pending") return;

    const username = values.username.trim();
    const email = values.email.trim();
    if (!username || !email) {
      setMutationState("error");
      setMutationError("Tên đăng nhập và email không được để trống.");
      return;
    }

    const payload = {
      ...(username !== user.username ? { username } : {}),
      ...(email !== user.email ? { email } : {}),
      version: user.version,
    };

    if (!("username" in payload) && !("email" in payload)) {
      setMutationState("idle");
      setMutationError(null);
      return;
    }

    setMutationState("pending");
    setMutationError(null);
    setStale(false);
    try {
      const updatedUser = await updateCurrentUser(payload);
      authStore.setUser(updatedUser);
      setUser(updatedUser);
      setValues({ username: updatedUser.username, email: updatedUser.email });
      setMutationState("success");
    } catch (error) {
      if (error instanceof VersionConflictError) {
        setMutationState("idle");
        await loadProfile();
        setStale(true);
        return;
      }
      setMutationError(getUserFacingErrorMessage(error));
      setMutationState("error");
    }
  }

  if (loading && !user) return <ProfileSkeleton />;
  if (loadError && !user) return <ErrorState error={loadError} onRetry={() => void loadProfile()} />;
  if (!user) return <ErrorState message="Không tải được hồ sơ hiện tại." onRetry={() => void loadProfile()} />;

  const dirty = values.username.trim() !== user.username || values.email.trim() !== user.email;

  return (
    <Stack spacing={3} sx={{ maxWidth: 920, mx: "auto" }}>
      <Box>
        <Typography variant="overline" color="text.secondary">Tài khoản cá nhân</Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Hồ sơ của tôi</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Thông tin được đồng bộ trực tiếp với tài khoản đang đăng nhập.
        </Typography>
      </Box>

      {stale ? (
        <StaleDataState
          message="Hồ sơ đã được người khác cập nhật. Dữ liệu mới nhất đã được tải lại; hãy kiểm tra rồi lưu lại."
          onReload={() => void loadProfile()}
        />
      ) : null}

      <MutationFeedback
        status={mutationState}
        successMessage="Đã cập nhật hồ sơ và làm mới phiên hiện tại."
        errorMessage={mutationError ?? undefined}
      />

      <Card variant="outlined">
        <CardContent>
          <Stack component="form" spacing={3} onSubmit={handleSubmit} noValidate>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Tên đăng nhập"
                autoComplete="username"
                value={values.username}
                onChange={(event) => {
                  setValues((current) => ({ ...current, username: event.target.value }));
                  setMutationState("idle");
                }}
              />
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => {
                  setValues((current) => ({ ...current, email: event.target.value }));
                  setMutationState("idle");
                }}
              />
            </Stack>

            <Divider />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
              <ReadOnlyField label="Vai trò" value={user.role} />
              <ReadOnlyField label="Gói tenant" value={user.tenant_plan ?? "Chưa xác định"} />
              <ReadOnlyField label="Phiên bản dữ liệu" value={String(user.version)} />
              <Chip
                label={user.is_active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                color={user.is_active ? "success" : "default"}
                variant="outlined"
              />
            </Stack>

            {user.mfa_enabled ? (
              <Alert severity="info">MFA đang bật. Quản lý MFA được tạm hoãn theo phạm vi hiện tại.</Alert>
            ) : null}

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button
                type="button"
                disabled={!dirty || mutationState === "pending"}
                onClick={() => setValues({ username: user.username, email: user.email })}
              >
                Hoàn tác
              </Button>
              <Button type="submit" variant="contained" disabled={!dirty || mutationState === "pending"}>
                {mutationState === "pending" ? "Đang lưu…" : "Lưu thay đổi"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                Hồ sơ đính kèm
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Lưu và quản lý các tài liệu thuộc hồ sơ cá nhân của bạn.
              </Typography>
            </Box>
            <ProfileDocumentsPanel entityType="user" entityId={user.id} active />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 160 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

function ProfileSkeleton() {
  return (
    <Stack spacing={2} sx={{ maxWidth: 920, mx: "auto" }} aria-label="Đang tải hồ sơ">
      <Skeleton variant="text" width={240} height={54} />
      <Skeleton variant="rounded" height={320} />
    </Stack>
  );
}
