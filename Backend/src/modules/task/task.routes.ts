import { Router } from 'express';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { validate } from '../../shared/middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema, queryTaskSchema } from './task.schema';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Manual Dependency Injection
const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

router.use(authMiddleware); // Protect all task routes

router.post('/', validate(createTaskSchema), taskController.create);
router.get('/', validate(queryTaskSchema), taskController.getAll);
router.get('/:id', taskController.getById);
router.put('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

export default router;
