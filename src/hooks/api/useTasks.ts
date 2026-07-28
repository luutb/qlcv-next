import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/api/services/task.service';
import { Task, TaskForm, TaskQueryParams, TaskStatus, WorkLog } from '@/types';

export const useTasks = (params?: TaskQueryParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const response = await TaskService.getTasks(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await TaskService.getTask(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskForm) => TaskService.createTask(data),
    onSuccess: (response) => {
      const newTask = response.data;
      
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Add to cache if we have the specific query
      queryClient.setQueryData(['tasks', newTask.id], newTask);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskForm> }) =>
      TaskService.updateTask(id, data),
    onSuccess: (response, variables) => {
      const updatedTask = response.data;
      
      // Update specific task in cache
      queryClient.setQueryData(['tasks', variables.id], updatedTask);
      
      // Update task in lists
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((task: Task) =>
              task.id === variables.id ? updatedTask : task
            ),
          };
        }
      );
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskService.deleteTask(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['tasks', id] });
      
      // Remove from lists
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.filter((task: Task) => task.id !== id),
          };
        }
      );
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: TaskStatus; comment?: string }) =>
      TaskService.updateTaskStatus(id, status, comment),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks']);
      const previousTask = queryClient.getQueryData(['tasks', id]);

      // Optimistically update
      queryClient.setQueryData(['tasks', id], (old: Task | undefined) => 
        old ? { ...old, status } : old
      );

      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((task: Task) =>
              task.id === id ? { ...task, status } : task
            ),
          };
        }
      );

      return { previousTasks, previousTask };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', variables.id], context.previousTask);
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) =>
      TaskService.assignTask(id, assigneeId),
    onSuccess: (response, variables) => {
      const updatedTask = response.data;
      
      // Update caches
      queryClient.setQueryData(['tasks', variables.id], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useTaskWorkLogs = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'work-logs'],
    queryFn: async () => {
      const response = await TaskService.getTaskWorkLogs(taskId);
      return response.data;
    },
    enabled: !!taskId,
  });
};

export const useAddWorkLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string; timeSpent: number; date: string }) =>
      TaskService.addWorkLog(data.taskId, data),
    onSuccess: (response, variables) => {
      // Invalidate work logs for this task
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', variables.taskId, 'work-logs'] 
      });
      
      // Invalidate my work logs
      queryClient.invalidateQueries({ 
        queryKey: ['work-logs', 'my'] 
      });
      
      // Invalidate time spent
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', variables.taskId, 'time-spent'] 
      });
    },
  });
};

export const useUpdateWorkLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkLog> }) =>
      TaskService.updateWorkLog(id, data),
    onSuccess: (response) => {
      const updatedWorkLog = response.data;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', updatedWorkLog.taskId, 'work-logs'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['work-logs', 'my'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', updatedWorkLog.taskId, 'time-spent'] 
      });
    },
  });
};

export const useDeleteWorkLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskService.deleteWorkLog(id),
    onSuccess: () => {
      // Invalidate all work log related queries
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useTaskTimeSpent = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'time-spent'],
    queryFn: async () => {
      const response = await TaskService.getTaskTimeSpent(taskId);
      return response.data;
    },
    enabled: !!taskId,
  });
};

export const useMyWorkLogs = (params?: {
  startDate?: string;
  endDate?: string;
  taskId?: string;
}) => {
  return useQuery({
    queryKey: ['work-logs', 'my', params],
    queryFn: async () => {
      const response = await TaskService.getMyWorkLogs(params);
      return response.data;
    },
  });
};

export const useMyTimeSpent = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['work-logs', 'my', 'time-spent', params],
    queryFn: async () => {
      const response = await TaskService.getMyTimeSpent(params);
      return response.data;
    },
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      TaskService.approveTask(id, comment),
    onSuccess: (response, variables) => {
      const updatedTask = response.data;
      
      queryClient.setQueryData(['tasks', variables.id], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useRejectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      TaskService.rejectTask(id, comment),
    onSuccess: (response, variables) => {
      const updatedTask = response.data;
      
      queryClient.setQueryData(['tasks', variables.id], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useGanttData = (params?: {
  caseId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['tasks', 'gantt', params],
    queryFn: async () => {
      const response = await TaskService.getGanttData(params);
      return response.data;
    },
  });
};