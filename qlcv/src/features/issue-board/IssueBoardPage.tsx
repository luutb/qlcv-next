"use client";

import Link from "next/link";
import { Alert, Button, Space, Typography } from "antd";

export function IssueBoardPage() {
  return (
    <main className="app-shell">
      <section className="workflow-page">
        <header className="workflow-page__header">
          <div>
            <Typography.Title level={2}>Issue Board</Typography.Title>
            <Typography.Text type="secondary">
              Backlog module. Backend hiện tại chưa có API production cho issues.
            </Typography.Text>
          </div>
        </header>

        <Alert
          type="warning"
          showIcon
          message="Issue Board đang là backlog/mock, không phải luồng backend thật."
          description="Luồng production hiện tại là Project Workflow Board dùng /api/v1/projects/board và workflow templates."
        />

        <Space>
          <Link href="/projects/board">
            <Button type="primary">Mở Project Workflow Board</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </Space>
      </section>
    </main>
  );
}
