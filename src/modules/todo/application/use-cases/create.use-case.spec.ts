import { BadRequestException } from '@nestjs/common';
import { CreateUseCase } from './create.use-case';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { CreateTodoInput } from '../types/create.type';
import { Todo } from '../../domain/entities/todo.entity';

describe('CreateUseCase', () => {
  let useCase: CreateUseCase;
  let repository: jest.Mocked<Pick<TodoRepository, 'create'>>;

  const baseInput: CreateTodoInput = {
    title: 'Buy milk',
    owner_user_id: 'user-1',
  };

  // The repository is mocked: it echoes back a Todo-like object so we can assert
  // both what the use-case PASSES to it and what it RETURNS to the caller.
  beforeEach(() => {
    repository = {
      create: jest.fn().mockImplementation((input) => Promise.resolve(input as Todo)),
    };
    useCase = new CreateUseCase(repository as unknown as TodoRepository);
  });

  describe('validation rules', () => {
    it('throws if the title is empty or only whitespace', async () => {
      await expect(useCase.execute({ ...baseInput, title: '   ' })).rejects.toThrow(
        new BadRequestException('Title is required'),
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws if there is no creator (neither owner_user_id nor owner_guest_id)', async () => {
      await expect(useCase.execute({ title: 'Orphan todo' } as CreateTodoInput)).rejects.toThrow(
        new BadRequestException('A creator is required'),
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('accepts a guest as the creator', async () => {
      await expect(
        useCase.execute({ title: 'Guest todo', owner_guest_id: 'guest-1' }),
      ).resolves.toBeDefined();
      expect(repository.create).toHaveBeenCalled();
    });

    it('throws if due_at is in the past', async () => {
      const pastDate = new Date('2000-01-01T00:00:00.000Z');
      await expect(useCase.execute({ ...baseInput, due_at: pastDate })).rejects.toThrow(
        new BadRequestException('due_at cannot be in the past'),
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('accepts a due_at in the future', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      await expect(useCase.execute({ ...baseInput, due_at: futureDate })).resolves.toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ due_at: futureDate }),
      );
    });
  });

  describe('priority default', () => {
    it('defaults priority to 0 when not provided', async () => {
      await useCase.execute(baseInput);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ priority: 0 }));
    });

    it('respects an explicit priority', async () => {
      await useCase.execute({ ...baseInput, priority: 3 });
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ priority: 3 }));
    });

    it('preserves an explicit priority of 0 (?? must not clobber it)', async () => {
      await useCase.execute({ ...baseInput, priority: 0 });
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ priority: 0 }));
    });
  });

  describe('happy path', () => {
    it('forwards the validated input to the repository and returns the created todo', async () => {
      const result = await useCase.execute(baseInput);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Buy milk', owner_user_id: 'user-1', priority: 0 }),
      );
      expect(result).toEqual(expect.objectContaining({ title: 'Buy milk' }));
    });
  });
});
