"use client";

import { Typography } from "antd";
import type { ProjectBoardCard, ProjectBoardMacroColumn } from "@/api/projects.api";
import { WorkflowStepColumn } from "./WorkflowStepColumn";

type WorkflowMacroColumnProps = {
  macroColumn: ProjectBoardMacroColumn;
  onOverrideConflict: (project: ProjectBoardCard) => void;
};

export function WorkflowMacroColumn({
  macroColumn,
  onOverrideConflict,
}: WorkflowMacroColumnProps) {
  const projectCount = macroColumn.steps.reduce((count, step) => count + step.projects.length, 0);

  return (
    <section className="workflow-macro">
      <header className="workflow-macro__header">
        <div>
          <Typography.Title level={4}>{macroColumn.title}</Typography.Title>
          <Typography.Text type="secondary">
            {macroColumn.steps.length} bước, {projectCount} project
          </Typography.Text>
        </div>
      </header>

      <div className="workflow-macro__steps">
        {macroColumn.steps
          .slice()
          .sort((left, right) => left.sort_order - right.sort_order)
          .map((step) => (
            <WorkflowStepColumn
              key={step.step_key}
              step={step}
              onOverrideConflict={onOverrideConflict}
            />
          ))}
      </div>
    </section>
  );
}
