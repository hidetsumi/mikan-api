import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        astTransformers: {
          before: ['<rootDir>/test/swagger-plugin.transformer.js'],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
};

export default config;
