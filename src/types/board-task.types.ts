// Temporary type for board functionality
export interface ApiCaseTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  created_at: string;
  updated_at: string;
}
