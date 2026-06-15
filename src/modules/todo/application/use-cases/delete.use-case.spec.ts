import { NotFoundException } from '@nestjs/common';
import { DeleteUseCase } from './delete.use-case';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoStatus } from '../../domain/entities/todo.entity.types';

// Builds a fully-populated, valid Todo for the "found" cases.
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

describe('DeleteUseCase', () => {
  let useCase: DeleteUseCase;
  let repository: jest.Mocked<Pick<TodoRepository, 'findById' | 'delete'>>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteUseCase(repository as unknown as TodoRepository);
  });

  describe('not-found path', () => {
    it('throws NotFoundException and does NOT call delete when the todo does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id')).rejects.toThrow(
        new NotFoundException('Todo not found'),
      );

      expect(repository.findById).toHaveBeenCalledWith('missing-id');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('happy path', () => {
    it('calls repository.delete with the id when the todo exists', async () => {
      repository.findById.mockResolvedValue(makeTodo());
      repository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute('todo-1')).resolves.toBeUndefined();

      expect(repository.findById).toHaveBeenCalledWith('todo-1');
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(repository.delete).toHaveBeenCalledWith('todo-1');
    });
  });
});
