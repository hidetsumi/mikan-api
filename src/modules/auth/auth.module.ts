import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './infrastructure/http/auth.controller';
import { AuthUseCases } from './application/use-cases';
import { UsersModule } from '../users/users.module';
import { JwtTokenService } from './infrastructure/jwt/jwt-token.service';
import { TokenService } from './domain/services/token.services';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';
import { AuthRepository } from './domain/repository/auth.repository';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import { env } from 'src/config/env';

@Module({
  controllers: [AuthController],
  providers: [
    ...AuthUseCases,
    JwtStrategy,
    JwtRefreshStrategy,
    { provide: TokenService, useClass: JwtTokenService },
    { provide: AuthRepository, useClass: PrismaAuthRepository },
  ],
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
    }),
  ],
})
export class AuthModule {}
