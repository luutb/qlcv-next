"use client";

import Link from "next/link";
import { Alert, Button, Empty, Space, Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProjects, type ProjectSummary } from "@/api/projects.api";
import { getUserFacingErrorMessage } from "@/api/errors";

const PAGE_SIZE = 10;

export function CustomerProjectsTab({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);
  const projectsQuery = useQuery({
    queryKey: ["projects", "customer", customerId, page],
    queryFn: ({ signal }) => listProjects({ customer_id: customerId, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }, signal),
  });
  const projects = projectsQuery.data?.data ?? [];

  if (projectsQuery.isError) {
    return <Alert type="error" showIcon message={getUserFacingErrorMessage(projectsQuery.error)} action={<Button onClick={() => projectsQuery.refetch()}>Thử lại</Button>} />;
  }

  return projects.length === 0 && !projectsQuery.isPending ? (
    <Empty description="Customer chưa có project" />
  ) : (
    <Table<ProjectSummary>
      rowKey="id"
      loading={projectsQuery.isPending || projectsQuery.isFetching}
      dataSource={projects}
      scroll={{ x: 780 }}
      pagination={{
        current: page,
        pageSize: PAGE_SIZE,
        total: projectsQuery.data?.pagination.total ?? 0,
        showSizeChanger: false,
        showTotal: (total) => `${total} project`,
        onChange: setPage,
      }}
      columns={[
        {
          title: "Project",
          render: (_, project) => (
            <Space direction="vertical" size={0}>
              <Link href={`/projects/${project.id}`}><Typography.Text strong>{project.name}</Typography.Text></Link>
              <Typography.Text type="secondary">{project.current_workflow_step_name || "Chưa có workflow step"}</Typography.Text>
            </Space>
          ),
        },
        { title: "Trạng thái", dataIndex: "status", render: (status: string) => <Tag>{status}</Tag> },
        { title: "Conflict", dataIndex: "conflict_status", render: (status: ProjectSummary["conflict_status"]) => <Tag color={conflictColor(status)}>{status}</Tag> },
        { title: "Giá trị hợp đồng", dataIndex: "total_contract_value", align: "right", render: formatCurrency },
        { title: "Còn lại", dataIndex: "remaining_amount", align: "right", render: formatCurrency },
      ]}
    />
  );
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);
}

function conflictColor(status: ProjectSummary["conflict_status"]): "success" | "warning" | "error" {
  if (status === "CONFLICT_DETECTED") return "error";
  if (status === "PENDING") return "warning";
  return "success";
}
