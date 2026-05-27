import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './auth.repository';
import { validate } from '../../shared/middleware/validation.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Manual Dependency Injection
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);

export default router;
