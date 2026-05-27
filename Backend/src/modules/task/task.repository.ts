import { Task, Prisma } from '@prisma/client';
import { prisma } from '../../shared/db/prisma';
import { CreateTaskDTO, UpdateTaskDTO, QueryTaskDTO } from './task.schema';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ITaskRepository {
  create(userId: string, data: CreateTaskDTO): Promise<Task>;
  findMany(userId: string, query: QueryTaskDTO): Promise<PaginatedResult<Task>>;
  findById(id: string, userId: string): Promise<Task | null>;
  updateById(id: string, data: UpdateTaskDTO): Promise<Task>;
  delete(id: string): Promise<Task>;
}

export class TaskRepository implements ITaskRepository {
  async create(userId: string, data: CreateTaskDTO): Promise<Task> {
    return prisma.task.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        userId,
      },
    });
  }

  async findMany(userId: string, query: QueryTaskDTO): Promise<PaginatedResult<Task>> {
    const where: Prisma.TaskWhereInput = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.title = {
        contains: query.search,
      };
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: { id, userId },
    });
  }



  // Adjusted update method
  async updateById(id: string, data: UpdateTaskDTO): Promise<Task> {
    const updateData: Prisma.TaskUpdateInput = {
      ...data,
    };
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }
}
