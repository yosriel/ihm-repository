import type { Page } from "@playwright/test";
import type { Product } from "../src/types";
export const products: Product[] = [
  {
    id: "taurus-air-fry",
    slug: "taurus-air-fry",
    brand: "Taurus",
    name: "Freidora de aire Air Fry Digital 4 L",
    description: "Prepara tus recetas con aire caliente.",
    price: 389,
    previousPrice: 499,
    rating: 4.7,
    reviewCount: 128,
    capacity: "4 L",
    color: "negro",
    image: "/images/taurus.jpg",
    seller: "Falabella",
    sellerType: "falabella",
    delivery: "both",
    stock: 12,
    maxQuantity: 2,
    features: ["Panel digital", "Canasta antiadherente"],
  },
  {
    id: "oster-digital",
    slug: "oster-digital",
    brand: "Oster",
    name: "Freidora de aire Digital 5 L",
    description: "Para compartir en familia.",
    price: 449,
    previousPrice: 599,
    rating: 4.8,
    reviewCount: 96,
    capacity: "5 L",
    color: "negro",
    image: "/images/oster.jpg",
    seller: "Falabella",
    sellerType: "falabella",
    delivery: "both",
    stock: 8,
    maxQuantity: 2,
    features: ["Control digital", "Canasta removible"],
  },
  {
    id: "imaco-compact",
    slug: "imaco-compact",
    brand: "Imaco",
    name: "Freidora de aire Compact 3 L",
    description: "Compacta para tu cocina.",
    price: 279,
    previousPrice: 349,
    rating: 4.4,
    reviewCount: 64,
    capacity: "3 L",
    color: "negro",
    image: "/images/imaco.jpg",
    seller: "Imaco Store",
    sellerType: "marketplace",
    delivery: "home",
    stock: 16,
    maxQuantity: 2,
    features: ["Temporizador", "Diseño compacto"],
  },
  {
    id: "philips-essential",
    slug: "philips-essential",
    brand: "Philips",
    name: "Freidora de aire Essential 6 L",
    description: "Porciones generosas.",
    price: 599,
    previousPrice: 749,
    rating: 4.9,
    reviewCount: 214,
    capacity: "6 L",
    color: "negro",
    image: "/images/philips.jpg",
    seller: "Falabella",
    sellerType: "falabella",
    delivery: "both",
    stock: 10,
    maxQuantity: 2,
    features: ["Circulación de aire", "Control de temperatura"],
  },
];
export const checkoutOptions = {
  currency: "PEN",
  homeDelivery: 12.9,
  pickupDelivery: 0,
  maxQuantityPerProduct: 2,
  districts: [
    "Barranco",
    "Jesús María",
    "Miraflores",
    "San Borja",
    "San Isidro",
    "Santiago de Surco",
  ],
  pickupPoint: {
    id: "demo-miraflores",
    name: "Punto de retiro de demostración",
    address: "Miraflores, Lima · ubicación académica sin atención real",
  },
};
export async function mockApi(page: Page) {
  const attempts: { key: string; body: string }[] = [];
  await page.route("**/api/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname,
      q = url.searchParams;
    const json = (value: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(value),
      });
    if (path === "/api/health")
      return json({ status: "UP", application: "falabella-ihm-back" });
    if (path === "/api/catalog/filters")
      return json({
        brands: ["Imaco", "Oster", "Philips", "Taurus"],
        capacities: ["3 L", "4 L", "5 L", "6 L"],
        colors: ["negro"],
        sellers: [
          { value: "falabella", label: "Falabella" },
          { value: "marketplace", label: "Tiendas del marketplace" },
        ],
        deliveryMethods: [
          { value: "home", label: "Entrega a domicilio" },
          { value: "pickup", label: "Retiro en tienda" },
        ],
        sortOptions: [
          { value: "recommended", label: "Recomendados" },
          { value: "price-asc", label: "Menor precio" },
          { value: "price-desc", label: "Mayor precio" },
          { value: "rating-desc", label: "Mejor calificación" },
        ],
      });
    if (path === "/api/checkout/options") return json(checkoutOptions);
    if (path === "/api/products") {
      const result = products.filter(
        (product) =>
          (!q.get("q") ||
            `${product.name} ${product.brand}`
              .toLowerCase()
              .includes(q.get("q")!.toLowerCase())) &&
          (!q.get("brand") || product.brand === q.get("brand")) &&
          (!q.get("minPrice") || product.price >= Number(q.get("minPrice"))) &&
          (!q.get("maxPrice") || product.price <= Number(q.get("maxPrice"))) &&
          (!q.get("minRating") ||
            product.rating >= Number(q.get("minRating"))) &&
          (!q.get("minDiscount") ||
            (1 - product.price / product.previousPrice) * 100 >=
              Number(q.get("minDiscount"))) &&
          (!q.get("delivery") ||
            q.get("delivery") === "home" ||
            product.delivery === "both") &&
          (!q.get("seller") || product.sellerType === q.get("seller")) &&
          (!q.get("capacity") || product.capacity === q.get("capacity")),
      );
      if (q.get("sort") === "price-asc")
        result.sort((a, b) => a.price - b.price);
      if (q.get("sort") === "price-desc")
        result.sort((a, b) => b.price - a.price);
      if (q.get("sort") === "rating-desc")
        result.sort((a, b) => b.rating - a.rating);
      const size = Number(q.get("size") || 12),
        current = Number(q.get("page") || 0);
      return json({
        items: result.slice(current * size, (current + 1) * size),
        page: current,
        size,
        totalElements: result.length,
        totalPages: Math.ceil(result.length / size),
      });
    }
    if (path.startsWith("/api/products/")) {
      const product = products.find(
        (product) => product.id === decodeURIComponent(path.split("/").pop()!),
      );
      return product
        ? json(product)
        : json(
            { message: "No encontramos ese producto.", field: "productId" },
            404,
          );
    }
    if (path === "/api/checkout/quote" || path === "/api/checkout/simulate") {
      const body = request.postDataJSON();
      const subtotal = body.items.reduce(
        (total: number, item: { productId: string; quantity: number }) =>
          total +
          products.find((product) => product.id === item.productId)!.price *
            item.quantity,
        0,
      );
      const delivery = body.deliveryMethod === "home" ? 12.9 : 0;
      const quote = {
        subtotal,
        delivery,
        total: subtotal + delivery,
        currency: "PEN",
        itemCount: body.items.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0,
        ),
      };
      if (path.endsWith("/quote")) return json(quote);
      attempts.push({
        key: request.headers()["idempotency-key"],
        body: request.postData()!,
      });
      return json({
        ...quote,
        simulationId: "SIM-00000000-0000-4000-8000-000000000001",
        simulated: true,
        deliveryMethod: body.deliveryMethod,
      });
    }
    return json({ message: "Ruta no encontrada" }, 404);
  });
  return { attempts };
}
