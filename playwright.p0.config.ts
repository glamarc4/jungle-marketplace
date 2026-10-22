import { defineConfig } from '@playwright/test'
import audit from './playwright.audit.config'
export default defineConfig({ ...audit,
  outputDir: 'reports/p0-fixes/test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/p0-fixes/html' }], ['json', { outputFile: 'reports/p0-fixes/results.json' }]],
})
