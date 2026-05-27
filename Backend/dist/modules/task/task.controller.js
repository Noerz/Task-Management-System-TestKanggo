"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const task = yield this.taskService.createTask(userId, req.body);
                res.status(201).json({ success: true, data: task });
            }
            catch (error) {
                next(error);
            }
        });
        this.getAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const query = req.query; // Type workaround because Express parses query strings dynamically
                const result = yield this.taskService.getTasks(userId, query);
                res.status(200).json({ success: true, data: result.data, meta: result.meta });
            }
            catch (error) {
                next(error);
            }
        });
        this.getById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const taskId = req.params.id;
                const task = yield this.taskService.getTaskById(taskId, userId);
                res.status(200).json({ success: true, data: task });
            }
            catch (error) {
                next(error);
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const taskId = req.params.id;
                const task = yield this.taskService.updateTask(taskId, userId, req.body);
                res.status(200).json({ success: true, data: task });
            }
            catch (error) {
                next(error);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const taskId = req.params.id;
                yield this.taskService.deleteTask(taskId, userId);
                res.status(200).json({ success: true, message: 'Task deleted successfully' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.TaskController = TaskController;
