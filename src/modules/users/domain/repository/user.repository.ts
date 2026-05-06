import { User } from '../entities/user.entity';
import { CreateUserRepository } from './user.repository.types';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: CreateUserRepository): Promise<User>;
}
