import type { ReactNode } from "react";
import { ShopContext, useShopState } from "./shop-state";
export function ShopProvider({ children }: { children: ReactNode }) {
  const shop = useShopState();
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}
