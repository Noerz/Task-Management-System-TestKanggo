import { User } from '@prisma/client';
import { prisma } from '../../shared/db/prisma';
import { RegisterDTO } from './auth.schema';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterDTO): Promise<User>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: RegisterDTO): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}
