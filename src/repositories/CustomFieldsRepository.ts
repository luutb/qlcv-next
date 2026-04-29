import apiClient from '@/api/client';

export interface CustomField {
  id?: number;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  options?: string[];
  is_required: boolean;
  default_value?: string;
  order: number;
}

export interface CustomFieldInstance {
  field_id: number;
  value: string;
}

export interface CustomFieldRequest {
  name: string;
  field_type: CustomField['field_type'];
  options?: string[];
  is_required?: boolean;
  default_value?: string;
  order?: number;
}

export class CustomFieldsRepository {
  private static instance: CustomFieldsRepository;
  private constructor() {}

  static getInstance(): CustomFieldsRepository {
    if (!CustomFieldsRepository.instance) {
      CustomFieldsRepository.instance = new CustomFieldsRepository();
    }
    return CustomFieldsRepository.instance;
  }

  async getAll(): Promise<CustomField[]> {
    const response = await apiClient.get<CustomField[]>('/custom-fields');
    return response.data;
  }

  async create(field: CustomFieldRequest): Promise<CustomField> {
    const response = await apiClient.post<CustomField>('/custom-fields', field);
    return response.data;
  }

  async update(id: number, field: CustomFieldRequest): Promise<CustomField> {
    const response = await apiClient.put<CustomField>(`/custom-fields/${id}`, field);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/custom-fields/${id}`);
  }

  async getInstances(fieldId: number): Promise<CustomFieldInstance[]> {
    const response = await apiClient.get<CustomFieldInstance[]>(`/custom-fields/${fieldId}/instances`);
    return response.data;
  }

  async updateInstances(fieldId: number, instances: CustomFieldInstance[]): Promise<CustomFieldInstance[]> {
    const response = await apiClient.put<CustomFieldInstance[]>(`/custom-fields/${fieldId}/instances`, { instances });
    return response.data;
  }
}

export const customFieldsRepo = CustomFieldsRepository.getInstance();
