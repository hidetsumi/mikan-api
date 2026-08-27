import { PrismaTodoRepository } from './prisma-todo.repository';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoStatus } from '../../domain/entities/todo.entity.types';

const makeRow = (overrides: Partial<Todo> = {}) => ({
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

describe('PrismaTodoRepository', () => {
  let repository: PrismaTodoRepository;
  let prisma: {
    todo: { findMany: jest.Mock; count: jest.Mock };
    $transaction: jest.Mock;
  };

  // The repository hands $transaction an array of ALREADY-invoked promises,
  // so the mock only has to settle them. Assertions go on findMany/count.
  beforeEach(() => {
    prisma = {
      todo: {
        findMany: jest.fn().mockResolvedValue([makeRow()]),
        count: jest.fn().mockResolvedValue(1),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    repository = new PrismaTodoRepository(prisma as unknown as PrismaService);
  });

  const whereOf = (mock: jest.Mock) => mock.mock.calls[0][0].where;

  describe('findAllByOwnerUserId', () => {
    it('narrows the query by status when one is given', async () => {
      await repository.findAllByOwnerUserId('user-1', {
        offset: 0,
        limit: 10,
        status: TodoStatus.COMPLETED,
      });

      expect(whereOf(prisma.todo.findMany)).toEqual({
        owner_user_id: 'user-1',
        status: TodoStatus.COMPLETED,
      });
    });

    it('leaves status out of the query when none is given', async () => {
      await repository.findAllByOwnerUserId('user-1', { offset: 0, limit: 10 });

      expect(whereOf(prisma.todo.findMany)).toEqual({ owner_user_id: 'user-1' });
      expect(whereOf(prisma.todo.findMany)).not.toHaveProperty('status');
    });

    // The pagination total is only trustworthy while both halves of the
    // transaction filter on exactly the same thing.
    it('counts over the same where clause it lists over', async () => {
      await repository.findAllByOwnerUserId('user-1', {
        offset: 0,
        limit: 10,
        status: TodoStatus.COMPLETED,
      });

      expect(whereOf(prisma.todo.count)).toEqual(whereOf(prisma.todo.findMany));
    });

    it('keeps the pagination window and the created_at ordering', async () => {
      await repository.findAllByOwnerUserId('user-1', {
        offset: 20,
        limit: 5,
        status: TodoStatus.PENDING,
      });

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: { owner_user_id: 'user-1', status: TodoStatus.PENDING },
        orderBy: { created_at: 'desc' },
        skip: 20,
        take: 5,
      });
    });

    it('maps the rows to Todo entities and reports the counted total', async () => {
      prisma.todo.findMany.mockResolvedValue([makeRow(), makeRow({ id: 'todo-2' })]);
      prisma.todo.count.mockResolvedValue(7);

      const result = await repository.findAllByOwnerUserId('user-1', { offset: 0, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Todo);
      expect(result.data[1].id).toBe('todo-2');
      expect(result.total).toBe(7);
    });
  });

  describe('findAllByAssignedUserId', () => {
    it('narrows the query by status when one is given', async () => {
      await repository.findAllByAssignedUserId('user-9', {
        offset: 0,
        limit: 10,
        status: TodoStatus.COMPLETED,
      });

      expect(whereOf(prisma.todo.findMany)).toEqual({
        assigned_user_id: 'user-9',
        status: TodoStatus.COMPLETED,
      });
    });

    it('leaves status out of the query when none is given', async () => {
      await repository.findAllByAssignedUserId('user-9', { offset: 0, limit: 10 });

      expect(whereOf(prisma.todo.findMany)).toEqual({ assigned_user_id: 'user-9' });
    });

    it('counts over the same where clause it lists over', async () => {
      await repository.findAllByAssignedUserId('user-9', {
        offset: 0,
        limit: 10,
        status: TodoStatus.PENDING,
      });

      expect(whereOf(prisma.todo.count)).toEqual(whereOf(prisma.todo.findMany));
    });
  });
});
