import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
      throw new Error('DATABASE_URL is not configured');
    }

    const adapter = new PrismaPg(databaseUrl);

    super({ adapter });
  }
}
