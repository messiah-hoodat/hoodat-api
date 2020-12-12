module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./test/setup.ts'],
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 10000,
  watchPathIgnorePatterns: ['node_modules'],
};