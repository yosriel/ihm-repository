import { useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "../router";
import { useRemote } from "../services/api";
import { useProductSet, useShop } from "../shop-state";
import type { Product as ProductType } from "../types";
import {
  Empty,
  ErrorState,
  Icon,
  Loading,
  PageTitle,
  Price,
  ProductCard,
  ProductImage,
  Quantity,
  Rating,
} from "../components/ui";
import { money, focusHeading } from "../utils";

export function Product({ id }: { id: string }) {
  const remote = useRemote<ProductType>(`/products/${encodeURIComponent(id)}`);
  const shop = useShop();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (remote.loading)
    return (
      <section className="section">
        <PageTitle title="Tu próxima elección" />
        <Loading text="Cargando el producto…" />
      </section>
    );
  if (remote.error || !remote.data)
    return (
      <section className="section">
        <PageTitle title="Producto no disponible" />
        <ErrorState
          message={remote.error || "No encontramos ese producto."}
          retry={remote.retry}
        />
        <Link className="text-link" href="/catalogo">
          Volver al catálogo
        </Link>
      </section>
    );
  const product = remote.data;
  const max = Math.min(product.stock, product.maxQuantity);
  const inCart = shop.cart.find((item) => item.productId === id)?.quantity || 0;
  const saved = shop.favorites.includes(id);
  return (
    <section className="section">
      <nav className="breadcrumbs" aria-label="Ubicación">
        <Link href="/">Inicio</Link>
        <Icon name="chevron" size={12} />
        <Link href="/catalogo">Freidoras</Link>
        <Icon name="chevron" size={12} />
        <span>{product.brand}</span>
      </nav>
      <div className="product-detail">
        <div className="detail-image">
          <ProductImage product={product} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {product.brand} · {product.capacity}
          </p>
          <h1 tabIndex={-1} data-page-title={product.name}>
            {product.name}
          </h1>
          <Rating product={product} />
          <p className="detail-description">{product.description}</p>
          <Price product={product} />
          <p className="seller">
            Vendido por <strong>{product.seller}</strong>
          </p>
          <details className="seller-details">
            <summary>Sobre este vendedor</summary>
            <p>
              Este producto es vendido por {product.seller}
              {product.sellerType === "marketplace"
                ? ", una tienda del marketplace."
                : "."}{" "}
              Revisa el vendedor y las opciones de entrega antes de continuar.
            </p>
          </details>
          <div className="delivery-hints">
            <p>
              <Icon name="truck" />
              <span>
                <strong>Entrega a domicilio</strong>Revisa el costo al elegir la
                entrega.
              </span>
            </p>
            {product.delivery === "both" && (
              <p>
                <Icon name="store" />
                <span>
                  <strong>Retiro disponible</strong>Consulta las opciones al
                  elegir la entrega.
                </span>
              </p>
            )}
          </div>
          <div className="buy-row">
            <div>
              <p className="label-text">Cantidad</p>
              <Quantity
                name={product.name}
                value={quantity}
                max={max}
                onChange={(value) => {
                  setQuantity(value);
                  setAdded(false);
                }}
              />
            </div>
            <button
              className="button primary"
              disabled={max === 0 || inCart + quantity > max}
              onClick={() => setAdded(shop.add(product, quantity))}
            >
              <Icon name="bag" />{" "}
              {max === 0 ? "No disponible" : "Agregar al carrito"}
            </button>
          </div>
          <p className="small muted">
            Hasta {max} unidades por producto.
            {inCart > 0 && ` Ya tienes ${inCart} en el carrito.`}
          </p>
          {inCart + quantity > max && (
            <p className="field-error">
              Alcanzaste el límite para esta cantidad. Puedes editarla en el
              carrito.
            </p>
          )}
          {(added || inCart > 0) && (
            <div className="added-message">
              <Icon name="check" />
              <div>
                <strong>
                  {added
                    ? "Tu elección ya está en el carrito"
                    : "Este producto está en tu carrito"}
                </strong>
                <div>
                  <Link href="/carrito">Ver carrito</Link>
                  <Link href="/catalogo">Seguir explorando</Link>
                </div>
              </div>
            </div>
          )}
          <div className="detail-secondary">
            <button
              className="text-button"
              aria-pressed={saved}
              onClick={() => shop.toggleFavorite(product)}
            >
              <Icon name="heart" size={18} />
              {saved ? "Guardado en favoritos" : "Guardar en favoritos"}
            </button>
            <label className="compare-check">
              <input
                type="checkbox"
                checked={shop.comparison.includes(id)}
                onChange={() => shop.toggleComparison(product)}
              />
              Comparar este producto
            </label>
          </div>
        </div>
      </div>
      <section className="features-section">
        <div>
          <p className="eyebrow">CONÓCELA MEJOR</p>
          <h2>
            Detalles que hacen
            <br />
            la diferencia.
          </h2>
        </div>
        <ul>
          {product.features.map((feature) => (
            <li key={feature}>
              <Icon name="check" size={18} />
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
export function Favorites() {
  const shop = useShop();
  const data = useProductSet(shop.favorites);
  return (
    <section className="section">
      <PageTitle eyebrow="TUS ELEGIDAS" title="Un lugar para tus favoritas">
        Guárdalas aquí y vuelve a mirarlas con calma. Se conservan en este
        navegador.
      </PageTitle>
      {data.loading ? (
        <Loading />
      ) : data.error ? (
        <ErrorState message={data.error} retry={data.retry} />
      ) : (
        <>
          {data.missing.map((id) => (
            <div className="missing-product" key={id}>
              <p>Un producto guardado ya no está disponible.</p>
              <button
                className="text-button"
                onClick={() => {
                  shop.setFavorites((ids) =>
                    ids.filter((value) => value !== id),
                  );
                  focusHeading();
                }}
              >
                Quitar producto no disponible
              </button>
            </div>
          ))}
          {data.products.length ? (
            <div className="product-grid">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            !data.missing.length && (
              <Empty title="Todavía no tienes favoritas">
                Usa el corazón de cada producto para guardarlo aquí.
              </Empty>
            )
          )}
        </>
      )}
    </section>
  );
}
export function Compare() {
  const shop = useShop();
  const data = useProductSet(shop.comparison);
  return (
    <section className="section">
      <PageTitle eyebrow="ELIGE CON CALMA" title="Compara lo que importa">
        Hasta tres freidoras, con sus diferencias a la vista.
      </PageTitle>
      {data.loading ? (
        <Loading />
      ) : data.error ? (
        <ErrorState message={data.error} retry={data.retry} />
      ) : data.products.length ? (
        <>
          {data.products.length === 1 && (
            <p className="info-message">
              Tienes un producto.{" "}
              <Link href="/catalogo">Elige otro en el catálogo</Link> para
              compararlos.
            </p>
          )}
          <div
            className="comparison-grid"
            style={{ "--columns": data.products.length } as CSSProperties}
          >
            {data.products.map((product) => (
              <article className="comparison-card" key={product.id}>
                <ProductImage product={product} />
                <p className="product-brand">{product.brand}</p>
                <h2>
                  <Link href={`/producto/${product.id}`}>{product.name}</Link>
                </h2>
                <dl>
                  {[
                    ["Precio", money(product.price)],
                    ["Capacidad", product.capacity],
                    ["Vendedor", product.seller],
                    [
                      "Calificación",
                      `${product.rating} de 5 · ${product.reviewCount} opiniones`,
                    ],
                    [
                      "Entrega",
                      product.delivery === "both"
                        ? "Domicilio y retiro"
                        : "Solo domicilio",
                    ],
                    [
                      "Disponibilidad",
                      product.stock > 0 ? "Disponible" : "Sin stock",
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  className="button primary"
                  href={`/producto/${product.id}`}
                >
                  Ver producto <Icon name="arrow" size={17} />
                </Link>
                <button
                  className="text-button"
                  onClick={() => {
                    shop.toggleComparison(product);
                    focusHeading();
                  }}
                >
                  Quitar de comparación
                  <span className="sr-only"> {product.name}</span>
                </button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <Empty title="Tus opciones, lado a lado">
          Selecciona “Comparar” en los productos que te interesen.
        </Empty>
      )}
    </section>
  );
}
