'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import {
  InsertEmoticon as MilestoneIcon,
  Person as PersonIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';

interface Task {
  id: number;
  [key: string]: any;
}

interface SwimlaneData {
  id: string;
  title: string;
  tasks: Task[];
  icon?: 'milestone' | 'assignee' | 'folder';
}

interface SwimlaneProps {
  swimlane: SwimlaneData;
  children: React.ReactNode;
  swimlaneIndex: number;
  totalSwimlanes: number;
}

export default function Swimlane({
  swimlane,
  children,
  swimlaneIndex,
  totalSwimlanes,
}: SwimlaneProps) {
  const getIcon = () => {
    switch (swimlane.icon) {
      case 'milestone':
        return <MilestoneIcon fontSize="small" />;
      case 'assignee':
        return <PersonIcon fontSize="small" />;
      case 'folder':
        return <FolderIcon fontSize="small" />;
      default:
        return <FolderIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ mb: swimlaneIndex < totalSwimlanes - 1 ? 3 : 0 }}>
      {/* GitLab-style Swimlane Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          backgroundColor: '#f8f9fa',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)',
          borderRadius: 1.5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                backgroundColor: 'rgba(66,133,244,0.1)',
                borderRadius: 1,
              }}
            >
              {getIcon()}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
              {swimlane.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                ml: 1,
              }}
            >
              {swimlane.tasks.length}
            </Typography>
          </Box>
        </Box>

        {/* Swimlane Content */}
        <Box sx={{ p: 1.5, backgroundColor: '#ffffff' }}>{children}</Box>
      </Paper>

      {/* GitLab-style separator between swimlanes */}
      {swimlaneIndex < totalSwimlanes - 1 && (
        <Box
          sx={{
            height: 2,
            backgroundColor: 'rgba(0,0,0,0.06)',
            borderRadius: 1,
            mb: 2,
          }}
        />
      )}
    </Box>
  );
}

// Helper function to group tasks into swimlanes
export function groupTasksBySwimlane(
  tasks: Task[],
  swimlaneBy: 'milestone' | 'assignee' | 'none'
): SwimlaneData[] {
  if (swimlaneBy === 'none') {
    return [
      {
        id: 'default',
        title: 'Tất cả',
        tasks,
        icon: 'folder',
      },
    ];
  }

  if (swimlaneBy === 'milestone') {
    const groups = new Map<string, Task[]>();

    // Group by milestone
    tasks.forEach((task) => {
      const milestoneId = task.milestone?.id || 'no-milestone';
      const milestoneTitle = task.milestone?.title || 'Không có milestone';

      if (!groups.has(milestoneId)) {
        groups.set(milestoneId, []);
      }
      groups.get(milestoneId)?.push(task);
    });

    // Convert to SwimlaneData array
    return Array.from(groups.entries()).map(([id, groupTasks]) => ({
      id,
      title: id === 'no-milestone' ? 'Không có milestone' : groupTasks[0].milestone?.title || '',
      tasks: groupTasks,
      icon: 'milestone' as const,
    }));
  }

  if (swimlaneBy === 'assignee') {
    const groups = new Map<string, Task[]>();

    // Group by assignee
    tasks.forEach((task) => {
      const assigneeIds = task.assignees && task.assignees.length > 0
        ? task.assignees.map((a: any) => a.id).join(',')
        : 'no-assignee';

      if (!groups.has(assigneeIds)) {
        groups.set(assigneeIds, []);
      }
      groups.get(assigneeIds)?.push(task);
    });

    // Convert to SwimlaneData array
    return Array.from(groups.entries()).map(([id, groupTasks]) => {
      const task = groupTasks[0];
      if (id === 'no-assignee') {
        return {
          id,
          title: 'Chưa được giao',
          tasks: groupTasks,
          icon: 'assignee' as const,
        };
      }

      const assigneeNames = task.assignees?.map((a: any) => a.name).join(', ') || '';
      return {
        id,
        title: assigneeNames || 'Người được giao',
        tasks: groupTasks,
        icon: 'assignee' as const,
      };
    });
  }

  return [
    {
      id: 'default',
      title: 'Tất cả',
      tasks,
      icon: 'folder',
    },
  ];
}