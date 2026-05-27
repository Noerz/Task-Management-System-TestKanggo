import { Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const task = await this.taskService.createTask(userId, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as any; // Type workaround because Express parses query strings dynamically
      const result = await this.taskService.getTasks(userId, query);
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id as string;
      const task = await this.taskService.getTaskById(taskId, userId);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id as string;
      const task = await this.taskService.updateTask(taskId, userId, req.body);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id as string;
      await this.taskService.deleteTask(taskId, userId);
      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
