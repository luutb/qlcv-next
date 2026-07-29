"use client";

import { PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import { MACRO_COLUMNS, type CreateWorkflowTemplateRequest } from "@/api/workflow.api";
import { getUserFacingErrorMessage } from "@/api/errors";
import { useCreateWorkflowTemplate, useWorkflowTemplates } from "./queries/workflow-template.queries";
import { MACRO_COLUMN_TITLES } from "./workflow-template.utils";

export function WorkflowTemplateSettingsPage() {
  const templatesQuery = useWorkflowTemplates();
  const createMutation = useCreateWorkflowTemplate();
  const [form] = Form.useForm<CreateWorkflowTemplateRequest>();

  return (
    <main className="app-shell">
      <section className="workflow-page">
        <header className="workflow-page__header">
          <div>
            <Typography.Title level={2}>Workflow Settings</Typography.Title>
            <Typography.Text type="secondary">
              Quản lý workflow template và các bước nghiệp vụ cho project board.
            </Typography.Text>
          </div>
        </header>

        <div className="workflow-settings-grid">
          <section>
            <Typography.Title level={4}>Template active</Typography.Title>
            {templatesQuery.isLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : templatesQuery.isError ? (
              <Alert
                type="error"
                showIcon
                message={getUserFacingErrorMessage(templatesQuery.error)}
              />
            ) : templatesQuery.data?.data.length ? (
              <div className="workflow-template-list">
                {templatesQuery.data.data.map((template) => (
                  <Card key={template.id} size="small">
                    <Space direction="vertical" size={8}>
                      <Space wrap>
                        <Typography.Text strong>{template.template_name}</Typography.Text>
                        {template.is_default ? <Tag color="blue">Default</Tag> : null}
                        <Tag color={template.active === false ? "default" : "green"}>
                          {template.active === false ? "Inactive" : "Active"}
                        </Tag>
                      </Space>
                      {template.description ? (
                        <Typography.Text type="secondary">{template.description}</Typography.Text>
                      ) : null}
                      <Typography.Text type="secondary">
                        {template.steps?.length ?? 0} bước
                      </Typography.Text>
                    </Space>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có workflow template active" />
            )}
          </section>

          <section>
            <Typography.Title level={4}>Tạo workflow template</Typography.Title>

            {createMutation.isError ? (
              <Alert
                type="error"
                showIcon
                message={getUserFacingErrorMessage(createMutation.error)}
                className="workflow-modal-alert"
              />
            ) : null}

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                is_default: false,
                steps: [
                  {
                    step_key: "STEP_01_INTAKE",
                    step_name: "Tiếp nhận",
                    macro_column: "INTAKE",
                    sort_order: 10,
                  },
                  {
                    step_key: "STEP_04_CONFIRM_DEPOSIT",
                    step_name: "Xác nhận cọc",
                    macro_column: "BILLING",
                    sort_order: 40,
                    financial_trigger: {
                      requires_payment: true,
                      payment_type: "PERCENTAGE",
                      value_threshold: 30,
                      payment_label: "Tiền cọc",
                      allow_overpayment: true,
                    },
                  },
                ],
              }}
              onFinish={(values) => {
                createMutation.mutate(values, {
                  onSuccess: () => form.resetFields(),
                });
              }}
            >
              <Form.Item
                name="template_name"
                label="Tên template"
                rules={[{ required: true, message: "Vui lòng nhập tên template." }]}
              >
                <Input placeholder="Lean Legal Default Workflow" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item name="is_default" label="Đặt làm default" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Divider />

              <Form.List name="steps">
                {(fields, { add, remove }) => (
                  <Space direction="vertical" className="workflow-form-full" size={16}>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={`Step ${field.name + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button danger type="link" onClick={() => remove(field.name)}>
                              Xóa
                            </Button>
                          ) : null
                        }
                      >
                        <div className="workflow-form-grid">
                          <Form.Item
                            {...field}
                            name={[field.name, "step_key"]}
                            label="Step key"
                            rules={[{ required: true, message: "Nhập step_key." }]}
                          >
                            <Input placeholder="STEP_04_CONFIRM_DEPOSIT" />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "step_name"]}
                            label="Step name"
                            rules={[{ required: true, message: "Nhập step_name." }]}
                          >
                            <Input placeholder="Xác nhận cọc" />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "macro_column"]}
                            label="Macro column"
                            rules={[{ required: true, message: "Chọn macro column." }]}
                          >
                            <Select
                              options={MACRO_COLUMNS.map((macroColumn) => ({
                                value: macroColumn,
                                label: MACRO_COLUMN_TITLES[macroColumn],
                              }))}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "sort_order"]}
                            label="Sort order"
                            rules={[{ required: true, message: "Nhập sort_order." }]}
                          >
                            <InputNumber<number> precision={0} className="workflow-form-full" />
                          </Form.Item>
                        </div>

                        <Divider>
                          Financial trigger
                        </Divider>

                        <Form.Item
                          {...field}
                          name={[field.name, "financial_trigger", "requires_payment"]}
                          valuePropName="checked"
                        >
                          <Checkbox>Step này yêu cầu thanh toán</Checkbox>
                        </Form.Item>

                        <div className="workflow-form-grid">
                          <Form.Item
                            {...field}
                            name={[field.name, "financial_trigger", "payment_type"]}
                            label="Payment type"
                          >
                            <Select
                              allowClear
                              options={[
                                { value: "PERCENTAGE", label: "Percentage" },
                                { value: "REMAINING", label: "Remaining" },
                                { value: "FIXED", label: "Fixed" },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "financial_trigger", "value_threshold"]}
                            label="Value threshold"
                          >
                            <InputNumber<number>
                              min={0}
                              precision={0}
                              className="workflow-form-full"
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "financial_trigger", "payment_label"]}
                            label="Payment label"
                          >
                            <Input placeholder="Tiền cọc" />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "financial_trigger", "allow_overpayment"]}
                            label="Cho phép trả vượt"
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}

                    <Button
                      icon={<PlusOutlined />}
                      onClick={() =>
                        add({
                          step_key: "",
                          step_name: "",
                          macro_column: "IN_PROGRESS",
                          sort_order: (fields.length + 1) * 10,
                        })
                      }
                    >
                      Thêm step
                    </Button>
                  </Space>
                )}
              </Form.List>

              <Divider />

              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Tạo workflow template
              </Button>
            </Form>
          </section>
        </div>
      </section>
    </main>
  );
}
