"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, Skeleton, Space, Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listUsers, type ManagedUser, type UserListQuery } from "@/api/users.api";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { authStore } from "@/features/auth";
import { canPerformAction } from "@/layouts/app-shell/model/access";
import { UserFormModal } from "../forms/UserFormModal";
import {
  canCreateManagedUser,
  canEditManagedUser,
} from "../forms/user-management-policy";
import { userQueryKeys } from "../model/user-query-keys";
import { UserListFilters, getUserRoleLabel } from "./UserListFilters";
import {
  applyUserListQuery,
  parseUserListQuery,
  USER_LIST_PAGE_SIZE,
  type UserListUrlQuery,
} from "./user-list-query";

const SEARCH_DEBOUNCE_MS = 350;

export function UsersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseUserListQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const urlSearch = query.q ?? "";
  const [searchDraft, setSearchDraft] = useState({ source: urlSearch, value: urlSearch });
  const [formTarget, setFormTarget] = useState<"create" | ManagedUser | null>(null);
  const search = searchDraft.source === urlSearch ? searchDraft.value : urlSearch;
  const role = authStore.getUser()?.role ?? "";
  const usersQuery = useQuery({
    queryKey: userQueryKeys.list(query),
    queryFn: ({ signal }) => listUsers(toApiQuery(query), signal),
  });

  const updateUrl = useCallback(
    (next: Parameters<typeof applyUserListQuery>[2]) => {
      const params = applyUserListQuery(new URLSearchParams(searchParams.toString()), query, next);
      const queryString = params.toString();
      router.replace(queryString ? `/users?${queryString}` : "/users");
    },
    [query, router, searchParams],
  );

  useEffect(() => {
    if (search.trim() === (query.q ?? "")) return;

    const timer = window.setTimeout(() => {
      updateUrl({ q: search, offset: 0 });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query.q, search, updateUrl]);

  const pagination = usersQuery.data?.pagination;
  const users = usersQuery.data?.data ?? [];

  return (
    <section className="workflow-page" aria-labelledby="users-list-title">
      <header className="workflow-page__header">
        <div>
          <Typography.Title id="users-list-title" level={2}>
            Người dùng
          </Typography.Title>
          <Typography.Text type="secondary">
            Tìm kiếm và quản lý thành viên trong tổ chức.
          </Typography.Text>
        </div>
        {canCreateManagedUser(role) ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormTarget("create")}>
            Tạo người dùng
          </Button>
        ) : null}
      </header>

      <Card>
        <UserListFilters
          search={search}
          role={query.role}
          isActive={query.is_active}
          onSearchChange={(value) => setSearchDraft({ source: urlSearch, value })}
          onRoleChange={(nextRole) => updateUrl({ role: nextRole, offset: 0 })}
          onActiveChange={(isActive) => updateUrl({ is_active: isActive, offset: 0 })}
        />
      </Card>

      {usersQuery.isPending ? (
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : usersQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message={getUserFacingErrorMessage(usersQuery.error)}
          description={getDebugErrorInfo(usersQuery.error)}
          action={
            <Button size="small" onClick={() => usersQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : users.length === 0 ? (
        <Card>
          <Empty
            description={hasFilters(query) ? "Không có người dùng phù hợp" : "Chưa có người dùng"}
          />
        </Card>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table<ManagedUser>
            rowKey="id"
            dataSource={users}
            loading={usersQuery.isFetching}
            scroll={{ x: 760 }}
            pagination={{
              current: Math.floor((pagination?.offset ?? query.offset) / USER_LIST_PAGE_SIZE) + 1,
              pageSize: pagination?.limit ?? USER_LIST_PAGE_SIZE,
              total: pagination?.total ?? users.length,
              showSizeChanger: false,
              showTotal: (total) => `${total} người dùng`,
              onChange: (page) => updateUrl({ offset: (page - 1) * USER_LIST_PAGE_SIZE }),
            }}
            onRow={(record) => {
              const canView = canPerformAction(record.actions, "view", role);
              return canView
                ? {
                    role: "link",
                    tabIndex: 0,
                    style: { cursor: "pointer" },
                    onClick: (event) => {
                      if (!(event.target as HTMLElement).closest("a, button, input")) {
                        router.push(`/users/${record.id}`);
                      }
                    },
                    onKeyDown: (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/users/${record.id}`);
                      }
                    },
                  }
                : {};
            }}
            columns={[
              {
                title: "Người dùng",
                dataIndex: "username",
                render: (username: string, record) => (
                  <Space direction="vertical" size={0}>
                    {canPerformAction(record.actions, "view", role) ? (
                      <Link href={`/users/${record.id}`}>
                        <Typography.Text strong>{username}</Typography.Text>
                      </Link>
                    ) : (
                      <Typography.Text strong>{username}</Typography.Text>
                    )}
                    <Typography.Text type="secondary">{record.email}</Typography.Text>
                  </Space>
                ),
              },
              {
                title: "Vai trò",
                dataIndex: "role",
                width: 160,
                render: (userRole: string) => <Tag>{getUserRoleLabel(userRole)}</Tag>,
              },
              {
                title: "Trạng thái",
                dataIndex: "is_active",
                width: 170,
                render: (isActive: boolean) => (
                  <Tag color={isActive ? "success" : "default"}>
                    {isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                  </Tag>
                ),
              },
              {
                title: "MFA",
                dataIndex: "mfa_enabled",
                width: 130,
                render: (enabled: boolean) => (
                  <Tag color={enabled ? "blue" : "default"}>{enabled ? "Đã bật" : "Chưa bật"}</Tag>
                ),
              },
              {
                title: "Thao tác",
                key: "actions",
                width: 130,
                render: (_, record) =>
                  canEditManagedUser(record, role) ? (
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => setFormTarget(record)}
                    >
                      Sửa
                    </Button>
                  ) : null,
              },
            ]}
          />
        </Card>
      )}

      {formTarget === "create" ? (
        <UserFormModal mode="create" currentRole={role} onClose={() => setFormTarget(null)} />
      ) : formTarget ? (
        <UserFormModal
          key={`${formTarget.id}:${formTarget.version}`}
          mode="edit"
          user={formTarget}
          currentRole={role}
          onClose={() => setFormTarget(null)}
        />
      ) : null}
    </section>
  );
}

function toApiQuery(query: UserListUrlQuery): UserListQuery {
  return {
    q: query.q,
    role: query.role,
    is_active: query.is_active,
    limit: query.limit,
    offset: query.offset,
  };
}

function hasFilters(query: UserListUrlQuery): boolean {
  return Boolean(query.q || query.role || typeof query.is_active === "boolean");
}
