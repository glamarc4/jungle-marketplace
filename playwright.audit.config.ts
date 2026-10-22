import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// Separate evidence directory: preserve previous reports and visual baselines.
export default defineConfig({
  ...base,
  workers: 2,
  retries: 0,
  globalTimeout: 180_000,
  updateSnapshots: 'none',
  outputDir: 'reports/acceptance-audit/test-results-final',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/acceptance-audit/html' }],
    ['json', { outputFile: 'reports/acceptance-audit/results.json' }],
  ],
  use: { ...base.use, baseURL: 'http://127.0.0.1:5184' },
  webServer: {
    command: 'node scripts/audit-server.mjs',
    url: 'http://127.0.0.1:5184',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
