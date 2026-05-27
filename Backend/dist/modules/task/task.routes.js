"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("./task.controller");
const task_service_1 = require("./task.service");
const task_repository_1 = require("./task.repository");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const task_schema_1 = require("./task.schema");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Manual Dependency Injection
const taskRepository = new task_repository_1.TaskRepository();
const taskService = new task_service_1.TaskService(taskRepository);
const taskController = new task_controller_1.TaskController(taskService);
router.use(auth_middleware_1.authMiddleware); // Protect all task routes
router.post('/', (0, validation_middleware_1.validate)(task_schema_1.createTaskSchema), taskController.create);
router.get('/', (0, validation_middleware_1.validate)(task_schema_1.queryTaskSchema), taskController.getAll);
router.get('/:id', taskController.getById);
router.put('/:id', (0, validation_middleware_1.validate)(task_schema_1.updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);
exports.default = router;
