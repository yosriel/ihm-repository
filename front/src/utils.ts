export const money = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

export function focusHeading() {
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>("main h1")?.focus(),
  );
}
