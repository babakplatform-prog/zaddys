import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "python manage.py migrate --noinput && python manage.py runserver 127.0.0.1:8000 --noreload",
      cwd: "../zaddys-backend",
      env: {
        ...process.env,
        E2E_TEST_MODE: "1",
        SOCIAL_LOGIN_SECRET: process.env.SOCIAL_LOGIN_SECRET || "e2e-social-secret",
      },
      url: "http://127.0.0.1:8000/",
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: "npm run dev -- --port 3000",
      cwd: ".",
      env: {
        ...process.env,
        PORT: "3000",
        NEXTAUTH_URL: "http://localhost:3000",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:8000/api",
        NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_mock_e2e_key",
        SOCIAL_LOGIN_SECRET: process.env.SOCIAL_LOGIN_SECRET || "e2e-social-secret",
      },
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
