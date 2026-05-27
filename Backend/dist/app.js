"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
// Import Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const task_routes_1 = __importDefault(require("./modules/task/task.routes"));
// Import Middleware
const error_middleware_1 = require("./shared/middleware/error.middleware");
const http_logger_middleware_1 = require("./shared/middleware/http-logger.middleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow all origins (including local IP addresses, custom domains, or mobile apps)
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(http_logger_middleware_1.httpLogger); // Log every HTTP request
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger setup
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});
// Error Handling Middleware
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
