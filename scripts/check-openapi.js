/**
 * Lints the OpenAPI document the built app actually serves.
 *
 * It has to run against `dist/`, not against ts-jest: the swagger CLI plugin swallows
 * its own errors under ts-jest, so the document Jest sees is missing every response
 * body and resolves enums as bare objects. Only the real build is faithful.
 *
 *   node scripts/check-openapi.js           lint, then diff against openapi.json
 *   node scripts/check-openapi.js --write   lint, then update openapi.json
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'openapi.json');
const write = process.argv.includes('--write');

// Mirrors test/setup-env.ts: the document only needs the app to boot, never a real
// database or real secrets.
process.env.DATABASE_URL ||= 'postgresql://check:check@localhost:5432/check';
process.env.JWT_ACCESS_SECRET ||= 'check-access-secret';
process.env.JWT_REFRESH_SECRET ||= 'check-refresh-secret';

function build() {
  execFileSync('npx', ['nest', 'build'], { cwd: ROOT, stdio: 'inherit' });
}

async function generate() {
  const { Test } = require('@nestjs/testing');
  const { SwaggerModule } = require('@nestjs/swagger');
  const { AppModule } = require(path.join(ROOT, 'dist/src/app.module'));
  const { PrismaService } = require(
    path.join(ROOT, 'dist/src/shared/infrastructure/prisma/prisma.service'),
  );
  const { buildSwaggerConfig } = require(path.join(ROOT, 'dist/src/config/swagger'));

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  await app.close();

  return document;
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

function lint(doc) {
  const errors = [];

  for (const [route, item] of Object.entries(doc.paths)) {
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op) continue;
      const where = `${method.toUpperCase()} ${route}`;
      const codes = Object.keys(op.responses ?? {});

      if (!codes.some((c) => c.startsWith('2'))) {
        errors.push(`${where} declares no 2xx response.`);
      }

      const secured = (op.security ?? []).length > 0;
      if (secured && !codes.includes('401')) {
        errors.push(`${where} needs auth but documents no 401.`);
      }

      for (const param of op.parameters ?? []) {
        if (!param.schema || param.schema.type === 'object') {
          errors.push(`${where} parameter "${param.name}" has no usable schema.`);
        }
      }
    }
  }

  for (const [name, schema] of Object.entries(doc.components?.schemas ?? {})) {
    for (const [prop, value] of Object.entries(schema.properties ?? {})) {
      // A bare `object` is what an unresolved enum or a lost type degrades into.
      if (value.type === 'object' && !value.properties && !value.additionalProperties) {
        errors.push(`${name}.${prop} resolved to a bare object; the plugin lost its type.`);
      }
    }
  }

  return errors;
}

function diffSnapshot(doc) {
  const next = JSON.stringify(doc, null, 2) + '\n';

  if (write) {
    fs.writeFileSync(SNAPSHOT, next);
    console.log(`openapi.json updated (${Object.keys(doc.paths).length} paths).`);
    return [];
  }

  if (!fs.existsSync(SNAPSHOT)) {
    return ['openapi.json is missing. Run `pnpm swagger:snapshot`.'];
  }

  if (fs.readFileSync(SNAPSHOT, 'utf8') !== next) {
    return [
      'The served document no longer matches openapi.json.',
      'Review the change, then run `pnpm swagger:snapshot` to accept it.',
    ];
  }

  return [];
}

(async () => {
  build();
  const doc = await generate();
  const errors = [...lint(doc), ...diffSnapshot(doc)];

  if (errors.length) {
    console.error('\nOpenAPI check failed:\n' + errors.map((e) => `  - ${e}`).join('\n') + '\n');
    process.exit(1);
  }

  console.log(`OpenAPI check passed (${Object.keys(doc.paths).length} paths).`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
