"use client";

import { useDroppable } from "@dnd-kit/core";
import { Box, Chip, Stack, Typography } from "@mui/material";
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
    <Box
      ref={setNodeRef}
      sx={{
        bgcolor: isOver ? "action.hover" : "grey.50",
        border: "1px solid",
        borderColor: isOver ? "primary.main" : "divider",
        borderRadius: 2,
        p: 1,
        minHeight: 160,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
      >
        <Typography sx={{ fontWeight: 700 }}>{step.step_name}</Typography>
        <Chip size="small" label={step.projects.length} />
      </Stack>

      <Stack spacing={1}>
        {step.projects.length > 0 ? (
          step.projects.map((project) => (
            <ProjectWorkflowCard
              key={project.id}
              project={project}
              onOverrideConflict={onOverrideConflict}
            />
          ))
        ) : (
          <Box
            sx={{
              minHeight: 90,
              display: "grid",
              placeItems: "center",
              color: "text.secondary",
              fontSize: 13,
            }}
          >
            Chưa có project
          </Box>
        )}
      </Stack>
    </Box>
  );
}
