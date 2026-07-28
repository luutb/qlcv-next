// Case Management Types

export type CaseStatus = 'open' | 'in_progress' | 'closed';
/** Case-detail task projection; this is not the core workflow Task status. */
export type CaseTaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
/** Compatibility name for existing Case consumers pending IS-02.3.2. */
export type TaskStatus = CaseTaskStatus;
export type MemberRole = 'lawyer' | 'support';

// Canonical Case entity returned by the retained Case endpoints.
export interface Case {
  id: string;                // UUID
  case_code: string;         // Auto-generated: CASE-2026-0001
  title: string;
  client_name: string;
  status: CaseStatus;
  created_by: number;        // User ID
  created_at: string;        // ISO date
  updated_at: string;        // ISO date
}

/** Compatibility name used by existing Case feature consumers. */
export type CaseResponse = Case;

// Case Request Types
export interface CreateCaseRequest {
  case_code?: string;        // Optional, auto-generated if not provided
  title: string;             // Required
  client_name: string;       // Required
}

export interface UpdateCaseRequest {
  title?: string;
  client_name?: string;
  status?: CaseStatus;
}

// Case List Response
export interface GetCasesResponse {
  data: CaseResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Case Query Parameters
export interface CaseQueryParams {
  limit?: number;
  offset?: number;
  status?: CaseStatus;
  search?: string;
}

// Case Task Response
export interface CaseTaskResponse {
  id: string;                // UUID
  case_id: string;           // UUID
  title: string;
  description: string;
  status: CaseTaskStatus;
  assignee_id?: number;
  due_date?: string;         // ISO date
  created_at: string;
  updated_at: string;
}

// Case Task Request Types
export interface CreateCaseTaskRequest {
  case_id: string;           // UUID
  title: string;
  description?: string;
  assignee_id?: number;
  due_date?: string;         // ISO date
}

export interface UpdateTaskStatusRequest {
  status: CaseTaskStatus;
}

// Case Member
export interface CaseMember {
  id: string;                // UUID
  case_id: string;           // UUID
  user_id: number;
  role_in_case: MemberRole;
  created_at: string;
}

// Add Member Request
export interface AddMemberRequest {
  user_id: number;
  role_in_case: MemberRole;
}

// Case Detail with Tasks and Members
export interface CaseDetailResponse extends CaseResponse {
  tasks?: CaseTaskResponse[];
  members?: CaseMember[];
}
