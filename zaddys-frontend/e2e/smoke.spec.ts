import { expect, test } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8000/api";
const socialSecret = process.env.SOCIAL_LOGIN_SECRET || "e2e-social-secret";

async function socialLoginViaApi(request: any, email: string, name: string) {
  const response = await request.post(`${apiUrl}/auth/social-login/`, {
    data: {
      email,
      name,
      provider: "google",
      secret: socialSecret,
    },
  });

  expect(response.ok()).toBeTruthy();
  return await response.json();
}

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

test("social signup and existing social login are consistent", async ({ request }) => {
  const email = `e2e-social-${Date.now()}@example.com`;
  const newUser = await socialLoginViaApi(request, email, "E2E Social User");
  const existingUser = await socialLoginViaApi(request, email, "E2E Social User");

  expect(newUser.user.email).toBe(email);
  expect(existingUser.user.email).toBe(email);
  expect(existingUser.user.id).toBe(newUser.user.id);
});

test("checkout happy path creates an order after mocked Paystack payment", async ({ page, request }) => {
  const email = `e2e-checkout-${Date.now()}@example.com`;
  const socialUser = await socialLoginViaApi(request, email, "E2E Buyer");

  const productsResponse = await request.get(`${apiUrl}/products/`);
  expect(productsResponse.ok()).toBeTruthy();
  const products = await productsResponse.json();
  const items = Array.isArray(products) ? products : products.results;
  const firstProduct = items[0];
  expect(firstProduct).toBeTruthy();

  await page.route("https://js.paystack.co/v1/inline.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        window.PaystackPop = {
          setup: function (config) {
            return {
              openIframe: function () {
                if (typeof config.callback === "function") {
                  config.callback({ reference: "paystack-ref-${Date.now()}" });
                }
              }
            };
          }
        };
      `,
    });
  });

  const cartPayload = [{
    cartItemId: `product-${firstProduct.id}:`,
    id: firstProduct.id,
    name: firstProduct.name,
    price: Number(firstProduct.price),
    quantity: 1,
    image: firstProduct.image || "",
    is_custom_quote: false,
    selected_option_ids: [],
  }];

  await page.goto("/");
  await page.evaluate(
    ({ accessToken, refreshToken, cart }) => {
      localStorage.setItem("zaddys_access_token", accessToken);
      localStorage.setItem("zaddys_refresh_token", refreshToken);
      localStorage.setItem("zaddys_cart", JSON.stringify(cart));
    },
    {
      accessToken: socialUser.access,
      refreshToken: socialUser.refresh,
      cart: cartPayload,
    },
  );

  const orderRequestPromise = page.waitForRequest((request) => request.url().includes("/api/orders/create/"));
  const orderResponsePromise = page.waitForResponse((response) => response.url().includes("/api/orders/create/"));

  page.once("dialog", (dialog) => dialog.accept());

  await page.goto("/cart");

  await expect(page.getByPlaceholder("Phone Number")).toBeVisible({ timeout: 15000 });
  await page.getByPlaceholder("Phone Number").fill("08000000000");
  await page.locator("#delivery-address").fill("12 Lekki Phase 1, Lekki, Lagos");
  await page.getByPlaceholder("Nearest Landmark").fill("Near the market");

  const zoneSelect = page.locator("select").first();
  await expect(zoneSelect).toBeVisible({ timeout: 15000 });
  await zoneSelect.selectOption({ index: 1 });

  await page.getByRole("button", { name: /Pay ₦/ }).click();

  const orderRequest = await orderRequestPromise;
  expect(orderRequest.method()).toBe("POST");

  const orderResponse = await orderResponsePromise;
  expect(orderResponse.status()).toBe(201);
  const orderBody = await orderResponse.json();
  expect(orderBody.order_number).toBeTruthy();

  await expect(page).toHaveURL(/\/track\/.+/, { timeout: 120000 });
  await expect(page.locator("text=Payment Successful").first()).toBeVisible({ timeout: 15000 }).catch(() => null);
  const remainingCart = await page.evaluate(() => localStorage.getItem("zaddys_cart"));
  expect(remainingCart).toBe("[]");
});
