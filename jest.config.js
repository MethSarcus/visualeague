// Next 15 references the Fetch API while loading its Jest adapter. Node 16
// does not expose these globals, so provide the minimal constructors needed
// during configuration loading. Production Next.js runs with its own runtime.
if (!global.Request) global.Request = class Request {}
if (!global.Response) global.Response = class Response {}
if (!global.Headers) global.Headers = class Headers {}

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/tests/test-setup.js']
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)