import apiClient from '@/api/client';

export interface Document {
  id: number;
  task_id?: number;
  task_name?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
  version: number;
  permissions: 'private' | 'team' | 'public';
  is_locked?: boolean;
}

export interface DocumentRequest {
  file: File;
  task_id?: number;
}

export interface ShareRequest {
  permission: 'private' | 'team' | 'public';
}

export class DocumentRepository {
  private static instance: DocumentRepository;
  private constructor() {}

  static getInstance(): DocumentRepository {
    if (!DocumentRepository.instance) {
      DocumentRepository.instance = new DocumentRepository();
    }
    return DocumentRepository.instance;
  }

  async getAll(): Promise<Document[]> {
    const response = await apiClient.get<Document[]>('/documents');
    return response.data;
  }

  async upload(taskId: number, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (taskId) {
      formData.append('task_id', taskId.toString());
    }
    const response = await apiClient.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async update(id: number, document: Partial<Document>): Promise<Document> {
    const response = await apiClient.put<Document>(`/documents/${id}`, document);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  }

  async share(id: number, permission: 'private' | 'team' | 'public'): Promise<Document> {
    const response = await apiClient.put<Document>(`/documents/${id}/share`, { permission });
    return response.data;
  }

  async getSharedWith(id: number): Promise<any[]> {
    const response = await apiClient.get(`/documents/${id}/shared-with`);
    return response.data;
  }
}

export const documentRepo = DocumentRepository.getInstance();
