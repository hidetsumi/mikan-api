import { BadRequestException } from '@nestjs/common';
import { CreateUseCase } from './create.use-case';
import { RoomRepository } from '../../domain/repository/room.repository';
import { CreateRoomInput } from '../types/create.type';
import { Room } from '../../domain/entities/room.entity';
import { ROOM_LIFETIME_MS } from 'src/config/const';

describe('CreateUseCase', () => {
  let useCase: CreateUseCase;
  let repository: jest.Mocked<Pick<RoomRepository, 'create'>>;

  const baseInput: CreateRoomInput = {
    owner_user_id: 'user-1',
    name: 'Sala de prueba',
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockImplementation((room) => Promise.resolve(room as Room)),
    };
    useCase = new CreateUseCase(repository as unknown as RoomRepository);
  });

  const dataOf = () => repository.create.mock.calls[0][0];

  describe('slug', () => {
    it('generates a 12-character URL-safe slug', async () => {
      await useCase.execute(baseInput);

      expect(dataOf().slug).toMatch(/^[A-Za-z0-9_-]{12}$/);
    });

    it('generates a different slug on every call', async () => {
      await useCase.execute(baseInput);
      await useCase.execute(baseInput);

      expect(repository.create.mock.calls[0][0].slug).not.toBe(
        repository.create.mock.calls[1][0].slug,
      );
    });

    it('ignores a slug smuggled in by the caller', async () => {
      await useCase.execute({ ...baseInput, slug: 'client-slug' } as CreateRoomInput);

      expect(dataOf().slug).not.toBe('client-slug');
    });
  });

  describe('expires_at', () => {
    it('defaults to one week from now', async () => {
      const before = Date.now();

      await useCase.execute(baseInput);

      const expires_at = dataOf().expires_at as Date;
      expect(expires_at.getTime()).toBeGreaterThanOrEqual(before + ROOM_LIFETIME_MS);
      expect(expires_at.getTime()).toBeLessThanOrEqual(Date.now() + ROOM_LIFETIME_MS);
    });

    it('respects an explicit future expires_at', async () => {
      const expires_at = new Date(Date.now() + 60 * 60 * 1000);

      await useCase.execute({ ...baseInput, expires_at });

      expect(dataOf().expires_at).toBe(expires_at);
    });

    it('throws if expires_at is in the past', async () => {
      await expect(
        useCase.execute({ ...baseInput, expires_at: new Date('2000-01-01T00:00:00.000Z') }),
      ).rejects.toThrow(new BadRequestException('Expiration date is invalid'));
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('happy path', () => {
    it('forwards the input to the repository and returns the created room', async () => {
      const result = await useCase.execute(baseInput);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(dataOf()).toEqual(
        expect.objectContaining({ owner_user_id: 'user-1', name: 'Sala de prueba' }),
      );
      expect(result).toEqual(expect.objectContaining({ name: 'Sala de prueba' }));
    });
  });
});
