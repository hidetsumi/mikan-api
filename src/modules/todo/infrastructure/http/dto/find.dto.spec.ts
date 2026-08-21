import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TodoStatus } from '@prisma/client';
import { FindTodoRequestDto } from './find.dto';

describe('FindTodoRequestDto', () => {
  const transform = (query: Record<string, unknown>) =>
    plainToInstance(FindTodoRequestDto, query, { enableImplicitConversion: false });

  it('coerces numeric query strings into numbers', () => {
    const dto = transform({ offset: '10', limit: '5' });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.offset).toBe(10);
    expect(dto.limit).toBe(5);
  });

  it('applies the defaults when pagination is omitted', () => {
    const dto = transform({});

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.offset).toBe(0);
    expect(dto.limit).toBe(20);
  });

  it('accepts a valid status filter', () => {
    const dto = transform({ status: TodoStatus.PENDING });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.status).toBe(TodoStatus.PENDING);
  });

  it('rejects a non-numeric limit', () => {
    const errors = validateSync(transform({ limit: 'all' }));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('limit');
  });

  it('rejects a negative offset', () => {
    const errors = validateSync(transform({ offset: '-1' }));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('offset');
  });

  it('rejects an unknown status', () => {
    const errors = validateSync(transform({ status: 'NOT_A_STATUS' }));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('status');
  });
});
