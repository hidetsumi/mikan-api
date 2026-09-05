export const DATABASE_URL = process.env.DATABASE_URL ?? '';
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? '';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? '';
export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const PORT = Number(process.env.PORT ?? 3000);
export const IS_PRODUCTION = NODE_ENV === 'production';

export const JWT_ACCESS_EXPIRES_IN_SECONDS = 900;
export const JWT_REFRESH_EXPIRES_IN_SECONDS = 604800;
