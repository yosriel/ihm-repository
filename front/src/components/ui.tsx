import { money, focusHeading } from "../utils";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "../router";
import { useShop } from "../shop-state";
import type { Product, Quote } from "../types";

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    chevron: <path d="m8 4 8 8-8 8" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    filter: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M8 3v6m8 0v6m-6 0v6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    truck: (
      <>
        <path d="M2 5h12v12H2zM14 9h4l4 4v4h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    store: (
      <>
        <path d="M3 10v11h18V10M2 10l2-7h16l2 7M8 21v-7h8v7" />
        <path d="M2 10c1.7 3 3.3 3 5 0 1.7 3 3.3 3 5 0 1.7 3 3.3 3 5 0 1.7 3 3.3 3 5 0" />
      </>
    ),
    compare: (
      <>
        <path d="M4 5v14h6V5H4ZM14 9v10h6V9h-6" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    plus: <path d="M5 12h14M12 5v14" />,
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C7 2 2 9 6 16c7 5 15-1 14-13Z" />
        <path d="M3 21 16 8" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 tabIndex={-1} data-page-title={title}>
        {title}
      </h1>
      {children && <p className="lead">{children}</p>}
    </div>
  );
}
export function Loading({ text = "Cargando productos…" }: { text?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <h2>No pudimos completar esta acción</h2>
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name="bag" size={36} />
      </div>
      <h2>{title}</h2>
      <p>{children}</p>
      <Link className="button primary" href="/catalogo">
        Explorar freidoras <Icon name="arrow" />
      </Link>
    </div>
  );
}
export function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div
      className={`image-placeholder ${className}`}
      role="img"
      aria-label={`Imagen no disponible de ${product.name}`}
    >
      <Icon name="bag" size={48} />
      <span>Imagen no disponible</span>
    </div>
  ) : (
    <img
      className={className}
      src={product.image}
      alt={`${product.brand}, ${product.name}`}
      onError={() => setFailed(true)}
      loading="lazy"
      width="600"
      height="600"
    />
  );
}
export function Price({ product }: { product: Product }) {
  return (
    <div className="price">
      <span className="current-price">{money(product.price)}</span>
      {product.previousPrice > product.price && (
        <>
          <s>
            <span className="sr-only">Precio anterior </span>
            {money(product.previousPrice)}
          </s>
          <span className="discount">
            −{Math.round((1 - product.price / product.previousPrice) * 100)} %
          </span>
        </>
      )}
    </div>
  );
}
export function Rating({ product }: { product: Product }) {
  return (
    <span className="rating">
      <Icon name="star" size={15} />
      <span>
        {product.rating.toFixed(1)}{" "}
        <span className="muted">({product.reviewCount} opiniones)</span>
      </span>
    </span>
  );
}
export function ProductCard({
  product,
  headingLevel = 2,
}: {
  product: Product;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const shop = useShop();
  const saved = shop.favorites.includes(product.id);
  const compared = shop.comparison.includes(product.id);
  return (
    <article className="product-card">
      <div className="product-visual">
        <ProductImage product={product} />
        <button
          className={`icon-button favorite ${saved ? "selected" : ""}`}
          aria-label={`${saved ? "Quitar de" : "Guardar en"} favoritos: ${product.name}`}
          aria-pressed={saved}
          onClick={() => {
            shop.toggleFavorite(product);
            if (window.location.pathname === "/favoritos") focusHeading();
          }}
        >
          <Icon name="heart" />
        </button>
        {product.delivery === "both" && (
          <span className="product-tag">Retiro disponible</span>
        )}
      </div>
      <div className="product-copy">
        <p className="product-brand">{product.brand}</p>
        <Heading className="product-name">
          <Link href={`/producto/${encodeURIComponent(product.id)}`}>
            {product.name}
          </Link>
        </Heading>
        <p className="seller">
          Vendido por <strong>{product.seller}</strong>
        </p>
        <Rating product={product} />
        <Price product={product} />
        <label className="compare-check">
          <input
            type="checkbox"
            checked={compared}
            onChange={() => shop.toggleComparison(product)}
          />
          <span>
            Comparar<span className="sr-only"> {product.name}</span>
          </span>
        </label>
      </div>
    </article>
  );
}
export function Quantity({
  name,
  value,
  max,
  onChange,
}: {
  name: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="quantity">
      <button
        aria-label={`Disminuir cantidad de ${name}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" size={16} />
      </button>
      <output aria-label={`Cantidad de ${name}`}>{value}</output>
      <button
        aria-label={`Aumentar cantidad de ${name}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  initialId,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  initialId?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const target = initialId
      ? document.getElementById(initialId)
      : dialog.querySelector<HTMLElement>("h2");
    target?.focus();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, [initialId]);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="dialog-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          ),
        ].filter((control) => control.getClientRects().length > 0);
        const first = controls[0],
          last = controls.at(-1);
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement?.tagName === "H2")
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-header">
        <h2 id="dialog-title" tabIndex={-1}>
          {title}
        </h2>
        <button
          className="icon-button"
          aria-label={`Cerrar ${title.toLowerCase()}`}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Steps({ current }: { current: number }) {
  const labels = ["Carrito", "Entrega", "Revisión"];
  return (
    <nav className="steps" aria-label="Pasos de compra">
      <ol>
        {labels.map((label, i) => (
          <li key={label} aria-current={current === i ? "step" : undefined}>
            <span className={`step-number ${current >= i ? "active" : ""}`}>
              {current > i ? <Icon name="check" size={15} /> : i + 1}
            </span>
            {i < current ? (
              <Link href={i === 0 ? "/carrito" : "/entrega"}>{label}</Link>
            ) : (
              <span>{label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Summary({
  subtotal,
  quote,
  children,
}: {
  subtotal: number;
  quote?: Quote;
  children?: ReactNode;
}) {
  return (
    <aside className="summary" aria-label="Resumen de compra">
      <p className="eyebrow">Todo claro, desde el inicio</p>
      <h2>Tu resumen</h2>
      <dl>
        <div>
          <dt>Productos{!quote && " (estimado)"}</dt>
          <dd>{money(quote?.subtotal ?? subtotal)}</dd>
        </div>
        <div>
          <dt>Entrega</dt>
          <dd>{quote ? money(quote.delivery) : "Por confirmar"}</dd>
        </div>
        <div className="summary-total">
          <dt>{quote ? "Total confirmado" : "Subtotal estimado"}</dt>
          <dd>{money(quote?.total ?? subtotal)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
