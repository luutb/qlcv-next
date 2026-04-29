import apiClient from '@/api/client';

export interface Resource {
  id: number;
  name: string;
  type: 'person' | 'equipment' | 'budget';
  status: 'available' | 'assigned' | 'busy';
  utilization?: number;
  capacity?: number;
  cost?: number;
  assigned_tasks?: number;
}

export interface ResourceAllocationRequest {
  resource_id: number;
  task_id: number;
}

export class ResourceRepository {
  private static instance: ResourceRepository;
  private constructor() {}

  static getInstance(): ResourceRepository {
    if (!ResourceRepository.instance) {
      ResourceRepository.instance = new ResourceRepository();
    }
    return ResourceRepository.instance;
  }

  async getAll(): Promise<Resource[]> {
    const response = await apiClient.get<Resource[]>('/resources');
    return response.data;
  }

  async create(resource: Partial<Resource>): Promise<Resource> {
    const response = await apiClient.post<Resource>('/resources', resource);
    return response.data;
  }

  async update(id: number, resource: Partial<Resource>): Promise<Resource> {
    const response = await apiClient.put<Resource>(`/resources/${id}`, resource);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  }

  async assign(id: number, taskId: number): Promise<void> {
    await apiClient.post(`/resources/${id}/assign`, { task_id: taskId });
  }

  async release(id: number): Promise<void> {
    await apiClient.delete(`/resources/${id}/release`);
  }

  async getAllocations(id: number): Promise<any[]> {
    const response = await apiClient.get(`/resources/${id}/allocations`);
    return response.data;
  }
}

export const resourceRepo = ResourceRepository.getInstance();
