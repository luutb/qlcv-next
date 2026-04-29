'use client';

import { useEffect, useState, useCallback } from 'react';
import TaskRepository, { TaskQueryParams } from '@/repositories/TaskRepository';
import { Task } from '@/types';

interface UseTaskRepositoryReturn {
  tasks: Task[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTaskRepository(params: TaskQueryParams): UseTaskRepositoryReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = TaskRepository.getInstance();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await repository.getAll(params);
      setTasks(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  }, [repository, params]);

  // Fetch on param changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Subscribe to repository notifications (triggered by FCM)
  useEffect(() => {
    const unsubscribe = repository.subscribe(() => {
      fetchTasks();
    });
    return unsubscribe;
  }, [repository, fetchTasks]);

  return { tasks, total, loading, error, refresh: fetchTasks };
}
