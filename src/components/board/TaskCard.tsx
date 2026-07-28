'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  MoreVert as MoreVertIcon,
  Flag as WeightIcon,
  InsertEmoticon as MilestoneIcon,
} from '@mui/icons-material';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Task, Label } from '@/types/board';

export type { Task, Label };

interface TaskCardProps {
  task: Task;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onMenuOpen, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Parse scoped labels (GitLab style)
  const parseScopedLabel = (label: string) => {
    if (label.includes('::')) {
      const [scope, name] = label.split('::');
      return { scope, name, isScoped: true };
    }
    return { scope: null, name: label, isScoped: false };
  };

  const formatWeight = (weight: number) => {
    if (weight === 1) return '1';
    if (weight === 2) return '2';
    if (weight === 3) return '3';
    return weight.toString();
  };

  const getDueDateColor = () => {
    if (task.due_date_status === 'overdue') {
      return '#db3b21'; // GitLab red
    }
    if (task.due_date_status === 'due_soon') {
      return '#e75e40'; // GitLab orange
    }
    return '#333';
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Mai';
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays > 0 && diffDays <= 7) {
      return `Thứ ${date.getDay() === 0 ? 7 : date.getDay()}`;
    }
    return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  // Get labels to display
  const displayLabels = task.labels?.custom_labels || [];
  const priorityLabel = task.labels?.priority;
  const statusLabel = task.labels?.task_status;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      sx={{
        mb: 1.5,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
          borderColor: 'rgba(66,133,244,0.3)',
        },
        borderRadius: 1.5,
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Header: Confidential icon, Title, Issue ID, Menu */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Box display="flex" alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
            {/* Confidential icon */}
            {task.confidential && (
              <Tooltip title="Bảo mật">
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    mr: 0.5,
                    mt: 0.25,
                  }}
                >
                  <LockIcon
                    sx={{
                      fontSize: 14,
                      color: '#666',
                    }}
                  />
                </Box>
              </Tooltip>
            )}

            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* Title with ID */}
              <Typography
                variant="body2"
                fontWeight="500"
                sx={{
                  lineHeight: 1.4,
                  color: '#333',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {task.issue_number && (
                  <span
                    style={{
                      color: '#666',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      marginRight: '4px',
                    }}
                  >
                    #{task.issue_number}
                  </span>
                )}
                {task.title}
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            sx={{
              ml: 1,
              opacity: 0.5,
              '&:hover': { opacity: 1 },
              p: 0.5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(e, task);
            }}
          >
            <MoreVertIcon fontSize="small" sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Description preview */}
        {task.description && (
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 1,
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Labels row - GitLab styled */}
        <Box display="flex" alignItems="center" gap={0.5} mb={1} flexWrap="wrap">
          {/* Priority label (scoped style) */}
          {priorityLabel && (
            <Chip
              label={priorityLabel.name}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: priorityLabel.bg_color,
                color: priorityLabel.color,
                border: `1px solid ${priorityLabel.color}20`,
                fontWeight: 600,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}

          {/* Status label */}
          {statusLabel && (
            <Chip
              label={statusLabel.name}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: statusLabel.bg_color,
                color: statusLabel.color,
                border: `1px solid ${statusLabel.color}20`,
                fontWeight: 600,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}

          {/* Custom labels */}
          {displayLabels.slice(0, 3).map((label) => {
            const parsed = parseScopedLabel(label.name);
            return (
              <Chip
                key={label.id}
                label={parsed.name}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: label.bg_color,
                  color: label.color,
                  border: `1px solid ${label.color}20`,
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            );
          })}

          {displayLabels.length > 3 && (
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
              +{displayLabels.length - 3}
            </Typography>
          )}
        </Box>

        {/* Footer row */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mt: 1,
            pt: 0.75,
            borderTop: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Left side: Weight, Milestone, Due date */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Weight */}
            {task.weight > 0 && (
              <Tooltip title={`Story Points: ${task.weight}`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                  }}
                >
                  <WeightIcon sx={{ fontSize: 14, color: '#666' }} />
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                    {formatWeight(task.weight)}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {/* Milestone */}
            {task.milestone && (
              <Tooltip title={`Milestone: ${task.milestone.title}`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                  }}
                >
                  <MilestoneIcon sx={{ fontSize: 14, color: '#666' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontSize: '0.7rem',
                      maxWidth: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.milestone.title}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {/* Due date */}
            {task.due_date && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: getDueDateColor(),
                    fontSize: '0.7rem',
                    fontWeight: task.due_date_status !== 'none' ? 600 : 400,
                  }}
                >
                  {formatDueDate(task.due_date)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right side: Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <AvatarGroup
              max={3}
              sx={{
                '& .MuiAvatar-root': {
                  width: 20,
                  height: 20,
                  fontSize: '0.7rem',
                  border: '2px solid white',
                },
              }}
            >
              {task.assignees.map((assignee) => (
                <Tooltip key={assignee.id} title={assignee.name}>
                  <Avatar
                    src={assignee.avatar_url}
                    sx={{
                      width: 20,
                      height: 20,
                      fontSize: '0.7rem',
                    }}
                  >
                    {assignee.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          )}

          {/* Subtasks indicator */}
          {task.subtasks_count !== undefined && task.subtasks_count > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontSize: '0.7rem',
                }}
              >
                {task.subtasks_completed}/{task.subtasks_count}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Customer info (small, below footer) */}
        <Box
          sx={{
            mt: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.65rem' }}>
            {task.customer?.company_name || 'N/A'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}