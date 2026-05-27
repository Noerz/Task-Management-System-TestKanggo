"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const auth_repository_1 = require("./auth.repository");
const validation_middleware_1 = require("../../shared/middleware/validation.middleware");
const auth_schema_1 = require("./auth.schema");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Manual Dependency Injection
const userRepository = new auth_repository_1.UserRepository();
const authService = new auth_service_1.AuthService(userRepository);
const authController = new auth_controller_1.AuthController(authService);
router.post('/register', (0, validation_middleware_1.validate)(auth_schema_1.registerSchema), authController.register);
router.post('/login', (0, validation_middleware_1.validate)(auth_schema_1.loginSchema), authController.login);
router.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
exports.default = router;
