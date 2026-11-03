import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Address, CartItem, Delivery, Product, Simulation } from "./types";
import { ApiError, request } from "./services/api";

function readList(key: string): unknown[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.slice(0, 48) : [];
  } catch {
    return [];
  }
}
function useSaved<T>(key: string, initial: () => T) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Keep the current session usable without storage. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
export function useShopState() {
  const [cart, setCart] = useSaved<CartItem[]>("ihm.cart.v1", () => {
    const seen = new Set<string>();
    return readList("ihm.cart.v1").filter((item): item is CartItem => {
      if (
        !item ||
        typeof item !== "object" ||
        !("productId" in item) ||
        !("quantity" in item) ||
        typeof item.productId !== "string" ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 1000 ||
        seen.has(item.productId)
      )
        return false;
      seen.add(item.productId);
      return true;
    });
  });
  const [favorites, setFavorites] = useSaved<string[]>(
    "ihm.favorites.v1",
    () => [
      ...new Set(
        readList("ihm.favorites.v1").filter(
          (id): id is string => typeof id === "string",
        ),
      ),
    ],
  );
  const [comparison, setComparison] = useState<string[]>([]);
  const [delivery, setDelivery] = useState<Delivery>("home");
  const [address, setAddress] = useState<Address>({
    district: "",
    street: "",
    number: "",
    noNumber: false,
    reference: "",
  });
  const [addressReviewed, setAddressReviewed] = useState(false);
  const [result, setResult] = useState<Simulation | null>(null);
  const simulationAttempt = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );
  function getSimulationKey(fingerprint: string) {
    if (simulationAttempt.current?.fingerprint !== fingerprint)
      simulationAttempt.current = { fingerprint, key: crypto.randomUUID() };
    return simulationAttempt.current.key;
  }
  function clearSimulationAttempt() {
    simulationAttempt.current = null;
  }
  const [previousTotal, setPreviousTotal] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [noticeId, setNoticeId] = useState(0);
  const announce = useCallback((message: string) => {
    setNotice(message);
    setNoticeId((id) => id + 1);
  }, []);
  function add(product: Product, quantity: number) {
    const current =
      cart.find((item) => item.productId === product.id)?.quantity || 0;
    const max = Math.min(product.stock, product.maxQuantity);
    if (current + quantity > max) {
      announce(
        `Puedes llevar hasta ${max} unidades de ${product.name}. Revisa tu carrito.`,
      );
      return false;
    }
    setCart((items) => [
      ...items.filter((item) => item.productId !== product.id),
      { productId: product.id, quantity: current + quantity },
    ]);
    announce(`Agregaste ${quantity} de ${product.name} al carrito.`);
    return true;
  }
  function setQuantity(productId: string, quantity: number) {
    setCart((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
    announce(`Cantidad actualizada a ${quantity}.`);
  }
  function remove(productId: string) {
    setCart((items) => items.filter((item) => item.productId !== productId));
    announce("Producto eliminado del carrito.");
  }
  function toggleFavorite(product: Product) {
    const active = favorites.includes(product.id);
    setFavorites((ids) =>
      active ? ids.filter((id) => id !== product.id) : [...ids, product.id],
    );
    announce(
      `${product.name}: ${active ? "eliminado de" : "guardado en"} favoritos.`,
    );
  }
  function toggleComparison(product: Product) {
    if (comparison.includes(product.id)) {
      setComparison((ids) => ids.filter((id) => id !== product.id));
      announce("Producto quitado de la comparación.");
      return;
    }
    if (comparison.length >= 3) {
      announce(
        "Puedes comparar hasta tres productos. Quita uno para elegir otro.",
      );
      return;
    }
    setComparison((ids) => [...ids, product.id]);
    announce(`${product.name} añadido a comparación.`);
  }
  return {
    getSimulationKey,
    clearSimulationAttempt,
    previousTotal,
    setPreviousTotal,
    cart,
    setCart,
    favorites,
    setFavorites,
    comparison,
    setComparison,
    delivery,
    setDelivery,
    address,
    setAddress,
    addressReviewed,
    setAddressReviewed,
    result,
    setResult,
    notice,
    noticeId,
    announce,
    add,
    setQuantity,
    remove,
    toggleFavorite,
    toggleComparison,
  };
}
export const ShopContext = createContext<ReturnType<
  typeof useShopState
> | null>(null);
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error("ShopProvider is required");
  return shop;
}

export function useProductSet(ids: string[]) {
  const key = JSON.stringify(ids);
  const [retryCount, retry] = useState(0);
  const requestKey = `${key}:${retryCount}`;
  const [state, setState] = useState<{
    key: string;
    products: Product[];
    missing: string[];
    loading: boolean;
    error?: string;
  }>({ key, products: [], missing: [], loading: ids.length > 0 });
  useEffect(() => {
    const selected: string[] = JSON.parse(key);
    const abort = new AbortController();
    Promise.all(
      selected.map(async (id) => {
        try {
          return await request<Product>(`/products/${encodeURIComponent(id)}`, {
            signal: abort.signal,
          });
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return id;
          throw error;
        }
      }),
    )
      .then((values) => {
        if (!abort.signal.aborted)
          setState({
            key: requestKey,
            products: values.filter(
              (item): item is Product => typeof item !== "string",
            ),
            missing: values.filter(
              (item): item is string => typeof item === "string",
            ),
            loading: false,
          });
      })
      .catch((error) => {
        if (!abort.signal.aborted)
          setState({
            key: requestKey,
            products: [],
            missing: [],
            loading: false,
            error: error.message,
          });
      });
    return () => abort.abort();
  }, [key, requestKey]);
  return {
    products: state.key === requestKey ? state.products : [],
    missing: state.key === requestKey ? state.missing : [],
    error: state.key === requestKey ? state.error : undefined,
    loading: state.key === requestKey ? state.loading : ids.length > 0,
    retry: () => retry((n) => n + 1),
  };
}
