import { NotFoundException } from '@nestjs/common';
import { UpdateUseCase } from './update.use-case';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { UpdateTodoInput } from '../../domain/repository/todo.repository.type';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoStatus } from '../../domain/entities/todo.entity.types';

// Builds a fully-populated, valid Todo for the "found" cases.
// Overrides let individual tests tweak only the fields they care about.
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

describe('UpdateUseCase', () => {
  let useCase: UpdateUseCase;
  let repository: jest.Mocked<Pick<TodoRepository, 'findById' | 'update'>>;

  const baseInput: UpdateTodoInput = {
    id: 'todo-1',
    title: 'Buy oat milk',
  };

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateUseCase(repository as unknown as TodoRepository);
  });

  describe('not-found path', () => {
    it('throws NotFoundException and does NOT call update when the todo does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ ...baseInput, owner_user_id: 'user-1' })).rejects.toThrow(
        new NotFoundException('Todo not found'),
      );

      expect(repository.findById).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('cross-user access', () => {
    it('does NOT update a todo that belongs to another user', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ ...baseInput, owner_user_id: 'user-2' })).rejects.toThrow(
        new NotFoundException('Todo not found'),
      );

      expect(repository.findById).toHaveBeenCalledWith('todo-1', 'user-2');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('happy path', () => {
    it('updates and returns the result when the caller owns the todo', async () => {
      // The existing todo must be found first; the updated todo is what the repo returns.
      const existing = makeTodo();
      const updated = makeTodo({ title: 'Buy oat milk' });
      repository.findById.mockResolvedValue(existing);
      repository.update.mockResolvedValue(updated);

      const result = await useCase.execute({ ...baseInput, owner_user_id: 'user-1' });

      expect(repository.findById).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(baseInput);
      expect(result).toBe(updated);
    });

    it('leaves completed_at untouched when the update does not carry a status', async () => {
      repository.findById.mockResolvedValue(makeTodo());
      repository.update.mockResolvedValue(makeTodo());

      await useCase.execute({ ...baseInput, owner_user_id: 'user-1' });

      expect(repository.update.mock.calls[0][0]).not.toHaveProperty('completed_at');
    });
  });

  describe('completed_at upkeep', () => {
    it('stamps completed_at when the status moves to COMPLETED', async () => {
      repository.findById.mockResolvedValue(makeTodo());
      repository.update.mockResolvedValue(makeTodo());

      await useCase.execute({
        id: 'todo-1',
        owner_user_id: 'user-1',
        status: TodoStatus.COMPLETED,
      });

      expect(repository.update.mock.calls[0][0].completed_at).toBeInstanceOf(Date);
    });

    it('clears completed_at when the status leaves COMPLETED', async () => {
      const completed = makeTodo({
        status: TodoStatus.COMPLETED,
        completed_at: new Date('2026-02-02T00:00:00.000Z'),
      });
      repository.findById.mockResolvedValue(completed);
      repository.update.mockResolvedValue(completed);

      await useCase.execute({
        id: 'todo-1',
        owner_user_id: 'user-1',
        status: TodoStatus.IN_PROGRESS,
      });

      expect(repository.update.mock.calls[0][0].completed_at).toBeNull();
    });

    it('clears completed_at for every status outside COMPLETED_STATUSES', async () => {
      for (const status of [
        TodoStatus.PENDING,
        TodoStatus.IN_PROGRESS,
        TodoStatus.ON_HOLD,
        TodoStatus.CANCELLED,
      ]) {
        repository.update.mockClear();
        repository.findById.mockResolvedValue(
          makeTodo({
            status: TodoStatus.COMPLETED,
            completed_at: new Date('2026-02-02T00:00:00.000Z'),
          }),
        );
        repository.update.mockResolvedValue(makeTodo());

        await useCase.execute({ id: 'todo-1', owner_user_id: 'user-1', status });

        expect(repository.update.mock.calls[0][0].completed_at).toBeNull();
      }
    });

    it('keeps the original timestamp when an already-completed todo is set to COMPLETED again', async () => {
      const stamped = new Date('2026-02-02T00:00:00.000Z');
      repository.findById.mockResolvedValue(
        makeTodo({ status: TodoStatus.COMPLETED, completed_at: stamped }),
      );
      repository.update.mockResolvedValue(makeTodo());

      await useCase.execute({
        id: 'todo-1',
        owner_user_id: 'user-1',
        status: TodoStatus.COMPLETED,
      });

      expect(repository.update.mock.calls[0][0].completed_at).toBe(stamped);
    });
  });
});
