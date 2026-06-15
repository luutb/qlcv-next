"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge, Empty, Typography } from "antd";
import type { ProjectBoardCard, ProjectBoardStep } from "@/api/projects.api";
import { ProjectWorkflowCard } from "./ProjectWorkflowCard";

type WorkflowStepColumnProps = {
  step: ProjectBoardStep;
  onOverrideConflict: (project: ProjectBoardCard) => void;
};

export function WorkflowStepColumn({ step, onOverrideConflict }: WorkflowStepColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: step.step_key,
    data: { step },
  });

  return (
    <section
      ref={setNodeRef}
      className={["workflow-step", isOver ? "workflow-step--over" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="workflow-step__header">
        <Typography.Text strong>{step.step_name}</Typography.Text>
        <Badge count={step.projects.length} showZero color="#64748b" />
      </header>

      <div className="workflow-step__cards">
        {step.projects.length > 0 ? (
          step.projects.map((project) => (
            <ProjectWorkflowCard
              key={project.id}
              project={project}
              onOverrideConflict={onOverrideConflict}
            />
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có project"
            className="workflow-step__empty"
          />
        )}
      </div>
    </section>
  );
}
