'use client';

import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { useEffect, useState } from 'react';

interface GanttTask {
  id: number;
  title: string;
  start: string;
  end: string;
  progress: number;
  assignees?: string[];
  dependencies?: number[];
  status: 'ACTIVE' | 'REJECTED' | 'DONE';
}

interface GanttDependency {
  from: number;
  to: number;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

interface TaskGanttViewProps {
  taskId: number;
  tasks: GanttTask[];
  dependencies: GanttDependency[];
}

export default function TaskGanttView({
  taskId,
  tasks,
  dependencies,
}: TaskGanttViewProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [taskId, tasks, dependencies]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Không có dữ liệu Gantt</Typography>
      </Paper>
    );
  }

  // Calculate timeline
  const allDates = tasks.flatMap((t) => [
    new Date(t.start).getTime(),
    new Date(t.end).getTime(),
  ]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  const dayWidth = 40; // pixels per day

  // Group tasks by week
  const getWeekNumber = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const weeks = [];
  for (let i = 0; i <= totalDays; i += 7) {
    const weekDate = new Date(minDate + i * 24 * 60 * 60 * 1000);
    weeks.push({
      number: getWeekNumber(weekDate),
      start: weekDate,
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return '#10B981';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  return (
    <Box sx={{ overflowX: 'auto', p: 2 }}>
      <Paper sx={{ p: 2, minWidth: 800 }}>
        {/* Timeline Header */}
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Box sx={{ width: 200, flexShrink: 0, mr: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Task
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              px: 1,
            }}
          >
            {weeks.map((week, idx) => (
              <Box key={idx} sx={{ textAlign: 'center', minWidth: dayWidth * 7 }}>
                <Typography variant="caption" color="text.secondary">
                  Tuần {week.number}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Gantt Chart */}
        <Box sx={{ position: 'relative' }}>
          {/* Timeline Grid */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 200,
              right: 0,
              bottom: 0,
              display: 'flex',
            }}
          >
            {Array.from({ length: totalDays }).map((_, dayIdx) => {
              const dayDate = new Date(minDate + dayIdx * 24 * 60 * 60 * 1000);
              const isWeekend =
                dayDate.getDay() === 0 || dayDate.getDay() === 6;
              return (
                <Box
                  key={dayIdx}
                  sx={{
                    width: dayWidth,
                    height: tasks.length * 60 + 40,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isWeekend ? 'action.hover' : 'transparent',
                  }}
                />
              );
            })}
          </Box>

          {/* Task Bars */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {tasks.map((task, idx) => {
              const startOffset = Math.max(
                0,
                (new Date(task.start).getTime() - minDate) /
                  (1000 * 60 * 60 * 24)
              );
              const duration = Math.max(
                1,
                (new Date(task.end).getTime() - new Date(task.start).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 40,
                    mb: 1,
                    px: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 200,
                      flexShrink: 0,
                      mr: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Typography variant="body2" fontWeight="500">
                      {task.title}
                    </Typography>
                    {task.assignees && task.assignees.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {task.assignees.join(', ')}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      position: 'relative',
                      height: 30,
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                    }}
                  >
                    {/* Task Bar */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${(startOffset / totalDays) * 100}%`,
                        width: `${(duration / totalDays) * 100}%`,
                        height: '100%',
                        bgcolor: getStatusColor(task.status),
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="white"
                        sx={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
                      >
                        {task.progress}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#3B82F6', borderRadius: 2 }} />
            <Typography variant="caption">Đang xử lý</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#10B981', borderRadius: 2 }} />
            <Typography variant="caption">Hoàn thành</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#EF4444', borderRadius: 2 }} />
            <Typography variant="caption">Từ chối</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
