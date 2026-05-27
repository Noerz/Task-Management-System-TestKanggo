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
exports.TaskRepository = void 0;
const prisma_1 = require("../../shared/db/prisma");
class TaskRepository {
    create(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.task.create({
                data: Object.assign(Object.assign({}, data), { deadline: data.deadline ? new Date(data.deadline) : undefined, userId }),
            });
        });
    }
    findMany(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
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
            const [data, total] = yield Promise.all([
                prisma_1.prisma.task.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma_1.prisma.task.count({ where }),
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
        });
    }
    findById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.task.findFirst({
                where: { id, userId },
            });
        });
    }
    // Adjusted update method
    updateById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = Object.assign({}, data);
            if (data.deadline !== undefined) {
                updateData.deadline = data.deadline ? new Date(data.deadline) : null;
            }
            return prisma_1.prisma.task.update({
                where: { id },
                data: updateData,
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.task.delete({
                where: { id },
            });
        });
    }
}
exports.TaskRepository = TaskRepository;
