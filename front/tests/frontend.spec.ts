import { test, expect } from "@playwright/test";
import axe from "axe-core";
import type { AxeResults } from "axe-core";
import { mockApi } from "./fixtures";

async function addProduct(
  page: import("@playwright/test").Page,
  id = "taurus-air-fry",
) {
  await page.goto(`/producto/${id}`);
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("link", { name: "Ver carrito", exact: true }).click();
  await page.getByRole("link", { name: "Continuar con la entrega" }).click();
}
async function audit(page: import("@playwright/test").Page) {
  await page.addScriptTag({ content: axe.source });
  const result = await page.evaluate(async () =>
    (
      window as unknown as {
        axe: { run: (root: Document, options: object) => Promise<AxeResults> };
      }
    ).axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
    }),
  );
  expect(
    result.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}
test.beforeEach(async ({ page }) => {
  await mockApi(page);
});
test("filters apply, cancel, clear and preserve search", async ({ page }) => {
  await page.goto("/catalogo?q=freidora");
  await page.getByRole("button", { name: "Precio", exact: true }).click();
  await page.getByLabel("Precio máximo").fill("400");
  await page.getByLabel("Marca", { exact: true }).selectOption("Taurus");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page).toHaveURL(/maxPrice=400/);
  await page.getByRole("button", { name: "Precio", exact: true }).click();
  await page.getByLabel("Precio máximo").fill("100");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Quitar filtro Marca Taurus" })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.locator(".product-card")).toHaveCount(4);
  await expect(page.getByRole("searchbox")).toHaveValue("freidora");
});
test("full home delivery, validation, no number and confirmed total", async ({
  page,
}) => {
  await addProduct(page);
  await page.getByRole("button", { name: "Revisar dirección" }).click();
  await expect(page.locator(".error-summary")).toBeFocused();
  await page.getByLabel("Distrito", { exact: true }).selectOption("Miraflores");
  await page.getByLabel("Calle, avenida o jirón").fill("Avenida Arequipa");
  await page.getByLabel("Dirección sin número").check();
  await expect(page.getByLabel("Número", { exact: true })).toBeDisabled();
  await page.getByLabel("Referencia (opcional)").fill("Frente al parque");
  await audit(page);
  await page.getByRole("button", { name: "Revisar dirección" }).click();
  await expect(page.getByRole("dialog")).toContainText("Avenida Arequipa s/n");
  await page.getByRole("button", { name: "Usar esta dirección" }).click();
  await expect(
    page.getByText("Total confirmado", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".summary-total")).toContainText("401.90");
  await expect(page.locator("#simulation-scope")).toContainText(
    "No se realizará ningún cobro",
  );
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Ver condiciones de compra" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No se realizará ningún cobro",
  );
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Ver condiciones de compra" }),
  ).toBeFocused();
  await page.getByLabel("Acepto las condiciones de compra.").check();
  await audit(page);
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toBeVisible();
  await expect(page.locator(".confirmation-receipt")).toContainText("SIM-");
  await expect(page.locator(".summary-total")).toContainText("401.90");
  await expect(page.locator(".confirmation")).toContainText(
    "No se realizó ningún cobro",
  );
  await audit(page);
});
test("pickup avoids address and quantities persist between routes", async ({
  page,
}) => {
  await addProduct(page);
  await page
    .getByRole("link", { name: "Volver al carrito", exact: true })
    .click();
  await page.getByRole("button", { name: /Aumentar cantidad/ }).click();
  await expect(
    page.getByRole("button", { name: /Aumentar cantidad/ }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Continuar con la entrega" }).click();
  await page.locator('input[value="pickup"]').check();
  await expect(page.locator(".pickup-detail")).toContainText("demostración");
  await expect(page.getByLabel("Calle, avenida o jirón")).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  await expect(page.locator(".summary-total")).toContainText("778.00");
  await page.getByLabel("Acepto las condiciones de compra.").check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toBeVisible();
  await expect(page.locator(".summary-total")).toContainText("778.00");
});
test("home-only item disables pickup and deleting the last item empties cart", async ({
  page,
}) => {
  await addProduct(page, "imaco-compact");
  await expect(page.locator('input[value="pickup"]')).toBeDisabled();
  await page
    .getByRole("link", { name: "Volver al carrito", exact: true })
    .click();
  await page.getByRole("button", { name: /Eliminar Freidora/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Tu carrito tiene espacio para algo bueno",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continuar con la entrega" }),
  ).toHaveCount(0);
});
test("favorites and comparison remain available and limit is explained", async ({
  page,
}) => {
  await page.goto("/catalogo");
  await page
    .getByRole("button", { name: /Guardar en favoritos/ })
    .first()
    .click();
  const checks = page.locator(".compare-check input");
  await checks.nth(0).check();
  await checks.nth(1).check();
  await checks.nth(2).check();
  await checks.nth(3).click();
  await expect(checks.nth(3)).not.toBeChecked();
  await expect(page.locator("[role=status]").last()).toContainText(
    "hasta tres productos",
  );
  await page.getByRole("link", { name: "Comparar", exact: true }).click();
  await expect(page.locator(".comparison-card")).toHaveCount(3);
  await audit(page);
  await page
    .getByRole("link", { name: /Favoritos/ })
    .first()
    .click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
});
test("keyboard dialog traps focus, Escape restores origin, no automatic defects", async ({
  page,
}) => {
  await page.goto("/catalogo");
  const open = page.getByRole("button", { name: "Precio", exact: true });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Cerrar filtrar productos" }),
  ).toBeFocused();
  await audit(page);
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await audit(page);
});
test("simulation timeout retry reuses key and never shows false success", async ({
  page,
}) => {
  await addProduct(page);
  await page.locator('input[value="pickup"]').check();
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  const calls: { key: string; body: string }[] = [];
  await page.route("**/api/checkout/simulate", async (route) => {
    calls.push({
      key: route.request().headers()["idempotency-key"],
      body: route.request().postData()!,
    });
    if (calls.length === 1) return route.abort("failed");
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        simulationId: "SIM-recovered",
        subtotal: 389,
        delivery: 0,
        total: 389,
        currency: "PEN",
        itemCount: 1,
        simulated: true,
        deliveryMethod: "pickup",
      }),
    });
  });
  await page.getByLabel("Acepto las condiciones de compra.").check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.locator(".submit-error")).toContainText(
    "No pudimos conectar",
  );
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toHaveCount(0);
  await expect(page.locator(".review-line")).toHaveCount(1);
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toBeVisible();
  expect(calls).toHaveLength(2);
  expect(calls[0]).toEqual(calls[1]);
});
test("responsive pages reflow without horizontal overflow", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/catalogo", "/producto/taurus-air-fry"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.locator(".loading").waitFor({ state: "hidden" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
});

