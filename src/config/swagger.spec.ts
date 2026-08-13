import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { PrismaService } from '../shared/infrastructure/prisma/prisma.service';
import { buildSwaggerConfig } from './swagger';

describe('OpenAPI document', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  });

  afterAll(async () => {
    await app.close();
  });

  it('is an OpenAPI 3 document', () => {
    expect(document.openapi).toMatch(/^3\./);
    expect(document.info.title).toBe('Mikan API');
  });

  it('documents every auth and todo route', () => {
    expect(Object.keys(document.paths).sort()).toEqual(
      ['/', '/auth/login', '/auth/refresh', '/auth/register', '/todo', '/todo/{id}'].sort(),
    );
  });

  it('declares cookie auth, not bearer auth', () => {
    const schemes = document.components?.securitySchemes ?? {};

    expect(schemes.access_token).toMatchObject({ type: 'apiKey', in: 'cookie' });
    expect(Object.values(schemes).some((s) => 'scheme' in s && s.scheme === 'bearer')).toBe(false);
  });

  it('marks the todo endpoints as requiring the access_token cookie', () => {
    for (const method of Object.values(document.paths['/todo'] ?? {})) {
      expect(JSON.stringify(method)).toContain('access_token');
    }
  });

  it('infers DTO metadata from the CLI plugin', () => {
    const props = document.components?.schemas?.RegisterRequestDto?.properties;

    expect(props?.password).toMatchObject({ minLength: 8 });
    expect(props?.email).toMatchObject({ format: 'email' });
  });

  // Nest always emits a `summary` key, empty when @ApiOperation omits it,
  // so the check has to be on the value rather than on the key.
  it('gives every operation a non-empty summary', () => {
    const missing = Object.entries(document.paths).flatMap(([path, item]) =>
      Object.entries(item)
        .filter(([, op]) => typeof op === 'object' && 'summary' in op && !op.summary)
        .map(([method]) => `${method.toUpperCase()} ${path}`),
    );

    expect(missing).toEqual([]);
  });

  it('documents the status codes the routes are meant to return', () => {
    expect(Object.keys(document.paths['/todo/{id}']?.delete?.responses ?? {})).toContain('204');
    for (const path of ['/auth/login', '/auth/refresh']) {
      expect(Object.keys(document.paths[path]?.post?.responses ?? {})).toContain('200');
    }
  });

  it('gives every scalar schema property an example', () => {
    const missing = Object.entries(document.components?.schemas ?? {}).flatMap(([name, schema]) =>
      Object.entries('properties' in schema ? (schema.properties ?? {}) : {})
        .filter(([, prop]) => !('$ref' in prop) && prop.type !== 'array' && !('example' in prop))
        .map(([prop]) => `${name}.${prop}`),
    );

    expect(missing).toEqual([]);
  });

  // Query DTOs are flattened into `parameters` and never reach components.schemas,
  // so the check above cannot see them.
  it('gives every query parameter an example', () => {
    const missing = Object.entries(document.paths).flatMap(([path, item]) =>
      Object.entries(item).flatMap(([method, op]) =>
        (typeof op === 'object' && 'parameters' in op ? (op.parameters ?? []) : [])
          .filter(
            (p) =>
              'in' in p &&
              p.in === 'query' &&
              !('example' in p) &&
              !(p.schema && 'example' in p.schema),
          )
          .map((p) => `${method.toUpperCase()} ${path} ?${'name' in p ? p.name : ''}`),
      ),
    );

    expect(missing).toEqual([]);
  });

  it('leaves no unused DTO in the document', () => {
    expect(document.components?.schemas).not.toHaveProperty('RefreshTokenRequestDto');
  });

  it('exposes the todo filters as query params, not as a body', () => {
    const list = document.paths['/todo']?.get;

    expect(list?.requestBody).toBeUndefined();
    expect(list?.parameters?.map((p) => 'name' in p && p.name).sort()).toEqual([
      'limit',
      'offset',
      'status',
    ]);
  });
});
