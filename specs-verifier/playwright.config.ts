import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '../specs',
  testMatch: ['**/*.spec.mts'],
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    trace: 'retain-on-failure',
  },
})
