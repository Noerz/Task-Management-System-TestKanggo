import { AuthService } from '../auth.service';
import { IUserRepository } from '../auth.repository';
import { User } from '@prisma/client';
import * as bcryptUtil from '../../../shared/utils/bcrypt.util';

jest.mock('../../../shared/db/redis', () => ({
  redis: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    authService = new AuthService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcryptUtil, 'hashPassword').mockResolvedValue('hashedpassword');

      const result = await authService.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedpassword',
      });
    });

    it('should throw an error if email already in use', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already in use');
    });
  });
});
