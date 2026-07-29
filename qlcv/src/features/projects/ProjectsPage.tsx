"use client";

import Link from "next/link";
import { Alert, Button, Empty, Skeleton, Space, Table, Tag, Typography } from "antd";
import { PlusOutlined, ProjectOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProjects, type ProjectSummary } from "@/api/projects.api";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { authStore } from "@/features/auth";
import { canPerformAction } from "@/layouts/app-shell/model/access";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { useProjectWorkflowTemplates } from "./queries/project.queries";
import { formatCurrency, getConflictColor } from "./projects.utils";

export function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const role = authStore.getUser()?.role ?? "";
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: ({ signal }) => listProjects(signal),
  });
  const templatesQuery = useProjectWorkflowTemplates();
  const templates = templatesQuery.data?.data ?? [];

  return (
    <main className="app-shell">
      <section className="workflow-page">
        <header className="workflow-page__header">
          <div>
            <Typography.Title level={2}>Projects</Typography.Title>
            <Typography.Text type="secondary">
              Project là lõi nghiệp vụ của Lean Legal Engine.
            </Typography.Text>
          </div>
          <Space wrap>
            <Link href="/projects/board">
              <Button icon={<ProjectOutlined />}>Project Board</Button>
            </Link>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo project
            </Button>
          </Space>
        </header>

        {projectsQuery.isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : projectsQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={getUserFacingErrorMessage(projectsQuery.error)}
            description={getDebugErrorInfo(projectsQuery.error)}
          />
        ) : projectsQuery.data?.data.length ? (
          <Table<ProjectSummary>
            rowKey="id"
            size="middle"
            dataSource={projectsQuery.data.data}
            pagination={{ pageSize: 20 }}
            columns={[
              {
                title: "Project",
                dataIndex: "name",
                render: (name, record) => (
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>{name}</Typography.Text>
                    {record.customer_name ? (
                      <Typography.Text type="secondary">{record.customer_name}</Typography.Text>
                    ) : null}
                  </Space>
                ),
              },
              {
                title: "Conflict",
                dataIndex: "conflict_status",
                render: (status: ProjectSummary["conflict_status"]) =>
                  status ? <Tag color={getConflictColor(status)}>{status}</Tag> : "-",
              },
              {
                title: "Hợp đồng",
                dataIndex: "total_contract_value",
                align: "right",
                render: formatCurrency,
              },
              {
                title: "Đã thu",
                dataIndex: "total_paid",
                align: "right",
                render: formatCurrency,
              },
              {
                title: "Còn lại",
                dataIndex: "remaining_amount",
                align: "right",
                render: formatCurrency,
              },
              {
                title: "Thao tác",
                key: "actions",
                render: (_value, record) => (
                  <Space wrap>
                    {canPerformAction(record.actions, "view", role) ? (
                      <Link href={`/projects/${record.id}`}>
                        <Button size="small">Chi tiết</Button>
                      </Link>
                    ) : null}
                    {canPerformAction(record.actions, "move", role) ? (
                      <Link href="/projects/board">
                        <Button size="small">Move trên board</Button>
                      </Link>
                    ) : null}
                    {canPerformAction(record.actions, "edit", role) ? <Button size="small">Sửa</Button> : null}
                    {canPerformAction(record.actions, "delete", role) ? (
                      <Button size="small" danger>
                        Xóa
                      </Button>
                    ) : null}
                    {canPerformAction(record.actions, "restore", role) ? <Button size="small">Khôi phục</Button> : null}
                    {canPerformAction(record.actions, "lock", role) ? <Button size="small">Khóa</Button> : null}
                  </Space>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="Chưa có project" />
        )}

        <CreateProjectModal
          open={createOpen}
          workflowTemplates={templates}
          defaultWorkflowTemplateId={
            templates.find((template) => template.is_default)?.id ?? templates[0]?.id
          }
          onCancel={() => setCreateOpen(false)}
          onCreated={() => projectsQuery.refetch()}
        />
      </section>
    </main>
  );
}
