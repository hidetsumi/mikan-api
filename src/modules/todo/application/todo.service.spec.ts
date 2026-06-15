import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service.service';
import { TodoRepository } from '../domain/repository/todo.repository';
import { CreateTodoInput } from './types/create.type';

describe('TodoServiceService', () => {
  let service: TodoService;
  let repository: jest.Mocked<TodoRepository>;

  const baseInput: CreateTodoInput = {
    title: 'Test todo',
    owner_user_id: 'user-1',
    owner_guest_id: 'guest-1',
  };

  beforeEach(async () => {
    const repositoryMock: Partial<jest.Mocked<TodoRepository>> = {
      findById: jest.fn(),
      create: jest.fn().mockImplementation((todo) => Promise.resolve(todo)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService, { provide: TodoRepository, useValue: repositoryMock }],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get(TodoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create — priority default', () => {
    it('defaults priority to 0 when not provided', async () => {
      await service.create(baseInput);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ priority: 0 }));
    });

    it('respects an explicit priority', async () => {
      await service.create({ ...baseInput, priority: 3 });

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ priority: 3 }));
    });

    it('preserves an explicit priority of 0 (no clobbering by ??)', async () => {
      await service.create({ ...baseInput, priority: 0 });

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ priority: 0 }));
    });
  });
});
