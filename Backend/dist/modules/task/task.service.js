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
exports.TaskService = void 0;
const error_middleware_1 = require("../../shared/middleware/error.middleware");
class TaskService {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    createTask(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.taskRepository.create(userId, data);
        });
    }
    getTasks(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.taskRepository.findMany(userId, query);
        });
    }
    getTaskById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield this.taskRepository.findById(id, userId);
            if (!task) {
                throw new error_middleware_1.AppError('Task not found or you do not have permission to access it', 404);
            }
            return task;
        });
    }
    updateTask(id, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield this.taskRepository.findById(id, userId);
            if (!task) {
                throw new error_middleware_1.AppError('Task not found or you do not have permission to update it', 404);
            }
            return this.taskRepository.updateById(id, data);
        });
    }
    deleteTask(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield this.taskRepository.findById(id, userId);
            if (!task) {
                throw new error_middleware_1.AppError('Task not found or you do not have permission to delete it', 404);
            }
            return this.taskRepository.delete(id);
        });
    }
}
exports.TaskService = TaskService;
