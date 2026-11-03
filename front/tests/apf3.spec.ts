import { test, expect } from "@playwright/test";
import axe from "axe-core";
import { mockApi } from "./fixtures";

async function audit(page: import("@playwright/test").Page) {
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(
    async () =>
      (
        await (window as unknown as { axe: typeof axe }).axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
          },
        })
      ).violations,
  );
  expect(
    violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("help uses native disclosure controls and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Ayuda", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Ayuda para comprar" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab"); // Close button
  await page.keyboard.press("Tab"); // First native summary
  await expect(dialog.locator("summary").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog.locator("details").first()).toHaveAttribute("open", "");
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
test("advisor image and phone alternative lead to budget-filtered products", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Abrir asesoría de compra",
    exact: true,
  });
  await expect(trigger.locator("img")).toHaveAttribute(
    "alt",
    "Asesoría de compra",
  );
  await trigger.click();
  await page.getByLabel("Presupuesto máximo en soles").selectOption("600");
  await audit(page);
  await page
    .getByRole("link", { name: "Ver opciones para mi presupuesto" })
    .click();
  await expect(page).toHaveURL(/maxPrice=600/);
  await page
    .getByRole("button", { name: "Venta telefónica", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("No realiza llamadas");
  await audit(page);
});
test("fictitious payment validates, announces, removes and never persists data", async ({
  page,
}) => {
  await page.goto("/producto/taurus-air-fry");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("link", { name: "Ver carrito", exact: true }).click();
  await page.getByRole("link", { name: "Continuar con la entrega" }).click();
  await page.locator('input[value="pickup"]').check();
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  await page
    .getByRole("button", {
      name: "Agregar tarjeta de demostración",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Usar tarjeta de demostración" })
    .click();
  await expect(page.getByLabel("Código de tarjeta ficticia")).toBeFocused();
  await expect(page.getByRole("alert")).toContainText("Escribe DEMO");
  await audit(page);
  await page.getByLabel("Código de tarjeta ficticia").fill("DEMO");
  await page
    .getByRole("button", { name: "Usar tarjeta de demostración" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".payment-demo")).toContainText(
    "Tarjeta de demostración agregada",
  );
  const stored = await page.evaluate(() =>
    JSON.stringify({ ...localStorage, ...sessionStorage }),
  );
  expect(stored).not.toContain("DEMO");
  await page
    .getByRole("button", { name: "Quitar tarjeta de demostración" })
    .click();
  await expect(page.locator(".payment-demo")).toContainText(
    "Sin tarjeta de demostración",
  );
  await audit(page);
});
