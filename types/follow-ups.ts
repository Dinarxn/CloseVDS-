/**
 * CloseVDS Follow-Up Tasks & Actionable Items Domain Types
 * Phase 5 Sales Operations & Follow-Up Management
 */

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface FollowUpTaskItem {
  id: string;
  leadId: string;
  leadBusinessName: string;
  assignedToUserId: string | null;
  assignedUserName: string | null;
  title: string;
  description: string | null;
  dueDate: string | Date | null;
  status: TaskStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTaskInput {
  leadId: string;
  title: string;
  description?: string;
  dueDate?: string | Date;
  status?: TaskStatus;
  assignedToUserId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: string | Date | null;
  status?: TaskStatus;
  assignedToUserId?: string | null;
}

export interface ListTasksQueryParams {
  leadId?: string;
  assignedToUserId?: string;
  status?: TaskStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListTasksResponse {
  success: boolean;
  data: FollowUpTaskItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
