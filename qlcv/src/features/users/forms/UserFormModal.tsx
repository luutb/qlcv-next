"use client";

import { Alert, Button, Form, Input, Modal, Select, Space, Typography } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { ApiError, VersionConflictError } from "@/api/client";
import { getUserFacingErrorMessage } from "@/api/errors";
import {
  createUser,
  getUser,
  updateUser,
  USER_ROLES,
  type CreateUserRequest,
  type ManagedUser,
  type UpdateUserRequest,
  type UserRole,
} from "@/api/users.api";
import { authStore } from "@/features/auth";
import { userQueryKeys } from "../model/user-query-keys";
import {
  canCreateManagedUser,
  canEditManagedUser,
  getCreatableUserRoles,
} from "./user-management-policy";

type UserFormValues = {
  username: string;
  email: string;
  role: UserRole;
  password: string;
};

type UserFormField = keyof UserFormValues;
type UserFormErrors = Partial<Record<UserFormField, string>>;

type UserFormModalProps = {
  mode: "create" | "edit";
  user?: ManagedUser;
  currentRole: string;
  onClose: () => void;
};

export function UserFormModal({ mode, user, currentRole, onClose }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const initialBaseline = mode === "edit" ? user ?? null : null;
  const [baseline, setBaseline] = useState<ManagedUser | null>(initialBaseline);
  const [values, setValues] = useState<UserFormValues>(() => toInitialValues(initialBaseline));
  const [fieldErrors, setFieldErrors] = useState<UserFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [staleMessage, setStaleMessage] = useState<string | null>(null);
  const [conflictedUserId, setConflictedUserId] = useState<string | null>(null);
  const [sessionSyncUser, setSessionSyncUser] = useState<ManagedUser | null>(null);
  const [pending, setPending] = useState(false);
  const submittingRef = useRef(false);
  const roleOptions = useMemo(
    () =>
      getCreatableUserRoles(currentRole).map((role) => ({
        label: getRoleLabel(role),
        value: role,
      })),
    [currentRole],
  );

  const dirty = useMemo(() => {
    if (mode === "create") {
      return Boolean(
        values.username ||
          values.email ||
          values.password ||
          values.role !== toInitialValues(null).role,
      );
    }
    if (!baseline) return false;
    return (
      values.username.trim() !== baseline.username ||
      values.email.trim() !== baseline.email ||
      values.role !== baseline.role
    );
  }, [baseline, mode, values]);
  const canEdit =
    mode === "create"
      ? canCreateManagedUser(currentRole)
      : baseline
        ? canEditManagedUser(baseline, currentRole)
        : false;

  function requestClose() {
    if (pending) return;
    if (!dirty) {
      onClose();
      return;
    }

    Modal.confirm({
      title: "Bỏ các thay đổi chưa lưu?",
      content: "Thông tin bạn vừa nhập sẽ không được lưu.",
      okText: "Bỏ thay đổi",
      okButtonProps: { danger: true },
      cancelText: "Tiếp tục chỉnh sửa",
      onOk: onClose,
    });
  }

  function updateField<TKey extends UserFormField>(key: TKey, value: UserFormValues[TKey]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit() {
    if (
      submittingRef.current ||
      pending ||
      conflictedUserId ||
      sessionSyncUser ||
      !canEdit ||
      (mode === "edit" && !dirty)
    ) {
      return;
    }

    const nextErrors = validateUser(values, mode);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    submittingRef.current = true;
    setPending(true);
    setSubmitError(null);
    setStaleMessage(null);
    const actorId = authStore.getUser()?.id;

    try {
      const savedUser =
        mode === "create"
          ? await createUser(toCreatePayload(values))
          : await updateExistingUser(baseline, values);

      queryClient.setQueryData(userQueryKeys.detail(savedUser.id), savedUser);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.detail(savedUser.id),
          refetchType: "active",
        }),
      ]);

      if (savedUser.id === actorId && !(await syncCurrentActor(savedUser))) {
        return;
      }
      onClose();
    } catch (error) {
      if (mode === "edit" && baseline && error instanceof VersionConflictError) {
        setConflictedUserId(baseline.id);
        await recoverFromVersionConflict(baseline.id);
      } else if (error instanceof ApiError && error.status === 409) {
        setSubmitError(
          `${getUserFacingErrorMessage(error)} Kiểm tra lại tên đăng nhập và email rồi thử lại.`,
        );
      } else {
        setSubmitError(getUserFacingErrorMessage(error));
      }
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  async function recoverFromVersionConflict(userId: string) {
    try {
      const [latestUser] = await Promise.all([
        getUser(userId),
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.lists(),
          refetchType: "active",
        }),
      ]);
      queryClient.setQueryData(userQueryKeys.detail(userId), latestUser);
      setBaseline(latestUser);
      setConflictedUserId(null);
      setSubmitError(null);
      setStaleMessage(
        "Người dùng đã được cập nhật ở nơi khác. Dữ liệu và phiên bản mới nhất đã được tải; bản nháp của bạn vẫn được giữ lại. Hãy kiểm tra rồi bấm lưu lại nếu vẫn muốn áp dụng.",
      );
    } catch (refreshError) {
      setSubmitError(
        `Không thể tải dữ liệu mới nhất sau xung đột. ${getUserFacingErrorMessage(refreshError)}`,
      );
    }
  }

  async function retryConflictRefresh(userId: string) {
    if (submittingRef.current || pending) return;

    submittingRef.current = true;
    setPending(true);
    setSubmitError(null);
    try {
      await recoverFromVersionConflict(userId);
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  async function syncCurrentActor(savedUser: ManagedUser): Promise<boolean> {
    try {
      const refreshedUser = await authStore.refreshUser();
      assertCurrentActorSynced(refreshedUser, savedUser);
      setSessionSyncUser(null);
      return true;
    } catch (refreshError) {
      setBaseline(savedUser);
      setSessionSyncUser(savedUser);
      setSubmitError(
        `Người dùng đã được lưu nhưng chưa thể đồng bộ lại phiên hiện tại. Không gửi lại thay đổi; hãy thử đồng bộ phiên. ${getUserFacingErrorMessage(refreshError)}`,
      );
      return false;
    }
  }

  async function retrySessionSync() {
    if (submittingRef.current || pending || !sessionSyncUser) return;

    submittingRef.current = true;
    setPending(true);
    setSubmitError(null);
    try {
      const refreshedUser = await authStore.refreshUser();
      assertCurrentActorSynced(refreshedUser, sessionSyncUser);
      setSessionSyncUser(null);
      onClose();
    } catch (refreshError) {
      setSubmitError(
        `Người dùng đã được lưu nhưng vẫn chưa thể đồng bộ phiên hiện tại. ${getUserFacingErrorMessage(refreshError)}`,
      );
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <Modal
      open
      title={mode === "create" ? "Tạo người dùng" : "Chỉnh sửa người dùng"}
      onCancel={pending ? undefined : requestClose}
      footer={
        <Space>
          <Button onClick={requestClose} disabled={pending}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={() => void handleSubmit()}
            loading={pending}
            disabled={
              Boolean(conflictedUserId || sessionSyncUser) ||
              !canEdit ||
              (mode === "edit" && !dirty)
            }
          >
            {mode === "create" ? "Tạo người dùng" : "Lưu thay đổi"}
          </Button>
        </Space>
      }
      maskClosable={!pending}
      closable={!pending}
    >
      <Form layout="vertical" requiredMark="optional" onFinish={() => void handleSubmit()}>
        {staleMessage ? (
          <Alert
            type="warning"
            showIcon
            message="Dữ liệu vừa thay đổi"
            description={staleMessage}
            style={{ marginBottom: 16 }}
          />
        ) : null}
        {submitError ? (
          <Alert
            type="error"
            showIcon
            message="Không thể lưu người dùng"
            description={submitError}
            action={
              conflictedUserId ? (
                <Button
                  size="small"
                  onClick={() => void retryConflictRefresh(conflictedUserId)}
                  disabled={pending}
                >
                  Tải lại dữ liệu
                </Button>
              ) : sessionSyncUser ? (
                <Button size="small" onClick={() => void retrySessionSync()} disabled={pending}>
                  Đồng bộ phiên
                </Button>
              ) : undefined
            }
            style={{ marginBottom: 16 }}
          />
        ) : null}
        {!canEdit ? (
          <Alert
            type="warning"
            showIcon
            message="Bạn không còn quyền chỉnh sửa người dùng này."
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form.Item
          label="Tên đăng nhập"
          required
          validateStatus={fieldErrors.username ? "error" : undefined}
          help={fieldErrors.username}
        >
          <Input
            autoComplete="username"
            value={values.username}
            disabled={pending || !canEdit}
            onChange={(event) => updateField("username", event.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          required
          validateStatus={fieldErrors.email ? "error" : undefined}
          help={fieldErrors.email}
        >
          <Input
            type="email"
            autoComplete="email"
            value={values.email}
            disabled={pending || !canEdit}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          required
          validateStatus={fieldErrors.role ? "error" : undefined}
          help={fieldErrors.role}
        >
          <Select
            options={roleOptions}
            value={values.role}
            disabled={pending || !canEdit}
            onChange={(value: UserRole) => updateField("role", value)}
          />
        </Form.Item>

        {mode === "create" ? (
          <Form.Item
            label="Mật khẩu ban đầu"
            required
            validateStatus={fieldErrors.password ? "error" : undefined}
            help={fieldErrors.password ?? "Tối thiểu 8 ký tự."}
          >
            <Input.Password
              autoComplete="new-password"
              value={values.password}
              disabled={pending}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </Form.Item>
        ) : baseline ? (
          <Typography.Text type="secondary">
            Phiên bản dữ liệu hiện tại: {baseline.version}
          </Typography.Text>
        ) : null}
      </Form>
    </Modal>
  );
}

function toInitialValues(user: ManagedUser | null): UserFormValues {
  return {
    username: user?.username ?? "",
    email: user?.email ?? "",
    role: isUserRole(user?.role) ? user.role : "LAWYER",
    password: "",
  };
}

function validateUser(values: UserFormValues, mode: "create" | "edit"): UserFormErrors {
  const errors: UserFormErrors = {};
  if (!values.username.trim()) errors.username = "Vui lòng nhập tên đăng nhập.";

  const email = values.email.trim();
  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không đúng định dạng.";
  }

  if (!isUserRole(values.role)) errors.role = "Vui lòng chọn vai trò hợp lệ.";
  if (mode === "create" && values.password.length < 8) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  return errors;
}

function toCreatePayload(values: UserFormValues): CreateUserRequest {
  return {
    username: values.username.trim(),
    email: values.email.trim(),
    role: values.role,
    password: values.password,
  };
}

async function updateExistingUser(
  baseline: ManagedUser | null,
  values: UserFormValues,
): Promise<ManagedUser> {
  if (!baseline) throw new Error("Không có dữ liệu người dùng để cập nhật.");

  const username = values.username.trim();
  const email = values.email.trim();
  const payload: UpdateUserRequest = {
    ...(username !== baseline.username ? { username } : {}),
    ...(email !== baseline.email ? { email } : {}),
    ...(values.role !== baseline.role ? { role: values.role } : {}),
    version: baseline.version,
  };
  return updateUser(baseline.id, payload);
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.some((role) => role === value);
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Quản trị viên cấp cao";
    case "PARTNER":
      return "Đối tác";
    case "LAWYER":
      return "Luật sư";
    case "ACCOUNTANT":
      return "Kế toán";
  }
}

function assertCurrentActorSynced(
  refreshedUser: { id: string; version?: number },
  savedUser: ManagedUser,
): void {
  if (
    refreshedUser.id !== savedUser.id ||
    typeof refreshedUser.version !== "number" ||
    refreshedUser.version < savedUser.version
  ) {
    throw new Error("Phiên hiện tại chưa phản ánh phiên bản người dùng vừa lưu.");
  }
}
