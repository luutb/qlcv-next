"use client";

import { Box, Stack, Typography } from "@mui/material";
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
  const projectCount = macroColumn.steps.reduce(
    (count, step) => count + step.projects.length,
    0,
  );

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        minWidth: 360,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
        <Stack spacing={0.25}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
            {macroColumn.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {macroColumn.steps.length} bước, {projectCount} project
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={1.25} sx={{ p: 1.25 }}>
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
      </Stack>
    </Box>
  );
}
