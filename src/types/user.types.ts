/** Roles currently used by authentication, navigation, and user management. */
export type Role = 'admin' | 'manager' | 'staff' | 'accountant';

/** Minimal authenticated-user shape shared by auth and role-aware consumers. */
export interface User {
  id: number;
  username: string;
  full_name: string;
  /** Legacy display alias retained until type consumers migrate to full_name. */
  name?: string;
  role: Role;
  is_active?: boolean;
}

export interface UserCertificate {
  id: number;
  user_id: number;
  name: string;
  type: 'degree' | 'certificate';
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserEducation {
  id: number;
  user_id: number;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  gpa?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/** Extended user-management/profile response shape. */
export interface UserDetail extends User {
  email?: string;
  phone?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  created_by?: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  certificates: UserCertificate[];
  educations: UserEducation[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: Role;
  department?: string;
  position?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  is_active?: boolean;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  department?: string;
  position?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  is_active?: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | '';
  is_active?: boolean | '';
  department?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateCertificateRequest {
  name: string;
  type: 'degree' | 'certificate';
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  file_url?: string;
}

export interface CreateEducationRequest {
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  gpa?: string;
  description?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}
