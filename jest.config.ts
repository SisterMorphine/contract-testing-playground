export default {
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'consumer/**/*.ts',
    'provider/**/*.ts',
    '!**/tests/**',
    '!**/node_modules/**',
  ],
};
