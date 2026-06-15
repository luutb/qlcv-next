"use client";

import { Alert, Form, Input, Modal, Typography } from "antd";
import type { ProjectBoardCard } from "@/api/projects.api";

type ConflictOverrideModalProps = {
  open: boolean;
  project?: ProjectBoardCard | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (overrideJustification: string) => void;
};

export function ConflictOverrideModal({
  open,
  project,
  loading,
  onCancel,
  onSubmit,
}: ConflictOverrideModalProps) {
  const [form] = Form.useForm<{ override_justification: string }>();

  return (
    <Modal
      title="Ghi đè conflict"
      open={open}
      okText="Ghi đè conflict"
      okButtonProps={{ danger: true }}
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Alert
        type="error"
        showIcon
        message="Thao tác nhạy cảm audit"
        description="Chỉ ghi đè conflict khi đã có cơ sở nghiệp vụ rõ ràng. Lý do sẽ được gửi backend để lưu vết."
        className="workflow-modal-alert"
      />

      <Typography.Paragraph type="secondary">
        Project: <Typography.Text strong>{project?.name}</Typography.Text>
      </Typography.Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit(values.override_justification)}
      >
        <Form.Item
          name="override_justification"
          label="Lý do ghi đè"
          rules={[
            { required: true, message: "Vui lòng nhập lý do ghi đè." },
            {
              min: 50,
              message: "Lý do ghi đè cần tối thiểu 50 ký tự.",
            },
          ]}
        >
          <Input.TextArea
            rows={5}
            showCount
            minLength={50}
            placeholder="Mô tả cơ sở kiểm tra conflict và lý do vẫn tiếp tục xử lý project..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
