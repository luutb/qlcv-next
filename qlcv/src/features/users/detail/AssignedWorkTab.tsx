"use client";

import { Alert, Button, Card, Empty, Space, Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listTasks, type ProjectTask } from "@/api/tasks.api";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";

const PAGE_SIZE = 10;
const LOOKAHEAD_LIMIT = PAGE_SIZE + 1;

export function AssignedWorkTab({ userId, active }: { userId: string; active: boolean }) {
  const [offset, setOffset] = useState(0);
  const query = { assignee_id: userId, limit: LOOKAHEAD_LIMIT, offset } as const;
  const tasksQuery = useQuery({
    queryKey: ["tasks", "list", query],
    queryFn: ({ signal }) => listTasks(query, signal),
    enabled: active,
  });

  if (tasksQuery.isPending) {
    return <Card loading title="Công việc được giao" />;
  }

  if (tasksQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={getUserFacingErrorMessage(tasksQuery.error)}
        description={getDebugErrorInfo(tasksQuery.error)}
        action={<Button onClick={() => tasksQuery.refetch()}>Thử lại</Button>}
      />
    );
  }

  const fetchedTasks = tasksQuery.data.data;
  const tasks = fetchedTasks.slice(0, PAGE_SIZE);
  const hasNextPage = fetchedTasks.length > PAGE_SIZE;
  if (tasks.length === 0 && offset === 0) {
    return <Card><Empty description="Người dùng chưa có công việc được giao" /></Card>;
  }

  return (
    <Card styles={{ body: { padding: 0 } }}>
      {tasks.length === 0 ? (
        <Empty description="Trang này không có công việc" style={{ padding: 32 }} />
      ) : (
        <Table<ProjectTask>
          rowKey="id"
          dataSource={tasks}
          loading={tasksQuery.isFetching}
          scroll={{ x: 720 }}
          pagination={false}
          columns={[
            {
              title: "Công việc",
              dataIndex: "title",
              render: (title: string, task) => (
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{title}</Typography.Text>
                  <Typography.Text type="secondary">Project: {task.project_id}</Typography.Text>
                </Space>
              ),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 150,
              render: (status: ProjectTask["status"]) => <Tag color={statusColor(status)}>{status}</Tag>,
            },
            {
              title: "Hạn xử lý",
              dataIndex: "due_date",
              width: 180,
              render: (dueDate?: string | null) => dueDate ? formatDate(dueDate) : "Chưa đặt",
            },
          ]}
        />
      )}
      <Space style={{ display: "flex", justifyContent: "flex-end", padding: 16 }}>
        <Button disabled={offset === 0 || tasksQuery.isFetching} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
          Trang trước
        </Button>
        <Typography.Text type="secondary">Trang {Math.floor(offset / PAGE_SIZE) + 1}</Typography.Text>
        <Button
          disabled={!hasNextPage || tasksQuery.isFetching}
          onClick={() => setOffset(offset + PAGE_SIZE)}
        >
          Trang sau
        </Button>
      </Space>
    </Card>
  );
}

function statusColor(status: ProjectTask["status"]): string {
  if (status === "DONE") return "success";
  if (status === "DOING") return "processing";
  if (status === "CANCELLED") return "default";
  return "warning";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN").format(date);
}
