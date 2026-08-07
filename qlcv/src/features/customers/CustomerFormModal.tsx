"use client";

import { Form, Input, Modal } from "antd";
import { useEffect } from "react";
import type { Customer, CustomerRequest } from "@/api/customers.api";

export function CustomerFormModal({
  open,
  customer,
  pending,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  customer?: Customer;
  pending?: boolean;
  onCancel: () => void;
  onSubmit: (values: CustomerRequest) => void;
}) {
  const [form] = Form.useForm<CustomerRequest>();
  useEffect(() => {
    if (open) form.setFieldsValue(customer ?? { name: "", tax_code: "" });
  }, [customer, form, open]);

  return (
    <Modal
      open={open}
      title={customer ? "Sửa customer" : "Tạo customer"}
      okText={customer ? "Lưu thay đổi" : "Tạo customer"}
      cancelText="Hủy"
      confirmLoading={pending}
      onCancel={onCancel}
      onOk={() => void form.validateFields().then(onSubmit)}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Tên customer" rules={[{ required: true, message: "Vui lòng nhập tên customer" }]}>
          <Input maxLength={255} />
        </Form.Item>
        <Form.Item name="tax_code" label="Mã số thuế"><Input maxLength={64} /></Form.Item>
        <Form.Item name="representative_name" label="Người đại diện"><Input maxLength={255} /></Form.Item>
        <Form.Item name="email" label="Email"><Input type="email" maxLength={255} /></Form.Item>
        <Form.Item name="phone" label="Điện thoại"><Input maxLength={64} /></Form.Item>
        <Form.Item name="address" label="Địa chỉ"><Input.TextArea rows={2} maxLength={500} /></Form.Item>
        <Form.Item name="notes" label="Ghi chú"><Input.TextArea rows={3} maxLength={2000} /></Form.Item>
      </Form>
    </Modal>
  );
}
