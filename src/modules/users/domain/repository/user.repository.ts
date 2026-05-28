import { User } from '../entities/user.entity';
import { CreateUserInput } from './user.repository.types';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(input: CreateUserInput): Promise<User>;
}
