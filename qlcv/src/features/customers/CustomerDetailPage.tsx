"use client";

import Link from "next/link";
import { Alert, Button, Card, Descriptions, Empty, Input, List, Modal, Skeleton, Space, Tabs, Tag, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createCustomerConflict, deleteCustomer, getCustomer, listCustomerConflicts, restoreCustomer, updateCustomer, type CustomerRequest } from "@/api/customers.api";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { authStore } from "@/features/auth";
import { ProfileDocumentsPanel } from "@/features/profile-documents";
import { canPerformAction } from "@/layouts/app-shell/model/access";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerProjectsTab } from "./CustomerProjectsTab";
import { customerQueryKeys } from "./model/customer-query-keys";

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const client = useQueryClient();
  const role = authStore.getUser()?.role ?? "";
  const [editOpen, setEditOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictName, setConflictName] = useState("");
  const detail = useQuery({ queryKey: customerQueryKeys.detail(customerId), queryFn: ({ signal }) => getCustomer(customerId, signal) });
  const conflicts = useQuery({ queryKey: customerQueryKeys.conflicts(customerId), queryFn: ({ signal }) => listCustomerConflicts(customerId, signal), enabled: detail.isSuccess });
  const refresh = () => client.invalidateQueries({ queryKey: customerQueryKeys.detail(customerId) });
  const update = useMutation({ mutationFn: (values: CustomerRequest) => updateCustomer(customerId, values), onSuccess: async () => { setEditOpen(false); await client.invalidateQueries({ queryKey: customerQueryKeys.detail(customerId) }); await client.invalidateQueries({ queryKey: customerQueryKeys.lists() }); } });
  const remove = useMutation({ mutationFn: () => deleteCustomer(customerId), onSuccess: refresh });
  const restore = useMutation({ mutationFn: () => restoreCustomer(customerId), onSuccess: refresh });
  const addConflict = useMutation({ mutationFn: () => createCustomerConflict(customerId, { conflict_name: conflictName.trim() }), onSuccess: async () => { setConflictName(""); setConflictOpen(false); await client.invalidateQueries({ queryKey: customerQueryKeys.conflicts(customerId) }); } });

  if (detail.isPending) return <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>;
  if (detail.isError) return <Alert type="error" showIcon message={getUserFacingErrorMessage(detail.error)} description={getDebugErrorInfo(detail.error)} action={<Button onClick={() => detail.refetch()}>Thử lại</Button>} />;
  const customer = detail.data;
  const canEdit = canPerformAction(customer.actions, "edit", role);
  const canDelete = canPerformAction(customer.actions, customer.deleted_at ? "restore" : "delete", role);
  return <section className="workflow-page" aria-labelledby="customer-detail-title">
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <header className="workflow-page__header"><div><Typography.Link><Link href="/customers">← Customers</Link></Typography.Link><Typography.Title id="customer-detail-title" level={2}>{customer.name}</Typography.Title><Typography.Text type="secondary">{customer.deleted_at ? "Đã xóa mềm" : "Hồ sơ customer"}</Typography.Text></div><Space>{canEdit ? <Button onClick={() => setEditOpen(true)}>Sửa</Button> : null}{canDelete ? <Button danger={!customer.deleted_at} onClick={() => customer.deleted_at ? restore.mutate() : remove.mutate()} loading={remove.isPending || restore.isPending}>{customer.deleted_at ? "Khôi phục" : "Xóa"}</Button> : null}</Space></header>
      <Tabs items={[{ key: "overview", label: "Tổng quan", children: <Card><Descriptions column={{ xs: 1, sm: 2 }} bordered><Descriptions.Item label="Tên">{customer.name}</Descriptions.Item><Descriptions.Item label="Mã số thuế">{customer.tax_code || "—"}</Descriptions.Item><Descriptions.Item label="Người đại diện">{customer.representative_name || "—"}</Descriptions.Item><Descriptions.Item label="Email">{customer.email || "—"}</Descriptions.Item><Descriptions.Item label="Điện thoại">{customer.phone || "—"}</Descriptions.Item><Descriptions.Item label="Địa chỉ">{customer.address || "—"}</Descriptions.Item><Descriptions.Item label="Ghi chú" span={2}>{customer.notes || "—"}</Descriptions.Item></Descriptions></Card> }, { key: "projects", label: "Projects", children: <Card><CustomerProjectsTab customerId={customer.id} /></Card> }, { key: "conflicts", label: `Conflicts (${conflicts.data?.data.length ?? 0})`, children: <Card extra={canEdit ? <Button onClick={() => setConflictOpen(true)}>Thêm conflict</Button> : null}>{conflicts.isError ? <Alert type="error" message={getUserFacingErrorMessage(conflicts.error)} action={<Button onClick={() => conflicts.refetch()}>Thử lại</Button>} /> : <List loading={conflicts.isPending} dataSource={conflicts.data?.data ?? []} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có conflict" /> }} renderItem={(item) => <List.Item><Tag color="warning">Conflict</Tag>{item.conflict_name}</List.Item>} />}</Card> }, { key: "documents", label: "Hồ sơ đính kèm", children: <Card><ProfileDocumentsPanel entityType="customer" entityId={customer.id} active /></Card> }]} />
    </Space>
    <CustomerFormModal open={editOpen} customer={customer} pending={update.isPending} onCancel={() => setEditOpen(false)} onSubmit={(values) => update.mutate(values)} />
    <Modal open={conflictOpen} title="Thêm conflict" okText="Thêm" cancelText="Hủy" confirmLoading={addConflict.isPending} okButtonProps={{ disabled: !conflictName.trim() }} onCancel={() => setConflictOpen(false)} onOk={() => addConflict.mutate()}><Input autoFocus value={conflictName} maxLength={255} placeholder="Tên bên đối lập" onChange={(event) => setConflictName(event.target.value)} /></Modal>
  </section>;
}
