import { RegisterUseCase } from './register.use-case';
import { LoginUseCase } from './login.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';

export const AuthUseCases = [RegisterUseCase, LoginUseCase, RefreshTokenUseCase];
