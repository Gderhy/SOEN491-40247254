import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 25,
      lines: 40,
      statements: 40,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/scripts/**',
    '!src/types/**',
    '!src/database/**',
    '!src/ARCHITECTURE.md.ts',
  ],
};

export default config;
