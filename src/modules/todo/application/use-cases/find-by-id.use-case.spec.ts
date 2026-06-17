import { NotFoundException } from '@nestjs/common';
import { FindByIdUseCase } from './find-by-id.use-case';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoStatus } from '../../domain/entities/todo.entity.types';

// Builds a fully-populated, valid Todo for the "found" case.
const makeTodo = (overrides: Partial<Todo> = {}): Todo =>
  new Todo({
    id: 'todo-1',
    title: 'Buy milk',
    description: null,
    status: TodoStatus.PENDING,
    priority: 0,
    owner_user_id: 'user-1',
    room_id: null,
    owner_guest_id: null,
    assigned_user_id: null,
    due_at: null,
    completed_at: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

describe('FindByIdUseCase', () => {
  let useCase: FindByIdUseCase;
  let repository: jest.Mocked<Pick<TodoRepository, 'findById'>>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
    };
    useCase = new FindByIdUseCase(repository as unknown as TodoRepository);
  });

  describe('not-found path', () => {
    it('throws NotFoundException when the repository returns null', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id')).rejects.toThrow(
        new NotFoundException('Todo not found'),
      );

      expect(repository.findById).toHaveBeenCalledWith('missing-id');
    });
  });

  describe('happy path', () => {
    it('returns the todo when the repository finds one', async () => {
      const todo = makeTodo();
      repository.findById.mockResolvedValue(todo);

      const result = await useCase.execute('todo-1');

      expect(repository.findById).toHaveBeenCalledWith('todo-1');
      expect(result).toBe(todo);
    });
  });
});
