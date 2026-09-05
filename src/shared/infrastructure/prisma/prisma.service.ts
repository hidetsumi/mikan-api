import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from 'src/config/const';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }

    const adapter = new PrismaPg(DATABASE_URL);

    super({ adapter });
  }
}
