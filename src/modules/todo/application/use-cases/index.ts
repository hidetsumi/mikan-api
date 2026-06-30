import { CreateUseCase } from './create.use-case';
import { FindAllUseCase } from './find-all.use-case';
import { FindByIdUseCase } from './find-by-id.use-case';
import { UpdateUseCase } from './update.use-case';
import { DeleteUseCase } from './delete.use-case';

export const TodoUseCases = [
  CreateUseCase,
  FindAllUseCase,
  FindByIdUseCase,
  UpdateUseCase,
  DeleteUseCase,
];
