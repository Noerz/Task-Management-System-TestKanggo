"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional().nullable(),
        status: zod_1.z.enum(['pending', 'in_progress', 'done']).optional(),
        deadline: zod_1.z.string().datetime().optional().nullable().or(zod_1.z.date().optional().nullable()),
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').optional(),
        description: zod_1.z.string().optional().nullable(),
        status: zod_1.z.enum(['pending', 'in_progress', 'done']).optional(),
        deadline: zod_1.z.string().datetime().optional().nullable().or(zod_1.z.date().optional().nullable()),
    }),
});
exports.queryTaskSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'in_progress', 'done']).optional(),
        search: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
