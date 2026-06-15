"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Empty, Select, Skeleton, Space, Tabs, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  moveProjectWorkflowStep,
  type ProjectBoardCard,
  type ProjectBoardStep,
} from "@/api/projects.api";
import {
  getApiErrorCode,
  getApiErrorDetails,
  getDebugErrorInfo,
  getUserFacingErrorMessage,
  type WorkflowFinancialBlockedDetails,
} from "@/api/errors";
import { workflowBoardQueryKeys, useProjectBoard, useWorkflowTemplates } from "./workflow-board.queries";
import { WorkflowMacroColumn } from "./WorkflowMacroColumn";
import { PaymentRequiredModal, type PaymentRequiredFormValues } from "./PaymentRequiredModal";
import { ConflictOverrideModal } from "./ConflictOverrideModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { useOverrideProjectConflict } from "./workflow-board.queries";

type PendingMove = {
  project: ProjectBoardCard;
  targetStep: ProjectBoardStep;
};

export function WorkflowBoardPage() {
  const queryClient = useQueryClient();
  const templatesQuery = useWorkflowTemplates();
  const templates = templatesQuery.data?.data ?? [];
  const [workflowTemplateId, setWorkflowTemplateId] = useState<string | null>(null);
  const [activeMacro, setActiveMacro] = useState<string>("INTAKE");
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [paymentDetails, setPaymentDetails] =
    useState<WorkflowFinancialBlockedDetails | null>(null);
  const [overrideProject, setOverrideProject] = useState<ProjectBoardCard | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowTemplateId && templates.length > 0) {
      setWorkflowTemplateId(templates.find((template) => template.is_default)?.id ?? templates[0].id);
    }
  }, [templates, workflowTemplateId]);

  const boardQuery = useProjectBoard(workflowTemplateId);
  const board = boardQuery.data;

  const stepsByKey = useMemo(() => {
    const map = new Map<string, ProjectBoardStep>();
    board?.macro_columns.forEach((macroColumn) => {
      macroColumn.steps.forEach((step) => map.set(step.step_key, step));
    });
    return map;
  }, [board]);

  const moveMutation = useMutation({
    mutationFn: ({
      project,
      targetStepKey,
      payment,
    }: {
      project: ProjectBoardCard;
      targetStepKey: string;
      payment?: PaymentRequiredFormValues;
    }) =>
      moveProjectWorkflowStep(project.id, {
        target_step_key: targetStepKey,
        ...payment,
      }),
    onSuccess: () => {
      setPendingMove(null);
      setPaymentDetails(null);
      if (workflowTemplateId) {
        queryClient.invalidateQueries({
          queryKey: workflowBoardQueryKeys.board(workflowTemplateId),
        });
      }
    },
    onError: (error) => {
      if (getApiErrorCode(error) === "ERR_WORKFLOW_FINANCIAL_BLOCKED") {
        setPaymentDetails(
          getApiErrorDetails<WorkflowFinancialBlockedDetails>(error) ?? {},
        );
        return;
      }

      setWarningMessage(getUserFacingErrorMessage(error));
    },
  });

  const overrideMutation = useOverrideProjectConflict(workflowTemplateId ?? "");

  function handleDragEnd(event: DragEndEvent) {
    const project = event.active.data.current?.project as ProjectBoardCard | undefined;
    const targetStep = event.over?.id ? stepsByKey.get(String(event.over.id)) : undefined;

    if (!project || !targetStep) {
      return;
    }

    if (project.conflict_status === "CONFLICT_DETECTED") {
      setWarningMessage("Project đang bị conflict, không được move.");
      return;
    }

    if (!project.actions?.move) {
      setWarningMessage("Bạn không có quyền move project này.");
      return;
    }

    if (project.current_workflow_step_key === targetStep.step_key) {
      return;
    }

    setWarningMessage(null);
    setPendingMove({ project, targetStep });
    moveMutation.mutate({ project, targetStepKey: targetStep.step_key });
  }

  const visibleMacroColumns = board?.macro_columns ?? [];
  const activeMacroColumn =
    visibleMacroColumns.find((column) => column.macro_column === activeMacro) ??
    visibleMacroColumns[0];

  return (
    <main className="app-shell">
      <section className="workflow-page">
        <header className="workflow-page__header">
          <div>
            <Typography.Title level={2}>Project Board</Typography.Title>
            <Typography.Text type="secondary">
              Board theo workflow engine: macro column cố định, step con động theo template.
            </Typography.Text>
          </div>

          <Space wrap>
            <Select
              className="workflow-template-select"
              placeholder="Chọn workflow template"
              loading={templatesQuery.isLoading}
              value={workflowTemplateId ?? undefined}
              onChange={setWorkflowTemplateId}
              options={templates.map((template) => ({
                value: template.id,
                label: template.template_name,
              }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => boardQuery.refetch()}>
              Tải lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo project
            </Button>
          </Space>
        </header>

        {warningMessage ? (
          <Alert
            type="warning"
            showIcon
            message={warningMessage}
            closable
            onClose={() => setWarningMessage(null)}
          />
        ) : null}

        {templatesQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={getUserFacingErrorMessage(templatesQuery.error)}
            description={getDebugErrorInfo(templatesQuery.error)}
          />
        ) : null}

        {!workflowTemplateId && !templatesQuery.isLoading ? (
          <Empty description="Chưa có workflow template active" />
        ) : null}

        {boardQuery.isLoading ? (
          <Skeleton active paragraph={{ rows: 12 }} />
        ) : boardQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={getUserFacingErrorMessage(boardQuery.error)}
            description={getDebugErrorInfo(boardQuery.error)}
            action={<Button onClick={() => boardQuery.refetch()}>Retry</Button>}
          />
        ) : board ? (
          <>
            <div className="workflow-board workflow-board--desktop">
              <DndContext onDragEnd={handleDragEnd}>
                {visibleMacroColumns.map((macroColumn) => (
                  <WorkflowMacroColumn
                    key={macroColumn.macro_column}
                    macroColumn={macroColumn}
                    onOverrideConflict={setOverrideProject}
                  />
                ))}
              </DndContext>
            </div>

            <div className="workflow-board--mobile">
              <DndContext onDragEnd={handleDragEnd}>
                <Tabs
                  activeKey={activeMacroColumn?.macro_column}
                  onChange={setActiveMacro}
                  items={visibleMacroColumns.map((macroColumn) => ({
                    key: macroColumn.macro_column,
                    label: macroColumn.title,
                    children: (
                      <WorkflowMacroColumn
                        macroColumn={macroColumn}
                        onOverrideConflict={setOverrideProject}
                      />
                    ),
                  }))}
                />
              </DndContext>
            </div>
          </>
        ) : null}
      </section>

      <PaymentRequiredModal
        open={Boolean(pendingMove && paymentDetails)}
        project={pendingMove?.project}
        targetStepKey={pendingMove?.targetStep.step_key}
        details={paymentDetails}
        loading={moveMutation.isPending}
        onCancel={() => {
          setPendingMove(null);
          setPaymentDetails(null);
        }}
        onSubmit={(payment) => {
          if (!pendingMove) {
            return;
          }

          moveMutation.mutate({
            project: pendingMove.project,
            targetStepKey: pendingMove.targetStep.step_key,
            payment,
          });
        }}
      />

      <ConflictOverrideModal
        open={Boolean(overrideProject)}
        project={overrideProject}
        loading={overrideMutation.isPending}
        onCancel={() => setOverrideProject(null)}
        onSubmit={(overrideJustification) => {
          if (!overrideProject) {
            return;
          }

          overrideMutation.mutate(
            {
              projectId: overrideProject.id,
              payload: { override_justification: overrideJustification },
            },
            {
              onSuccess: () => setOverrideProject(null),
              onError: (error) => setWarningMessage(getUserFacingErrorMessage(error)),
            },
          );
        }}
      />

      <CreateProjectModal
        open={createOpen}
        workflowTemplates={templates}
        defaultWorkflowTemplateId={workflowTemplateId}
        onCancel={() => setCreateOpen(false)}
        onCreated={(project) => {
          if (project.conflict_status === "CONFLICT_DETECTED") {
            setWarningMessage(
              "Project vừa tạo bị phát hiện conflict. Card sẽ bị khóa move/assign cho đến khi xử lý hoặc ghi đè.",
            );
          }
        }}
      />
    </main>
  );
}
