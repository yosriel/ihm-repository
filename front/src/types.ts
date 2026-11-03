export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  previousPrice: number;
  rating: number;
  reviewCount: number;
  capacity: string;
  color: string;
  image: string;
  seller: string;
  sellerType: "falabella" | "marketplace";
  delivery: "both" | "home";
  stock: number;
  maxQuantity: number;
  features: string[];
}
export interface ProductPage {
  items: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface Option {
  value: string;
  label: string;
}
export interface FilterOptions {
  brands: string[];
  capacities: string[];
  colors: string[];
  sellers: Option[];
  deliveryMethods: Option[];
  sortOptions: Option[];
}
export interface CheckoutOptions {
  currency: string;
  homeDelivery: number;
  pickupDelivery: number;
  maxQuantityPerProduct: number;
  districts: string[];
  pickupPoint: { id: string; name: string; address: string };
}
export interface CartItem {
  productId: string;
  quantity: number;
}
export type Delivery = "home" | "pickup";
export interface Address {
  district: string;
  street: string;
  number: string;
  noNumber: boolean;
  reference: string;
}
export interface Quote {
  subtotal: number;
  delivery: number;
  total: number;
  currency: string;
  itemCount: number;
}
export interface Simulation extends Quote {
  simulationId: string;
  deliveryMethod: Delivery;
  simulated: true;
}
export interface SimulationRequest {
  items: CartItem[];
  deliveryMethod: Delivery;
  address?: Address;
  acceptedTerms: true;
}
