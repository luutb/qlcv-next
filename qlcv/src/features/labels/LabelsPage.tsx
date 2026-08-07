"use client";

import { Alert, Button, Card, Empty, Form, Input, Modal, Space, Table, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { archiveLabel, createLabel, listLabels, type Label, type LabelRequest } from "@/api/labels.api";
import { getUserFacingErrorMessage } from "@/api/errors";
import { authStore } from "@/features/auth";
import { canPerformAction } from "@/layouts/app-shell/model/access";

function LabelForm({ open, pending, onCancel, onSubmit }: { open: boolean; pending: boolean; onCancel: () => void; onSubmit: (values: LabelRequest) => void }) {
  const [form] = Form.useForm<LabelRequest>();
  useEffect(() => { if (open) form.resetFields(); }, [form, open]);
  return <Modal open={open} title="Tạo label" okText="Tạo" cancelText="Hủy" confirmLoading={pending} onCancel={onCancel} onOk={() => void form.validateFields().then(onSubmit)} destroyOnClose><Form form={form} layout="vertical"><Form.Item name="title" label="Tên label" rules={[{ required: true, message: "Vui lòng nhập tên label" }]}><Input maxLength={100} /></Form.Item><Form.Item name="color" label="Màu"><Input placeholder="#1677ff" maxLength={32} /></Form.Item><Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} maxLength={500} /></Form.Item></Form></Modal>;
}

export function LabelsPage() {
  const role = authStore.getUser()?.role ?? "";
  const client = useQueryClient();
  const [archived, setArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const labels = useQuery({ queryKey: ["labels", { archived }], queryFn: ({ signal }) => listLabels({ archived }, signal) });
  const create = useMutation({ mutationFn: (values: LabelRequest) => createLabel(values), onSuccess: async () => { setFormOpen(false); await client.invalidateQueries({ queryKey: ["labels"] }); } });
  const archive = useMutation({ mutationFn: (id: string) => archiveLabel(id), onSuccess: () => client.invalidateQueries({ queryKey: ["labels"] }) });
  const canManage = canPerformAction(undefined, "edit", role);
  return <section className="workflow-page" aria-labelledby="labels-title"><header className="workflow-page__header"><div><Typography.Title id="labels-title" level={2}>Labels</Typography.Title><Typography.Text type="secondary">Quản lý label dùng cho customer, project, task và document.</Typography.Text></div>{canManage ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Tạo label</Button> : null}</header><Card><Space><Button type={archived ? "primary" : "default"} onClick={() => setArchived((value) => !value)}>{archived ? "Đang xem label đã archive" : "Hiện label đã archive"}</Button></Space></Card>{create.isError || labels.isError ? <Alert type="error" showIcon message={getUserFacingErrorMessage(create.error ?? labels.error)} action={<Button onClick={() => labels.refetch()}>Thử lại</Button>} /> : labels.data?.data.length === 0 && !labels.isPending ? <Card><Empty description="Chưa có label" /></Card> : <Card styles={{ body: { padding: 0 } }}><Table<Label> rowKey="id" loading={labels.isPending || labels.isFetching} dataSource={labels.data?.data ?? []} pagination={false} columns={[{ title: "Label", render: (_, label) => <Space><Tag color={label.color || "blue"}>{label.title}</Tag>{label.is_archived ? <Tag>Archived</Tag> : null}</Space> }, { title: "Mô tả", dataIndex: "description", render: (value) => value || "—" }, { title: "Scope", render: (_, label) => label.scoped_key ? `${label.scoped_key}: ${label.scoped_value || "—"}` : "Global" }, { title: "Thao tác", render: (_, label) => canManage && !label.is_archived ? <Button danger type="link" loading={archive.isPending && archive.variables === label.id} onClick={() => archive.mutate(label.id)}>Archive</Button> : null }]} /></Card>}<LabelForm open={formOpen} pending={create.isPending} onCancel={() => setFormOpen(false)} onSubmit={(values) => create.mutate(values)} /></section>;
}
