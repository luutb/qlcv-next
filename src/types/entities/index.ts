// Re-export all entity types from main index
export * from '../index';

// Additional entity-specific types can be added here
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}