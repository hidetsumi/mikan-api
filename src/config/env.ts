export const env = {
  PORT: process.env.PORT ?? '3000',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? '',
  JWT_ACCESS_EXPIRES_IN: 900,
  JWT_REFRESH_EXPIRES_IN: 604800,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true',
};
