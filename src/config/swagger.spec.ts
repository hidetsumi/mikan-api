import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { PrismaService } from '../shared/infrastructure/prisma/prisma.service';
import { buildSwaggerConfig } from './swagger';

// Jest only sees what the plugin's model visitor produces: DTO schemas and query
// params. Its controller visitor throws under ts-jest and is swallowed, so response
// bodies and summaries are missing here even though the built app serves them.
// Nothing checks those automatically; read /docs on the running app instead.
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
    const schema = document.components?.schemas?.RegisterRequestDto;
    const props = schema && 'properties' in schema ? schema.properties : undefined;

    expect(props?.password).toMatchObject({ minLength: 8 });
    expect(props?.email).toMatchObject({ format: 'email' });
  });

  it('exposes the todo filters as optional query params, not as a body', () => {
    const list = document.paths['/todo']?.get;

    expect(list?.requestBody).toBeUndefined();
    expect(list?.parameters?.map((p) => 'name' in p && p.name).sort()).toEqual([
      'limit',
      'offset',
      'status',
    ]);
    expect(list?.parameters?.every((p) => 'required' in p && !p.required)).toBe(true);
  });

  it('leaves no unused DTO in the document', () => {
    expect(document.components?.schemas).not.toHaveProperty('RefreshTokenRequestDto');
  });
});
