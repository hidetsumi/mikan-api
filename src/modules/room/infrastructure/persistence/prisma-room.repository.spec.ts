import { PrismaRoomRepository } from './prisma-room.repository';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { Room } from '../../domain/entities/room.entity';
import {
  RoomAccessMode,
  RoomStatus,
  RoomVisibility,
} from '../../domain/entities/room.entity.types';
import { CreateRoomData } from '../../domain/repository/room.repository.types';

const makeRow = (overrides: Partial<Room> = {}) => ({
  id: 'room-1',
  owner_user_id: 'user-1',
  slug: 'Zm9vYmFyYmF6',
  name: 'Sala de prueba',
  description: null,
  visibility: RoomVisibility.PUBLIC,
  access_mode: RoomAccessMode.ANONYMOUS,
  status: RoomStatus.ACTIVE,
  expires_at: new Date('2026-01-08T00:00:00.000Z'),
  last_activity_at: null,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('PrismaRoomRepository', () => {
  let repository: PrismaRoomRepository;
  let prisma: { room: { create: jest.Mock } };

  const input: CreateRoomData = {
    owner_user_id: 'user-1',
    slug: 'Zm9vYmFyYmF6',
    name: 'Sala de prueba',
    expires_at: new Date('2026-01-08T00:00:00.000Z'),
  };

  beforeEach(() => {
    prisma = { room: { create: jest.fn().mockResolvedValue(makeRow()) } };
    repository = new PrismaRoomRepository(prisma as unknown as PrismaService);
  });

  const dataOf = () => prisma.room.create.mock.calls[0][0].data;

  describe('create', () => {
    it('forwards the input fields to Prisma', async () => {
      await repository.create(input);

      expect(prisma.room.create).toHaveBeenCalledTimes(1);
      expect(dataOf()).toEqual(
        expect.objectContaining({
          owner_user_id: 'user-1',
          slug: 'Zm9vYmFyYmF6',
          name: 'Sala de prueba',
          expires_at: input.expires_at,
        }),
      );
    });

    it('leaves status and last_activity_at to the database defaults', async () => {
      await repository.create(input);

      expect(dataOf()).not.toHaveProperty('status');
      expect(dataOf()).not.toHaveProperty('last_activity_at');
    });

    it('passes visibility and access_mode through when given', async () => {
      await repository.create({
        ...input,
        visibility: RoomVisibility.PRIVATE,
        access_mode: RoomAccessMode.AUTHENTICATED_ONLY,
      });

      expect(dataOf()).toEqual(
        expect.objectContaining({
          visibility: RoomVisibility.PRIVATE,
          access_mode: RoomAccessMode.AUTHENTICATED_ONLY,
        }),
      );
    });

    it('returns a Room built from the created row', async () => {
      const result = await repository.create(input);

      expect(result).toBeInstanceOf(Room);
      expect(result).toEqual(expect.objectContaining({ id: 'room-1', slug: 'Zm9vYmFyYmF6' }));
    });
  });
});
