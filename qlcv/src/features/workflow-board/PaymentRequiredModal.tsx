"use client";

import { Alert, Descriptions, Form, Input, InputNumber, Modal, Select } from "antd";
import type { ProjectBoardCard } from "@/api/projects.api";
import type { WorkflowFinancialBlockedDetails } from "@/api/errors";
import { formatCurrency } from "./workflow-board.utils";

export type PaymentRequiredFormValues = {
  incoming_payment_confirmation: number;
  payment_method: string;
  payment_note?: string;
};

type PaymentRequiredModalProps = {
  open: boolean;
  project?: ProjectBoardCard | null;
  targetStepKey?: string | null;
  details?: WorkflowFinancialBlockedDetails | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: PaymentRequiredFormValues) => void;
};

export function PaymentRequiredModal({
  open,
  project,
  targetStepKey,
  details,
  loading,
  onCancel,
  onSubmit,
}: PaymentRequiredModalProps) {
  const [form] = Form.useForm<PaymentRequiredFormValues>();

  return (
    <Modal
      title="Cần xác nhận thanh toán"
      open={open}
      okText="Xác nhận và chuyển bước"
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Alert
        type="warning"
        showIcon
        message="Backend chặn chuyển bước vì bước đích cần điều kiện thanh toán."
        description={`Project ${project?.name ?? ""} sẽ được chuyển tới ${targetStepKey ?? "step đã chọn"} sau khi xác nhận tiền.`}
        className="workflow-modal-alert"
      />

      <Descriptions size="small" column={1} bordered className="workflow-payment-summary">
        <Descriptions.Item label="Số tiền cần thu">
          {formatCurrency(details?.required_amount)}
        </Descriptions.Item>
        <Descriptions.Item label="Đã thu hiện tại">
          {formatCurrency(details?.current_paid)}
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền backend gợi ý">
          {formatCurrency(details?.incoming_payment_confirmation)}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng sau xác nhận">
          {formatCurrency(details?.new_total_paid)}
        </Descriptions.Item>
      </Descriptions>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          incoming_payment_confirmation: details?.incoming_payment_confirmation ?? 0,
          payment_method: "BANK_TRANSFER",
        }}
        onFinish={onSubmit}
      >
        <Form.Item
          name="incoming_payment_confirmation"
          label="Số tiền xác nhận"
          rules={[
            { required: true, message: "Vui lòng nhập số tiền xác nhận." },
            { type: "number", min: 1, message: "Số tiền phải lớn hơn 0." },
          ]}
        >
          <InputNumber<number>
            min={0}
            precision={0}
            addonAfter="VND"
            className="workflow-form-full"
          />
        </Form.Item>

        <Form.Item
          name="payment_method"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán." }]}
        >
          <Select
            options={[
              { value: "BANK_TRANSFER", label: "Chuyển khoản" },
              { value: "CASH", label: "Tiền mặt" },
              { value: "CARD", label: "Thẻ" },
              { value: "OTHER", label: "Khác" },
            ]}
          />
        </Form.Item>

        <Form.Item name="payment_note" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Ví dụ: Khách đã chuyển cọc" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
