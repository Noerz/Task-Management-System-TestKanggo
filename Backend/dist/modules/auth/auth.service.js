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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_util_1 = require("../../shared/utils/bcrypt.util");
const jwt_util_1 = require("../../shared/utils/jwt.util");
const error_middleware_1 = require("../../shared/middleware/error.middleware");
const redis_1 = require("../../shared/db/redis");
const logger_1 = __importDefault(require("../../shared/utils/logger"));
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userRepository.findByEmail(data.email);
            if (existingUser) {
                logger_1.default.warn('Registration attempt with already existing email', { email: data.email });
                throw new error_middleware_1.AppError('Email already in use', 400);
            }
            const hashedPassword = yield (0, bcrypt_util_1.hashPassword)(data.password);
            const user = yield this.userRepository.create(Object.assign(Object.assign({}, data), { password: hashedPassword }));
            logger_1.default.info('New user registered', { userId: user.id, email: user.email });
            // Explicitly construct the response object so you can easily customize variable names
            return {
                id: user.id,
                name: user.name,
                email: user.email,
            };
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(data.email);
            if (!user) {
                logger_1.default.warn('Login attempt with unknown email', { email: data.email });
                throw new error_middleware_1.AppError('Invalid email or password', 401);
            }
            const isPasswordValid = yield (0, bcrypt_util_1.comparePassword)(data.password, user.password);
            if (!isPasswordValid) {
                logger_1.default.warn('Login attempt with wrong password', { email: data.email });
                throw new error_middleware_1.AppError('Invalid email or password', 401);
            }
            const token = (0, jwt_util_1.generateToken)({ userId: user.id, email: user.email });
            logger_1.default.info('User logged in', { userId: user.id, email: user.email });
            // Explicitly construct the response object so you can easily customize variable names
            return {
                user: {
                    id: user.id,
                    name: user.name,
                },
                token: token,
            };
        });
    }
    logout(token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Blacklist token in Redis for 1 day (86400 seconds) matching JWT_EXPIRES_IN
            yield redis_1.redis.set(`bl_${token}`, 'true', 'EX', 86400);
            logger_1.default.info('User logged out – token blacklisted');
        });
    }
}
exports.AuthService = AuthService;
