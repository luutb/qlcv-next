"use client";

import Link from "next/link";
import { Alert, Button, Card, Checkbox, Empty, Input, Space, Table, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { createCustomer, listCustomers, type Customer, type CustomerRequest } from "@/api/customers.api";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { authStore } from "@/features/auth";
import { canPerformAction } from "@/layouts/app-shell/model/access";
import { CustomerFormModal } from "./CustomerFormModal";
import { customerQueryKeys } from "./model/customer-query-keys";

export function CustomersListPage() {
  const queryClient = useQueryClient();
  const role = authStore.getUser()?.role ?? "";
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => { setCommittedSearch(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);
  const listQuery = useMemo(() => ({ q: committedSearch || undefined, include_deleted: includeDeleted, limit: 20, offset: (page - 1) * 20 }), [committedSearch, includeDeleted, page]);
  const customersQuery = useQuery({ queryKey: customerQueryKeys.list(listQuery), queryFn: ({ signal }) => listCustomers(listQuery, signal) });
  const createMutation = useMutation({ mutationFn: (values: CustomerRequest) => createCustomer(values), onSuccess: () => queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() }) });

  return <section className="workflow-page" aria-labelledby="customers-title">
    <header className="workflow-page__header"><div><Typography.Title id="customers-title" level={2}>Customers</Typography.Title><Typography.Text type="secondary">Quản lý hồ sơ khách hàng và conflict-of-interest.</Typography.Text></div>{canPerformAction(undefined, "edit", role) ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Tạo customer</Button> : null}</header>
    <Card><Space wrap><Input.Search allowClear value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mã số thuế" style={{ width: 320 }} /><Checkbox checked={includeDeleted} onChange={(event) => setIncludeDeleted(event.target.checked)}>Hiện customer đã xóa</Checkbox></Space></Card>
    {createMutation.isError ? <Alert type="error" showIcon message={getUserFacingErrorMessage(createMutation.error)} /> : null}
    {customersQuery.isError ? <Alert type="error" showIcon message={getUserFacingErrorMessage(customersQuery.error)} description={getDebugErrorInfo(customersQuery.error)} action={<Button onClick={() => customersQuery.refetch()}>Thử lại</Button>} /> : customersQuery.data?.data.length === 0 ? <Card><Empty description="Chưa có customer phù hợp" /></Card> : <Card styles={{ body: { padding: 0 } }}><Table<Customer> rowKey="id" loading={customersQuery.isPending || customersQuery.isFetching} dataSource={customersQuery.data?.data ?? []} pagination={{ current: page, pageSize: 20, total: customersQuery.data?.pagination.total ?? 0, showSizeChanger: false, showTotal: (total) => `${total} customer`, onChange: (nextPage) => setPage(nextPage) }} columns={[{ title: "Customer", render: (_, record) => <Space direction="vertical" size={0}><Link href={`/customers/${record.id}`}><Typography.Text strong>{record.name}</Typography.Text></Link><Typography.Text type="secondary">{record.tax_code || "Chưa có mã số thuế"}</Typography.Text></Space> }, { title: "Người đại diện", dataIndex: "representative_name", render: (value) => value || "—" }, { title: "Liên hệ", render: (_, record) => record.email || record.phone || "—" }, { title: "Trạng thái", width: 150, render: (_, record) => <Tag color={record.deleted_at ? "default" : "success"}>{record.deleted_at ? "Đã xóa" : "Đang hoạt động"}</Tag> }]} /></Card>}
    <CustomerFormModal open={createOpen} pending={createMutation.isPending} onCancel={() => setCreateOpen(false)} onSubmit={(values) => createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) })} />
  </section>;
}
