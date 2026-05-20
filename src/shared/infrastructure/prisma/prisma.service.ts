import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from 'src/config/env';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }

    const adapter = new PrismaPg(env.DATABASE_URL);

    super({ adapter });
  }
}
