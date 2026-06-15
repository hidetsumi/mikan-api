import { FindAllUseCase } from './find-all.use-case';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { PaginationParams, PaginationResult } from 'src/shared/domain/pagination';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoStatus } from '../../domain/entities/todo.entity.types';

// Builds a fully-populated, valid Todo to populate the paginated result.
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

describe('FindAllUseCase', () => {
  let useCase: FindAllUseCase;
  let repository: jest.Mocked<Pick<TodoRepository, 'findAll'>>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
    };
    useCase = new FindAllUseCase(repository as unknown as TodoRepository);
  });

  // This use-case is a thin delegator: it must forward params untouched and
  // return the repository's PaginationResult verbatim.
  it('delegates to repository.findAll with the params and returns its result', async () => {
    const params: PaginationParams = { offset: 0, limit: 10 };
    const paginated: PaginationResult<Todo[]> = { data: [makeTodo()], total: 1 };
    repository.findAll.mockResolvedValue(paginated);

    const result = await useCase.execute(params);

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith(params);
    expect(result).toBe(paginated);
  });
});
