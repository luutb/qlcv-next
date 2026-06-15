"use client";

import { Alert, Form, Input, InputNumber, Modal, Select } from "antd";
import type { CreateProjectRequest, ProjectSummary } from "@/api/projects.api";
import type { WorkflowTemplate } from "@/api/workflow.api";
import { getUserFacingErrorMessage } from "@/api/errors";
import { useCreateProject } from "./workflow-board.queries";

type CreateProjectModalProps = {
  open: boolean;
  workflowTemplates: WorkflowTemplate[];
  defaultWorkflowTemplateId?: string | null;
  onCancel: () => void;
  onCreated?: (project: ProjectSummary) => void;
};

export function CreateProjectModal({
  open,
  workflowTemplates,
  defaultWorkflowTemplateId,
  onCancel,
  onCreated,
}: CreateProjectModalProps) {
  const [form] = Form.useForm<CreateProjectRequest>();
  const createProjectMutation = useCreateProject();

  return (
    <Modal
      title="Tạo project"
      open={open}
      okText="Tạo project"
      cancelText="Hủy"
      confirmLoading={createProjectMutation.isPending}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
      width={680}
    >
      {createProjectMutation.isError ? (
        <Alert
          type="error"
          showIcon
          message={getUserFacingErrorMessage(createProjectMutation.error)}
          className="workflow-modal-alert"
        />
      ) : null}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          hourly_rate: 0,
          total_contract_value: 0,
          workflow_template_id: defaultWorkflowTemplateId ?? undefined,
        }}
        onFinish={(values) => {
          createProjectMutation.mutate(values, {
            onSuccess: (project) => {
              onCreated?.(project);
              form.resetFields();
              onCancel();
            },
          });
        }}
      >
        <Form.Item
          name="customer_id"
          label="Customer ID"
          rules={[{ required: true, message: "Vui lòng nhập customer_id." }]}
        >
          <Input placeholder="uuid" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên project"
          rules={[{ required: true, message: "Vui lòng nhập tên project." }]}
        >
          <Input placeholder="Tư vấn cấu trúc Tập đoàn X" />
        </Form.Item>

        <Form.Item
          name="workflow_template_id"
          label="Workflow template"
          rules={[{ required: true, message: "Vui lòng chọn workflow template." }]}
        >
          <Select
            placeholder="Chọn workflow"
            options={workflowTemplates.map((template) => ({
              value: template.id,
              label: template.template_name,
            }))}
          />
        </Form.Item>

        <div className="workflow-form-grid">
          <Form.Item
            name="hourly_rate"
            label="Hourly rate"
            rules={[{ required: true, message: "Vui lòng nhập hourly_rate." }]}
          >
            <InputNumber<number> min={0} precision={0} addonAfter="VND" />
          </Form.Item>

          <Form.Item
            name="total_contract_value"
            label="Tổng giá trị hợp đồng"
            rules={[{ required: true, message: "Vui lòng nhập tổng giá trị hợp đồng." }]}
          >
            <InputNumber<number> min={0} precision={0} addonAfter="VND" />
          </Form.Item>
        </div>

        <Form.Item name="opposing_party_name" label="Tên bên đối ứng">
          <Input placeholder="Công ty B" />
        </Form.Item>

        <Form.Item name="opposing_party_tax_code" label="Mã số thuế bên đối ứng">
          <Input placeholder="0109999999" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
