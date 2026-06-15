"use client";

import { LockOutlined, WarningOutlined } from "@ant-design/icons";
import { useDraggable } from "@dnd-kit/core";
import { Button, Space, Tag, Tooltip, Typography } from "antd";
import type { ProjectBoardCard } from "@/api/projects.api";
import { CONFLICT_LABELS, formatCurrency, getConflictColor } from "./workflow-board.utils";

type ProjectWorkflowCardProps = {
  project: ProjectBoardCard;
  onOverrideConflict: (project: ProjectBoardCard) => void;
};

export function ProjectWorkflowCard({
  project,
  onOverrideConflict,
}: ProjectWorkflowCardProps) {
  const hasConflict = project.conflict_status === "CONFLICT_DETECTED";
  const canMove = Boolean(project.actions?.move) && !hasConflict;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    data: { project },
    disabled: !canMove,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      className={[
        "workflow-card",
        hasConflict ? "workflow-card--conflict" : "",
        !canMove ? "workflow-card--locked" : "",
        isDragging ? "workflow-card--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="workflow-card__header">
        <Typography.Text strong className="workflow-card__title">
          {project.name}
        </Typography.Text>
        {!canMove ? (
          <Tooltip title={hasConflict ? "Project đang bị conflict" : "Không có quyền move"}>
            <LockOutlined className="workflow-card__lock" />
          </Tooltip>
        ) : null}
      </div>

      <Space size={6} wrap>
        {project.conflict_status ? (
          <Tag
            color={getConflictColor(project.conflict_status)}
            icon={hasConflict ? <WarningOutlined /> : undefined}
          >
            {CONFLICT_LABELS[project.conflict_status]}
          </Tag>
        ) : null}
        {hasConflict ? <Tag color="red">Khóa move/assign</Tag> : null}
      </Space>

      <dl className="workflow-card__money">
        <div>
          <dt>Hợp đồng</dt>
          <dd>{formatCurrency(project.total_contract_value)}</dd>
        </div>
        <div>
          <dt>Đã thu</dt>
          <dd>{formatCurrency(project.total_paid)}</dd>
        </div>
        <div>
          <dt>Còn lại</dt>
          <dd>{formatCurrency(project.remaining_amount)}</dd>
        </div>
      </dl>

      {project.opposing_party_name ? (
        <Typography.Text type="secondary" className="workflow-card__opposing">
          Đối ứng: {project.opposing_party_name}
        </Typography.Text>
      ) : null}

      {hasConflict && project.actions?.override_conflict ? (
        <Button
          size="small"
          danger
          onClick={(event) => {
            event.stopPropagation();
            onOverrideConflict(project);
          }}
        >
          Ghi đè conflict
        </Button>
      ) : null}
    </article>
  );
}
