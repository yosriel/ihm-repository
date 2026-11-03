import { test, expect } from "@playwright/test";
test.skip(
  !process.env.IHM_LIVE_API,
  "Set IHM_LIVE_API=1 to run against the real local backend and MySQL.",
);
test("real API: search, filters, product, cart, pickup, persisted simulation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("freidora");
  await page.getByRole("searchbox").press("Enter");
  await page.getByRole("button", { name: "Precio", exact: true }).click();
  await page.getByLabel("Precio máximo").fill("400");
  await page.getByLabel("Marca", { exact: true }).selectOption("Taurus");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator(".product-card .product-name a").click();
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("link", { name: "Ver carrito", exact: true }).click();
  await page.getByRole("button", { name: /Aumentar cantidad/ }).click();
  await page.getByRole("link", { name: "Continuar con la entrega" }).click();
  await page.locator("input[value=pickup]").check();
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  await expect(page.locator(".summary-total")).toContainText("778.00");
  await page.getByLabel("Acepto las condiciones de compra.").check();
  const completed = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/checkout/simulate") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  const response = await completed;
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.simulated).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toBeVisible();
  await expect(page.locator(".receipt-id")).toContainText(result.simulationId);
  const replay = await page.request.post("/api/checkout/simulate", {
    data: response.request().postDataJSON(),
    headers: {
      "Idempotency-Key": response.request().headers()["idempotency-key"],
    },
  });
  expect(await replay.json()).toEqual(result);
});

test("real API: reviewed home address produces server totals and confirmation", async ({
  page,
}) => {
  await page.goto("/producto/taurus-air-fry");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("link", { name: "Ver carrito", exact: true }).click();
  await page.getByRole("link", { name: "Continuar con la entrega" }).click();
  await page.getByLabel("Distrito", { exact: true }).selectOption("Miraflores");
  await page.getByLabel("Calle, avenida o jirón").fill("Avenida de Prueba");
  await page.getByLabel("Dirección sin número").check();
  await page.getByRole("button", { name: "Revisar dirección" }).click();
  await page.getByRole("button", { name: "Usar esta dirección" }).click();
  await expect(page.locator(".summary-total")).toContainText("401.90");
  await page.getByLabel("Acepto las condiciones de compra.").check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toBeVisible();
  await expect(page.locator(".confirmation-receipt")).toContainText("401.90");
});