test("quote failure blocks completion and recovery keeps selections", async ({
  page,
}) => {
  await addProduct(page);
  await page.locator('input[value="pickup"]').check();
  let fail = true;
  await page.route("**/api/checkout/quote", async (route) =>
    fail
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ message: "No pudimos confirmar el total." }),
        })
      : route.fallback(),
  );
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  await page.getByLabel("Acepto las condiciones de compra.").check();
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeDisabled();
  await expect(page.locator(".review-line")).toHaveCount(1);
  fail = false;
  await page.getByRole("button", { name: "Reintentar cálculo" }).click();
  await expect(page.locator(".summary-total")).toContainText("389.00");
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
});
test("direct review requires a reviewed address and does not persist address", async ({
  page,
}) => {
  await addProduct(page);
  await page.getByLabel("Distrito", { exact: true }).selectOption("Miraflores");
  await page.getByLabel("Calle, avenida o jirón").fill("Avenida Arequipa");
  await page.getByLabel("Número", { exact: true }).fill("123");
  await page.getByRole("button", { name: "Revisar dirección" }).click();
  await page.getByRole("button", { name: "Usar esta dirección" }).click();
  await page.getByRole("link", { name: "Editar entrega", exact: true }).click();
  await page.getByLabel("Calle, avenida o jirón").fill("Avenida Larco");
  await page.goBack();
  await expect(
    page.getByText("Falta revisar una dirección válida."),
  ).toBeVisible();
  await page.getByLabel("Acepto las condiciones de compra.").check();
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() =>
      JSON.stringify({
        local: { ...localStorage },
        session: { ...sessionStorage },
      }),
    ),
  ).not.toContain("Arequipa");
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage })),
  ).not.toContain("Larco");
});
test("two processes can be completed using keyboard actions", async ({
  page,
}) => {
  async function activate(locator: import("@playwright/test").Locator) {
    await expect(locator).toBeEnabled();
    await locator.focus();
    await page.keyboard.press("Enter");
  }
  await page.goto("/");
  await activate(page.getByRole("link", { name: "Explorar freidoras" }));
  await activate(page.getByRole("button", { name: "Precio", exact: true }));
  await page.getByLabel("Precio máximo").focus();
  await page.keyboard.type("400");
  await activate(page.getByRole("button", { name: "Aplicar filtros" }));
  await expect(page.locator(".product-card")).toHaveCount(2);
  await activate(page.locator(".product-card .product-name a").first());
  await activate(page.getByRole("button", { name: "Agregar al carrito" }));
  await activate(page.getByRole("link", { name: "Ver carrito", exact: true }));
  await activate(page.getByRole("link", { name: "Continuar con la entrega" }));
  await page.locator("input[value=pickup]").focus();
  await page.keyboard.press("Space");
  await activate(page.getByRole("button", { name: "Continuar a revisión" }));
  await page.getByLabel("Acepto las condiciones de compra.").focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
  await activate(page.getByRole("button", { name: "Confirmar compra" }));
  await expect(
    page.getByRole("heading", { name: "Confirmación completada" }),
  ).toBeVisible();
});
test("automated accessibility checks cover home, product, cart and empty states", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/catalogo?q=sin-coincidencias",
    "/carrito",
    "/favoritos",
    "/producto/taurus-air-fry",
  ]) {
    await page.goto(path);
    await page.locator(".loading").waitFor({ state: "hidden" });
    await audit(page);
  }
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("link", { name: "Ver carrito", exact: true }).click();
  await page.locator(".cart-line").waitFor();
  await audit(page);
});

