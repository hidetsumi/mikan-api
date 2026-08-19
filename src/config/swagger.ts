import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Mikan API')
    .setDescription(
      'REST API for Mikan, a todo application. Authentication uses httpOnly cookies: ' +
        'POST /auth/login sets `access_token` and `refresh_token`, and protected endpoints ' +
        'read the access token from the cookie rather than from an Authorization header.',
    )
    .setVersion('0.3.0')
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'JWT access token, set as an httpOnly cookie by POST /auth/login.',
      },
      'access_token',
    )
    .addCookieAuth(
      'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
        description: 'JWT refresh token, set as an httpOnly cookie and rotated on every use.',
      },
      'refresh_token',
    )
    .addTag('health', 'Liveness')
    .addTag('auth', 'Registration, login and refresh token rotation')
    .addTag('todo', 'Todo CRUD, scoped to the authenticated user')
    .build();
}

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
