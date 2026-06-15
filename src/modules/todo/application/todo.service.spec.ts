import { TodoService } from './todo.service.service';
import { CreateUseCase } from './use-cases/create.use-case';
import { FindAllUseCase } from './use-cases/find-all.use-case';
import { FindByIdUseCase } from './use-cases/find-by-id.use-case';
import { UpdateUseCase } from './use-cases/update.use-case';
import { DeleteUseCase } from './use-cases/delete.use-case';
import { CreateTodoInput } from './types/create.type';
import { UpdateTodoInput } from '../domain/repository/todo.repository.type';
import { FindTodoInput } from './types/find.type';

// TodoService is a thin orchestrator: each method just delegates to one use-case.
// The business rules themselves are covered by the *.use-case.spec.ts files, so here
// we only assert the wiring — that the right use-case is invoked with the right
// argument and its result is returned untouched. Each use-case is mocked.
describe('TodoService', () => {
  let service: TodoService;
  let createUseCase: { execute: jest.Mock };
  let findAllUseCase: { execute: jest.Mock };
  let findByIdUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };

  beforeEach(() => {
    createUseCase = { execute: jest.fn() };
    findAllUseCase = { execute: jest.fn() };
    findByIdUseCase = { execute: jest.fn() };
    updateUseCase = { execute: jest.fn() };
    deleteUseCase = { execute: jest.fn() };

    service = new TodoService(
      createUseCase as unknown as CreateUseCase,
      findAllUseCase as unknown as FindAllUseCase,
      findByIdUseCase as unknown as FindByIdUseCase,
      updateUseCase as unknown as UpdateUseCase,
      deleteUseCase as unknown as DeleteUseCase,
    );
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('create() delegates to CreateUseCase and returns its result', async () => {
    const input: CreateTodoInput = { title: 'Buy milk', owner_user_id: 'user-1' };
    const created = { id: 'todo-1' };
    createUseCase.execute.mockResolvedValue(created);

    await expect(service.create(input)).resolves.toBe(created);
    expect(createUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('findAll() delegates to FindAllUseCase and returns its result', async () => {
    const input: FindTodoInput = { offset: 0, limit: 10 };
    const page = { data: [], total: 0 };
    findAllUseCase.execute.mockResolvedValue(page);

    await expect(service.findAll(input)).resolves.toBe(page);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('findById() delegates to FindByIdUseCase and returns its result', async () => {
    const todo = { id: 'todo-1' };
    findByIdUseCase.execute.mockResolvedValue(todo);

    await expect(service.findById('todo-1')).resolves.toBe(todo);
    expect(findByIdUseCase.execute).toHaveBeenCalledWith('todo-1');
  });

  it('update() delegates to UpdateUseCase and returns its result', async () => {
    const input: UpdateTodoInput = { id: 'todo-1', title: 'Buy oat milk' };
    const updated = { id: 'todo-1', title: 'Buy oat milk' };
    updateUseCase.execute.mockResolvedValue(updated);

    await expect(service.update(input)).resolves.toBe(updated);
    expect(updateUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('delete() delegates to DeleteUseCase with the id', async () => {
    deleteUseCase.execute.mockResolvedValue(undefined);

    await expect(service.delete('todo-1')).resolves.toBeUndefined();
    expect(deleteUseCase.execute).toHaveBeenCalledWith('todo-1');
  });
});
