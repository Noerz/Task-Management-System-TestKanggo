import { ITaskRepository } from './task.repository';
import { CreateTaskDTO, UpdateTaskDTO, QueryTaskDTO } from './task.schema';
import { AppError } from '../../shared/middleware/error.middleware';

export class TaskService {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async createTask(userId: string, data: CreateTaskDTO) {
    return this.taskRepository.create(userId, data);
  }

  async getTasks(userId: string, query: QueryTaskDTO) {
    return this.taskRepository.findMany(userId, query);
  }

  async getTaskById(id: string, userId: string) {
    const task = await this.taskRepository.findById(id, userId);
    if (!task) {
      throw new AppError('Task not found or you do not have permission to access it', 404);
    }
    return task;
  }

  async updateTask(id: string, userId: string, data: UpdateTaskDTO) {
    const task = await this.taskRepository.findById(id, userId);
    if (!task) {
      throw new AppError('Task not found or you do not have permission to update it', 404);
    }

    return this.taskRepository.updateById(id, data);
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.taskRepository.findById(id, userId);
    if (!task) {
      throw new AppError('Task not found or you do not have permission to delete it', 404);
    }

    return this.taskRepository.delete(id);
  }
}
