// eslint-disable-next-line no-undef
module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/server'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.(css)$': '<rootDir>/jest.transform.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!swiper|swiper/react|ssr-window|dom7)'],
  testEnvironment: 'jsdom',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  reporters: ['default', 'jest-junit'],

  // We don't need to test the static JSX in the icons folder, so let's exclude it from our test coverage report
  coveragePathIgnorePatterns: ['node_modules', 'src/icons'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/src/__mocks__/fileMock.ts',
    '.+\\.(wav|mp3)$': '<rootDir>/src/__mocks__/fileMock.ts',

    '^swiper/react$': '<rootDir>/src/__mocks__/swiperReactMock.tsx',
    '^swiper/modules$': '<rootDir>/src/__mocks__/swiperMock.ts',
    '^swiper/css$': '<rootDir>/src/__mocks__/styleMock.ts',
    '^swiper/css/pagination$': '<rootDir>/src/__mocks__/styleMock.ts',

    '^d3-timer$': '<rootDir>/node_modules/d3-timer/dist/d3-timer.js',
    '\\.svg\\?react$': '<rootDir>/src/__mocks__/svgMock.ts',
  },
};
