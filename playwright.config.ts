import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Extensions often require a single worker for persistent context
  reporter: "html",
  use: {
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 }
  },
  projects: [
    {
      name: "setup",
      testMatch: /setup\.ts/
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"]
    }
  ]
})
