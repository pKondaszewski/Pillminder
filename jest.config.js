// Set in the main process: workers inherit it, while setupFiles only see a copy of process.env.
process.env.TZ = 'Europe/Warsaw';

module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-native|@react-native|expo|@expo|@expo-google-fonts|@react-navigation|@formatjs))',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
