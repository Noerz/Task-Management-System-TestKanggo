import api from './api';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: 'pending' | 'in_progress' | 'done';
  deadline?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done';
  deadline?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const taskService = {
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await api.post<{ success: boolean; data: Task }>('/tasks', payload);
    return data.data;
  },

  getTasks: async (page: number = 1, limit: number = 10, status?: string, search?: string): Promise<PaginatedResponse<Task>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status && status !== 'All') {
      const statusValue = status === 'In Progress' ? 'in_progress' : status.toLowerCase();
      params.append('status', statusValue);
    }
    if (search) {
      params.append('search', search);
    }
    const { data } = await api.get<{ success: boolean; data: Task[]; meta: any }>(`/tasks?${params.toString()}`);
    return { data: data.data, meta: data.meta };
  },

  getTaskById: async (id: string): Promise<Task> => {
    const { data } = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return data.data;
  },

  updateTask: async (id: string, payload: Partial<CreateTaskPayload>): Promise<Task> => {
    const { data } = await api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, payload);
    return data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export default taskService;
