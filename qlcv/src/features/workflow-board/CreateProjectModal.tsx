"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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
  const createProjectMutation = useCreateProject();
  const initialValues = useMemo<CreateProjectRequest>(
    () => ({
      customer_id: "",
      name: "",
      hourly_rate: 0,
      workflow_template_id: defaultWorkflowTemplateId ?? workflowTemplates[0]?.id,
      total_contract_value: 0,
      opposing_party_name: "",
      opposing_party_tax_code: "",
    }),
    [defaultWorkflowTemplateId, workflowTemplates],
  );
  const [values, setValues] = useState<CreateProjectRequest>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateProjectRequest, string>>>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setFieldErrors({});
    }
  }, [initialValues, open]);

  function submit(values: CreateProjectRequest) {
    const nextErrors = validateProject(values);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    createProjectMutation.mutate(values, {
      onSuccess: (project) => {
        onCreated?.(project);
        setValues(initialValues);
        setFieldErrors({});
        onCancel();
      },
    });
  }

  function updateField<TKey extends keyof CreateProjectRequest>(
    key: TKey,
    value: CreateProjectRequest[TKey],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>Tạo project</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {createProjectMutation.isError ? (
            <Alert severity="error">{getUserFacingErrorMessage(createProjectMutation.error)}</Alert>
          ) : null}

          <Box className="workflow-form-grid">
            <TextField
              label="Customer ID"
              value={values.customer_id}
              onChange={(event) => updateField("customer_id", event.target.value)}
              error={Boolean(fieldErrors.customer_id)}
              helperText={fieldErrors.customer_id}
              fullWidth
            />
            <TextField
              label="Tên project"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              fullWidth
            />
            <TextField
              select
              label="Workflow template"
              value={values.workflow_template_id ?? ""}
              onChange={(event) => updateField("workflow_template_id", event.target.value)}
              error={Boolean(fieldErrors.workflow_template_id)}
              helperText={fieldErrors.workflow_template_id}
              fullWidth
            >
              {workflowTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.template_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Hourly rate"
              type="number"
              value={values.hourly_rate}
              onChange={(event) => updateField("hourly_rate", Number(event.target.value))}
              error={Boolean(fieldErrors.hourly_rate)}
              helperText={fieldErrors.hourly_rate}
              fullWidth
            />
            <TextField
              label="Tổng giá trị hợp đồng"
              type="number"
              value={values.total_contract_value}
              onChange={(event) => updateField("total_contract_value", Number(event.target.value))}
              error={Boolean(fieldErrors.total_contract_value)}
              helperText={fieldErrors.total_contract_value}
              fullWidth
            />
            <TextField
              label="Mã số thuế bên đối ứng"
              value={values.opposing_party_tax_code ?? ""}
              onChange={(event) => updateField("opposing_party_tax_code", event.target.value)}
              fullWidth
            />
            <TextField
              className="workflow-form-full"
              label="Tên bên đối ứng"
              value={values.opposing_party_name ?? ""}
              onChange={(event) => updateField("opposing_party_name", event.target.value)}
              fullWidth
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => submit(values)}
          disabled={createProjectMutation.isPending}
        >
          Tạo project
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function validateProject(
  values: CreateProjectRequest,
): Partial<Record<keyof CreateProjectRequest, string>> {
  const errors: Partial<Record<keyof CreateProjectRequest, string>> = {};

  if (!values.customer_id.trim()) {
    errors.customer_id = "Vui lòng nhập customer ID.";
  }

  if (!values.name.trim()) {
    errors.name = "Vui lòng nhập tên project.";
  }

  if (!values.workflow_template_id) {
    errors.workflow_template_id = "Vui lòng chọn workflow template.";
  }

  if (!Number.isFinite(values.hourly_rate) || values.hourly_rate < 0) {
    errors.hourly_rate = "Hourly rate phải lớn hơn hoặc bằng 0.";
  }

  if (!Number.isFinite(values.total_contract_value) || values.total_contract_value < 0) {
    errors.total_contract_value = "Tổng giá trị hợp đồng phải lớn hơn hoặc bằng 0.";
  }

  return errors;
}
