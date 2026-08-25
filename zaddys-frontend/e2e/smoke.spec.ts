import { expect, test } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8000/api";

test("Django health and seeded catalog are available", async ({ request }) => {
  const health = await request.get("http://127.0.0.1:8000/");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).status).toBe("ok");

  const products = await request.get(`${apiUrl}/products/`);
  expect(products.ok()).toBeTruthy();
  const data = await products.json();
  const items = Array.isArray(data) ? data : data.results;
  expect(items.length).toBeGreaterThan(0);
  expect(items.some((item: { category_name?: string }) => item.category_name === "Drinks")).toBeTruthy();
});

test("home menu and product drinks sheet work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Our Menu")).toBeVisible({ timeout: 15000 });

  const productLink = page.locator('a[href^="/product/"]').first();
  await expect(productLink).toBeVisible();
  await productLink.click();
  await expect(page).toHaveURL(/\/product\/\d+$/, { timeout: 120000 });
  await expect(page.getByRole("button", { name: "Browse drinks" })).toBeVisible({ timeout: 120000 });
  await page.getByRole("button", { name: "Browse drinks" }).click();
  await expect(page.getByRole("dialog", { name: "Add a drink" })).toBeVisible();
  await expect(page.getByText("Add to order").first()).toBeVisible({ timeout: 15000 });
});

test("signup reaches OTP verification", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Full Name").fill("E2E Customer");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Phone Number").fill("08000000000");
  await page.getByLabel("Password", { exact: true }).fill("E2eTestPassword!123");
  await page.getByLabel("Confirm Password").fill("E2eTestPassword!123");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/auth\/verify$/, { timeout: 120000 });
  await expect(page.getByText("Verify Account")).toBeVisible();
});
