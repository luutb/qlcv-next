'use client';

import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import TaskGanttView from '@/components/tasks/TaskGanttView';
import apiClient from '@/api/client';

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

export default function GanttPage() {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get('/tasks/gantt')
      .then((res) => {
        const data = res.data?.tasks ?? res.data ?? [];
        // Map API response to GanttTask shape
        const mapped: GanttTask[] = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          start: t.start_date ?? t.created_at,
          end: t.end_date ?? t.due_date ?? t.updated_at,
          progress: t.progress ?? 0,
          assignees: t.assignees?.map((a: any) => a.full_name ?? a.name) ?? (t.assignee ? [t.assignee.full_name] : []),
          dependencies: t.dependencies ?? [],
          status: t.status ?? 'ACTIVE',
        }));
        setTasks(mapped);
      })
      .catch(() => setError('Không thể tải dữ liệu Gantt. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Gantt View
      </Typography>

      {loading && (
        <Paper sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TaskGanttView taskId={0} tasks={tasks} dependencies={[]} />
      )}
    </Box>
  );
}
