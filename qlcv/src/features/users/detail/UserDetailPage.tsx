"use client";

import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Modal,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError, VersionConflictError } from "@/api/client";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import {
  activateUser,
  deactivateUser,
  getUser,
  resetUserMfa,
  resetUserPassword,
  type ManagedUser,
} from "@/api/users.api";
import { authStore } from "@/features/auth";
import { ProfileDocumentsPanel } from "@/features/profile-documents";
import { userQueryKeys } from "../model/user-query-keys";
import { getUserRoleLabel } from "../list/UserListFilters";
import { AssignedWorkTab } from "./AssignedWorkTab";
import { canManageUserAction } from "./user-detail-permissions";

type DetailTab = "overview" | "security" | "assigned-work" | "profile-documents";
type LifecycleAction = "activate" | "deactivate";
type Feedback = { type: "success" | "error" | "warning"; message: string } | null;

export function UserDetailPage({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [lifecycleAction, setLifecycleAction] = useState<LifecycleAction | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mfaOpen, setMfaOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [requiresRefresh, setRequiresRefresh] = useState(false);

  const detailQuery = useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: ({ signal }) => getUser(userId, signal),
  });

  async function refreshAfterMutation(updatedUser?: ManagedUser): Promise<boolean> {
    setRequiresRefresh(true);
    if (updatedUser?.id === userId) {
      queryClient.setQueryData(userQueryKeys.detail(userId), updatedUser);
    }
    await queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    const result = await detailQuery.refetch();
    if (result.isSuccess && result.data.id === userId) {
      setRequiresRefresh(false);
      return true;
    }
    setFeedback({
      type: "error",
      message: "Thao tác đã hoàn tất nhưng chưa tải được phiên bản mới. Hãy tải lại dữ liệu trước khi tiếp tục.",
    });
    return false;
  }

  async function recoverFromConflict(actionLabel: string) {
    setRequiresRefresh(true);
    const result = await detailQuery.refetch();
    if (result.isSuccess && result.data.id === userId) {
      setRequiresRefresh(false);
      setFeedback({
        type: "warning",
        message: `Dữ liệu đã thay đổi. Đã tải lại thông tin mới nhất; hãy kiểm tra và xác nhận lại để ${actionLabel}.`,
      });
    } else {
      setFeedback({
        type: "error",
        message: "Dữ liệu đã thay đổi nhưng chưa thể tải phiên bản mới nhất. Hãy tải lại dữ liệu trước khi tiếp tục.",
      });
    }
  }

  async function runLifecycle() {
    const user = detailQuery.data;
    const action = lifecycleAction;
    if (!user || !action || pendingAction || requiresRefresh) return;

    // The dialog belongs to the currently displayed record only.
    if (user.id !== userId) {
      setLifecycleAction(null);
      setFeedback({ type: "error", message: "Người dùng đang hiển thị đã thay đổi. Vui lòng thử lại." });
      return;
    }

    setPendingAction(action);
    setFeedback(null);
    try {
      const updated = action === "activate"
        ? await activateUser(user.id, { version: user.version })
        : await deactivateUser(user.id, { version: user.version });
      setLifecycleAction(null);
      const refreshed = await refreshAfterMutation(updated);
      if (refreshed) {
        setFeedback({
          type: "success",
          message: action === "activate" ? "Đã kích hoạt người dùng." : "Đã vô hiệu hóa người dùng.",
        });
      }
    } catch (error) {
      setLifecycleAction(null);
      if (error instanceof VersionConflictError) {
        await recoverFromConflict(action === "activate" ? "kích hoạt" : "vô hiệu hóa");
      } else {
        // Backend detail is intentionally preserved (including last-active-admin errors).
        setFeedback({ type: "error", message: getUserFacingErrorMessage(error) });
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function runPasswordReset() {
    const user = detailQuery.data;
    if (!user || newPassword.length < 8 || pendingAction || requiresRefresh) return;
    if (user.id !== userId) return;

    setPendingAction("password");
    setFeedback(null);
    try {
      await resetUserPassword(user.id, { temporary_password: newPassword });
      setNewPassword("");
      setPasswordOpen(false);
      const refreshed = await refreshAfterMutation();
      if (refreshed) setFeedback({ type: "success", message: "Đã đặt mật khẩu mới." });
    } catch (error) {
      if (error instanceof VersionConflictError) {
        setPasswordOpen(false);
        setNewPassword("");
        await recoverFromConflict("đặt lại mật khẩu");
      } else {
        setFeedback({ type: "error", message: getUserFacingErrorMessage(error) });
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function runMfaReset() {
    const user = detailQuery.data;
    if (!user || pendingAction || requiresRefresh || user.id !== userId) return;

    setPendingAction("mfa");
    setFeedback(null);
    try {
      await resetUserMfa(user.id);
      setMfaOpen(false);
      const refreshed = await refreshAfterMutation();
      if (refreshed) setFeedback({ type: "success", message: "Đã đặt lại MFA quản trị cho người dùng." });
    } catch (error) {
      if (error instanceof VersionConflictError) {
        setMfaOpen(false);
        await recoverFromConflict("đặt lại MFA");
      } else {
        setFeedback({ type: "error", message: getUserFacingErrorMessage(error) });
      }
    } finally {
      setPendingAction(null);
    }
  }

  if (detailQuery.isPending) {
    return <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>;
  }

  if (detailQuery.isError) {
    if (detailQuery.error instanceof ApiError && detailQuery.error.status === 404) {
      return (
        <Card>
          <Empty description="Không tìm thấy người dùng" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button><Link href="/users">Quay lại danh sách</Link></Button>
          </Empty>
        </Card>
      );
    }
    return (
      <Alert
        type="error"
        showIcon
        message={getUserFacingErrorMessage(detailQuery.error)}
        description={getDebugErrorInfo(detailQuery.error)}
        action={<Button onClick={() => detailQuery.refetch()}>Thử lại</Button>}
      />
    );
  }

  const user = detailQuery.data;
  const actor = authStore.getUser();
  const selfDeactivate = actor?.id === user.id && user.is_active;
  const lifecycleKey = user.is_active ? "delete" : "restore";
  const canLifecycle = canManageUserAction(user.actions, lifecycleKey, actor?.role ?? "", user.role);
  const canSecurity = canManageUserAction(user.actions, "edit", actor?.role ?? "", user.role);
  const busy = Boolean(pendingAction) || requiresRefresh;

  return (
    <section className="workflow-page" aria-labelledby="user-detail-title">
      <header className="workflow-page__header">
        <div>
          <Space size="small"><Link href="/users">Người dùng</Link><span aria-hidden="true">/</span></Space>
          <Typography.Title id="user-detail-title" level={2}>{user.username}</Typography.Title>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </div>
        <Space wrap>
          <Tag color={user.is_active ? "success" : "default"}>
            {user.is_active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
          </Tag>
          {canLifecycle ? (
            <Button
              danger={user.is_active}
              disabled={busy || selfDeactivate}
              onClick={() => setLifecycleAction(user.is_active ? "deactivate" : "activate")}
            >
              {user.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
            </Button>
          ) : null}
        </Space>
      </header>

      {selfDeactivate && canLifecycle ? (
        <Alert type="warning" showIcon message="Bạn không thể tự vô hiệu hóa tài khoản đang đăng nhập." />
      ) : null}
      {requiresRefresh ? (
        <Alert
          type="warning"
          showIcon
          message="Cần tải phiên bản mới nhất trước khi thực hiện thao tác khác."
          action={<Button loading={detailQuery.isFetching} onClick={() => void detailQuery.refetch().then((result) => {
            if (result.isSuccess && result.data.id === userId) setRequiresRefresh(false);
          })}>Tải lại</Button>}
        />
      ) : null}
      {feedback ? <Alert type={feedback.type} showIcon message={feedback.message} closable onClose={() => setFeedback(null)} /> : null}

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as DetailTab)}
          items={[
            { key: "overview", label: "Tổng quan", children: <Overview user={user} /> },
            {
              key: "security",
              label: "Bảo mật",
              children: (
                <SecurityPanel
                  user={user}
                  canManage={canSecurity}
                  busy={busy}
                  onPasswordReset={() => { setNewPassword(""); setPasswordOpen(true); }}
                  onMfaReset={() => setMfaOpen(true)}
                />
              ),
            },
            {
              key: "assigned-work",
              label: "Công việc được giao",
              children: <AssignedWorkTab userId={user.id} active={activeTab === "assigned-work"} />,
            },
            {
              key: "profile-documents",
              label: "Hồ sơ đính kèm",
              children: (
                <ProfileDocumentsPanel
                  entityType="user"
                  entityId={user.id}
                  active={activeTab === "profile-documents"}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={lifecycleAction === "activate" ? "Xác nhận kích hoạt" : "Xác nhận vô hiệu hóa"}
        open={Boolean(lifecycleAction)}
        okText={lifecycleAction === "activate" ? "Kích hoạt" : "Vô hiệu hóa"}
        okButtonProps={{ danger: lifecycleAction === "deactivate" }}
        confirmLoading={pendingAction === lifecycleAction}
        onOk={() => void runLifecycle()}
        onCancel={() => { if (!pendingAction) setLifecycleAction(null); }}
        maskClosable={!pendingAction}
        closable={!pendingAction}
      >
        <p>
          {lifecycleAction === "activate"
            ? `Kích hoạt lại tài khoản ${user.username}?`
            : `Vô hiệu hóa tài khoản ${user.username}? Người dùng sẽ không thể đăng nhập.`}
        </p>
      </Modal>

      <Modal
        title="Đặt lại mật khẩu"
        open={passwordOpen}
        okText="Đặt lại mật khẩu"
        confirmLoading={pendingAction === "password"}
        okButtonProps={{ disabled: newPassword.length < 8 }}
        onOk={() => void runPasswordReset()}
        onCancel={() => { if (!pendingAction) { setPasswordOpen(false); setNewPassword(""); } }}
        maskClosable={!pendingAction}
        closable={!pendingAction}
        destroyOnHidden
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Typography.Text>
            Nhập mật khẩu mới cho <Typography.Text strong>{user.username}</Typography.Text>.
          </Typography.Text>
          <Input.Password
            autoFocus
            autoComplete="new-password"
            aria-label="Mật khẩu mới"
            placeholder="Tối thiểu 8 ký tự"
            value={newPassword}
            status={newPassword.length > 0 && newPassword.length < 8 ? "error" : undefined}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          {newPassword.length > 0 && newPassword.length < 8 ? (
            <Typography.Text type="danger">Mật khẩu phải có ít nhất 8 ký tự.</Typography.Text>
          ) : null}
          <Alert type="warning" showIcon message="Mật khẩu chỉ được gửi khi bạn xác nhận và không được lưu trên trình duyệt." />
        </Space>
      </Modal>

      <Modal
        title="Đặt lại MFA quản trị"
        open={mfaOpen}
        okText="Đặt lại MFA"
        okButtonProps={{ danger: true }}
        confirmLoading={pendingAction === "mfa"}
        onOk={() => void runMfaReset()}
        onCancel={() => { if (!pendingAction) setMfaOpen(false); }}
        maskClosable={!pendingAction}
        closable={!pendingAction}
      >
        <Alert
          type="warning"
          showIcon
          message={`Xóa cấu hình MFA hiện tại của ${user.username}? Đây là thao tác quản trị, tách biệt với đặt lại mật khẩu.`}
        />
      </Modal>
    </section>
  );
}

function Overview({ user }: { user: ManagedUser }) {
  return (
    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
      <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
      <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
      <Descriptions.Item label="Vai trò"><Tag>{getUserRoleLabel(user.role)}</Tag></Descriptions.Item>
      <Descriptions.Item label="Trạng thái">
        <Tag color={user.is_active ? "success" : "default"}>{user.is_active ? "Đang hoạt động" : "Đã vô hiệu hóa"}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="MFA">{user.mfa_enabled ? "Đã bật" : "Chưa bật"}</Descriptions.Item>
      <Descriptions.Item label="Ngày tạo">{user.created_at ? formatDateTime(user.created_at) : "Chưa xác định"}</Descriptions.Item>
    </Descriptions>
  );
}

function SecurityPanel({
  user,
  canManage,
  busy,
  onPasswordReset,
  onMfaReset,
}: {
  user: ManagedUser;
  canManage: boolean;
  busy: boolean;
  onPasswordReset: () => void;
  onMfaReset: () => void;
}) {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {!canManage ? <Alert type="info" showIcon message="Bạn không có quyền quản trị bảo mật cho người dùng này." /> : null}
      <Card size="small" title="Mật khẩu">
        <Space direction="vertical">
          <Typography.Text type="secondary">Đặt mật khẩu mới; giá trị hiện tại không bao giờ được hiển thị.</Typography.Text>
          {canManage ? <Button disabled={busy} onClick={onPasswordReset}>Đặt lại mật khẩu</Button> : null}
        </Space>
      </Card>
      <Card size="small" title="Xác thực đa yếu tố (MFA)">
        <Space direction="vertical">
          <Typography.Text>MFA hiện {user.mfa_enabled ? "đang bật" : "chưa được bật"}.</Typography.Text>
          {canManage && user.mfa_enabled ? <Button danger disabled={busy} onClick={onMfaReset}>Đặt lại MFA quản trị</Button> : null}
        </Space>
      </Card>
    </Space>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
