import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    deadline: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    deadline: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  }),
});

export const queryTaskSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'in_progress', 'done']).optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>['body'];
export type QueryTaskDTO = {
  status?: 'pending' | 'in_progress' | 'done';
  search?: string;
  page?: number | string;
  limit?: number | string;
};
