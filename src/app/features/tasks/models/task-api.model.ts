export type TaskApiStatus = 'todo' | 'in_progress' | 'done';

export type TaskApiPriority = 'high' | 'medium' | 'low';

export interface TaskAssigneeDto {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: TaskApiStatus;
  priority: TaskApiPriority;
  dueDate: string;
  isOverdue?: boolean;
  completedAt?: string;
  assignee?: TaskAssigneeDto;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskDto = Omit<TaskDto, 'id'>;

export type UpdateTaskDto = Partial<Omit<TaskDto, 'id'>>;