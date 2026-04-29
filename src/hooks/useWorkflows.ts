'use client';

import { useEffect, useState, useCallback } from 'react';
import { Workflow } from '@/types';
import { workflowRepo } from '@/repositories/WorkflowRepo';

interface UseWorkflowsOptions {
  activeOnly?: boolean;
}

interface UseWorkflowsReturn {
  workflows: Workflow[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWorkflows(options?: UseWorkflowsOptions): UseWorkflowsReturn {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workflowRepo.getAll();
      const filtered = options?.activeOnly
        ? data.filter((w) => w.is_active)
        : data;
      setWorkflows(filtered);
    } catch {
      setError('Không thể tải danh sách quy trình');
    } finally {
      setLoading(false);
    }
  }, [options?.activeOnly]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return { workflows, loading, error, refresh: fetchWorkflows };
}
