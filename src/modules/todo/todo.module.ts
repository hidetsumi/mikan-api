import { Module } from '@nestjs/common';
import { TodoController } from './infrastructure/http/todo.controller';
import { TodoRepository } from './domain/repository/todo.repository';
import { PrismaTodoRepository } from './infrastructure/persistence/prisma-todo.repository';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import { TodoUseCases } from './application/use-cases';

@Module({
  controllers: [TodoController],
  providers: [...TodoUseCases, { provide: TodoRepository, useClass: PrismaTodoRepository }],
  imports: [PrismaModule],
})
export class TodoModule {}
