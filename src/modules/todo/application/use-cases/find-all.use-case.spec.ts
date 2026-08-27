import { FindAllUseCase } from './find-all.use-case';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { PaginationResult } from 'src/shared/domain/pagination';
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
  let repository: jest.Mocked<Pick<TodoRepository, 'findAllByOwnerUserId'>>;

  beforeEach(() => {
    repository = {
      findAllByOwnerUserId: jest.fn(),
    };
    useCase = new FindAllUseCase(repository as unknown as TodoRepository);
  });

  it('scopes the listing to the owner and forwards the pagination params', async () => {
    const paginated: PaginationResult<Todo[]> = { data: [makeTodo()], total: 1 };
    repository.findAllByOwnerUserId.mockResolvedValue(paginated);

    const result = await useCase.execute({ offset: 0, limit: 10, owner_user_id: 'user-1' });

    expect(repository.findAllByOwnerUserId).toHaveBeenCalledTimes(1);
    expect(repository.findAllByOwnerUserId).toHaveBeenCalledWith('user-1', {
      offset: 0,
      limit: 10,
    });
    expect(result).toBe(paginated);
  });

  it('forwards the status filter when one is given', async () => {
    repository.findAllByOwnerUserId.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({
      offset: 0,
      limit: 10,
      owner_user_id: 'user-1',
      status: TodoStatus.COMPLETED,
    });

    expect(repository.findAllByOwnerUserId).toHaveBeenCalledWith('user-1', {
      offset: 0,
      limit: 10,
      status: TodoStatus.COMPLETED,
    });
  });

  it('omits the status filter when none is given', async () => {
    repository.findAllByOwnerUserId.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ offset: 0, limit: 10, owner_user_id: 'user-1' });

    expect(repository.findAllByOwnerUserId).toHaveBeenCalledWith(
      'user-1',
      expect.not.objectContaining({ status: expect.anything() }),
    );
  });

  it('never queries without an owner', async () => {
    repository.findAllByOwnerUserId.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ offset: 0, limit: 10, owner_user_id: 'user-2' });

    expect(repository.findAllByOwnerUserId).toHaveBeenCalledWith('user-2', expect.anything());
  });
});