test("product photos and titles share one destination without duplicate links", async ({
  page,
}) => {
  await page.goto("/catalogo");
  const card = page.locator(".product-card").filter({
    has: page.getByRole("heading", {
      name: "Freidora de aire Air Fry Digital 4 L",
      exact: true,
    }),
  });
  await expect(card.locator("a")).toHaveCount(1);
  await card.locator(".product-visual").scrollIntoViewIfNeeded();
  const photo = await card.locator(".product-visual").boundingBox();
  if (!photo) throw new Error("Product photo was not rendered");
  await page.mouse.click(photo.x + photo.width / 2, photo.y + photo.height / 2);
  await expect(page).toHaveURL(/producto\/taurus-air-fry$/);
  await expect(
    page.getByRole("button", { name: "Agregar al carrito" }),
  ).toBeVisible();
});
test("secondary information remains readable across screen sizes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".product-card").first().waitFor();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const sizes = await page
      .locator(
        ".hero-kicker, .hero-caption, .eyebrow, .product-brand, .seller, .rating .muted, .discount, .footer-bottom p",
      )
      .evaluateAll((elements) =>
        elements.map((element) =>
          parseFloat(getComputedStyle(element).fontSize),
        ),
      );
    expect(sizes.every((size) => size >= 12)).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("page title stays meaningful when evaluation tools annotate headings", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tu cocina, a tu manera. | Falabella");
  await page.locator("h1").evaluate((heading) => {
    const annotation = document.createElement("span");
    annotation.textContent = "*tabindex=-1*";
    heading.append(annotation);
  });
  await expect(page).toHaveTitle("Tu cocina, a tu manera. | Falabella");
});
