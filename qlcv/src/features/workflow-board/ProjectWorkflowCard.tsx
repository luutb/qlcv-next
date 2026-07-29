"use client";

import { DragIndicatorOutlined, LockOutlined, WarningOutlined } from "@mui/icons-material";
import { Box, Button, Chip, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
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
  const canMove = (project.actions?.move ?? true) && !hasConflict;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    data: { project },
    disabled: !canMove,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Paper
      ref={setNodeRef}
      component="article"
      elevation={0}
      sx={{
        p: 1.25,
        border: "1px solid",
        borderColor: hasConflict ? "error.main" : "divider",
        borderRadius: 2,
        cursor: canMove ? "grab" : "not-allowed",
        opacity: isDragging ? 0.72 : 1,
        boxShadow: hasConflict ? "inset 3px 0 0 #d32f2f" : "none",
        bgcolor: "background.paper",
        touchAction: "none",
      }}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Stack spacing={1}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
          <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              {canMove ? <DragIndicatorOutlined sx={{ fontSize: 16, color: "text.secondary" }} /> : null}
              <Typography sx={{ fontWeight: 700, lineHeight: 1.35, minWidth: 0 }}>
                {project.name}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {canMove ? "Kéo để đổi bước" : hasConflict ? "Project đang bị conflict" : "Không có quyền move"}
            </Typography>
          </Stack>
          {!canMove ? (
            <Tooltip title={hasConflict ? "Project đang bị conflict" : "Không có quyền move"}>
              <LockOutlined fontSize="small" />
            </Tooltip>
          ) : null}
        </Box>

        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
          {project.conflict_status ? (
            <Chip
              size="small"
              color={getConflictColor(project.conflict_status)}
              icon={hasConflict ? <WarningOutlined fontSize="small" /> : undefined}
              label={CONFLICT_LABELS[project.conflict_status]}
            />
          ) : null}
          {hasConflict ? <Chip size="small" color="error" label="Khóa move/assign" /> : null}
        </Stack>

        <Box
          component="dl"
          sx={{
            display: "grid",
            gap: 0.75,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            m: 0,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" component="dt">
              Hợp đồng
            </Typography>
            <Typography component="dd" sx={{ m: 0, fontWeight: 600, fontSize: 12 }}>
              {formatCurrency(project.total_contract_value)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" component="dt">
              Đã thu
            </Typography>
            <Typography component="dd" sx={{ m: 0, fontWeight: 600, fontSize: 12 }}>
              {formatCurrency(project.total_paid)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" component="dt">
              Còn lại
            </Typography>
            <Typography component="dd" sx={{ m: 0, fontWeight: 600, fontSize: 12 }}>
              {formatCurrency(project.remaining_amount)}
            </Typography>
          </Box>
        </Box>

        {project.opposing_party_name ? (
          <Typography variant="body2" color="text.secondary">
            Đối ứng: {project.opposing_party_name}
          </Typography>
        ) : null}

        {hasConflict && project.actions?.override_conflict ? (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              onOverrideConflict(project);
            }}
          >
            Ghi đè conflict
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
