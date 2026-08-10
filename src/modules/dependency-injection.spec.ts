// Building the graph instantiates JwtStrategy and PrismaService, both of which
// refuse to construct without config. Stub the values here rather than relying
// on a .env file, which CI does not have.
jest.mock('src/config/env', () => ({
  env: {
    ...jest.requireActual('src/config/env').env,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
  },
}));

import { Test } from '@nestjs/testing';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/infrastructure/http/auth.controller';
import { TodoModule } from './todo/todo.module';
import { TodoController } from './todo/infrastructure/http/todo.controller';

// Controllers inject use cases directly, and use cases inject abstract repository
// contracts bound to Prisma implementations in the module. A missing or wrong
// binding type-checks fine and only blows up when Nest builds the graph at
// startup, so nothing else in the suite would catch it.
//
// `compile()` resolves the full provider graph without running lifecycle hooks,
// so this needs no database.
describe('module wiring', () => {
  it('resolves AuthController with all its use cases', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AuthModule] }).compile();

    expect(moduleRef.get(AuthController)).toBeDefined();
  });

  it('resolves TodoController with all its use cases', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TodoModule] }).compile();

    expect(moduleRef.get(TodoController)).toBeDefined();
  });
});
