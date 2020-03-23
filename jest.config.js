module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['<rootDir>/test/**/*.ts'],
    transform: {'\\.ts$': 'ts-jest'},
    coverageReporters: ['lcov', 'text-summary'],
    collectCoverageFrom: ['src/**/*.ts']
  }