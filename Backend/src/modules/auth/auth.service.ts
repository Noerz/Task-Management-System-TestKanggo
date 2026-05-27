import { IUserRepository } from './auth.repository';
import { RegisterDTO, LoginDTO, LoginResponseDTO } from './auth.schema';
import { hashPassword, comparePassword } from '../../shared/utils/bcrypt.util';
import { generateToken } from '../../shared/utils/jwt.util';
import { AppError } from '../../shared/middleware/error.middleware';
import { redis } from '../../shared/db/redis';
import logger from '../../shared/utils/logger';

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) { }

  async register(data: RegisterDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      logger.warn('Registration attempt with already existing email', { email: data.email });
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    logger.info('New user registered', { userId: user.id, email: user.email });

    // Explicitly construct the response object so you can easily customize variable names
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async login(data: LoginDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      logger.warn('Login attempt with unknown email', { email: data.email });
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login attempt with wrong password', { email: data.email });
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Explicitly construct the response object so you can easily customize variable names
    return {
      user: {
        id: user.id,
        name: user.name,
      },
      token: token,
    };
  }

  async logout(token: string): Promise<void> {
    // Blacklist token in Redis for 1 day (86400 seconds) matching JWT_EXPIRES_IN
    await redis.set(`bl_${token}`, 'true', 'EX', 86400);
    logger.info('User logged out – token blacklisted');
  }
}
