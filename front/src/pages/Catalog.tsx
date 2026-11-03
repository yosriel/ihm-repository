import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "../router";
import { navigate, useLocation } from "../navigation";
import { useRemote } from "../services/api";
import { useShop } from "../shop-state";
import type { FilterOptions, ProductPage } from "../types";
import {
  ErrorState,
  Icon,
  Loading,
  Modal,
  PageTitle,
  ProductCard,
} from "../components/ui";

export function Home() {
  const products = useRemote<ProductPage>("/products?size=4");
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span /> MENOS VUELTAS. MÁS DISFRUTAR.
          </span>
          <h1 tabIndex={-1} data-page-title="Tu cocina, a tu manera.">
            Tu cocina,
            <br />a tu <em>manera.</em>
          </h1>
          <p>
            Encuentra la freidora que va contigo.
            <br />
            Compara con calma y elige cómo recibirla.
          </p>
          <Link className="button lime" href="/catalogo">
            Explorar freidoras <Icon name="arrow" />
          </Link>
          <div className="hero-caption">
            <Icon name="leaf" size={19} />
            <span>Una elección más simple, de principio a fin.</span>
          </div>
        </div>
        <div className="hero-photo">
          <img
            src="/images/kitchen.jpg"
            alt="Freidora de aire en una cocina junto a platos preparados"
            width="1100"
            height="1100"
          />
          <div className="photo-caption">
            <span>PEQUEÑOS CAMBIOS</span>
            <strong>
              Grandes momentos
              <br />
              en tu cocina.
            </strong>
          </div>
          <span className="hero-index" aria-hidden="true">
            01 / COCINA
          </span>
        </div>
      </section>
      <section className="benefits" aria-label="Una compra más clara">
        <div>
          <Icon name="search" />
          <p>
            <strong>Encuentra sin complicarte</strong>
            <span>Filtros claros para elegir mejor.</span>
          </p>
        </div>
        <div>
          <Icon name="compare" />
          <p>
            <strong>Compara lo que importa</strong>
            <span>Precio, capacidad y vendedor.</span>
          </p>
        </div>
        <div>
          <Icon name="truck" />
          <p>
            <strong>Tú eliges cómo recibirlo</strong>
            <span>Domicilio o retiro, con costos visibles.</span>
          </p>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ENCUENTRA TU FAVORITA</p>
            <h2>Más posibilidades en tu cocina</h2>
          </div>
          <Link className="text-link" href="/catalogo">
            Ver todas <Icon name="arrow" size={18} />
          </Link>
        </div>
        {products.loading ? (
          <Loading />
        ) : products.error ? (
          <ErrorState message={products.error} retry={products.retry} />
        ) : (
          <div className="product-grid">
            {products.data?.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                headingLevel={3}
              />
            ))}
          </div>
        )}
      </section>
      <section className="editorial-strip">
        <p className="eyebrow">ELIGE CON INFORMACIÓN</p>
        <h2>
          El precio es solo
          <br />
          una parte de la decisión.
        </h2>
        <p>
          Revisa quién vende, la capacidad y las opciones de entrega. Todo lo
          que necesitas para comparar, en un mismo lugar.
        </p>
        <Link className="text-link" href="/catalogo">
          Encuentra la tuya <Icon name="arrow" size={18} />
        </Link>
      </section>
    </>
  );
}
const filterNames: Record<string, string> = {
  minPrice: "Desde",
  maxPrice: "Hasta",
  brand: "Marca",
  minDiscount: "Descuento",
  minRating: "Calificación",
  delivery: "Entrega",
  seller: "Vendedor",
  capacity: "Capacidad",
  color: "Color",
};
function chipValue(key: string, value: string, options?: FilterOptions) {
  if (key.includes("Price")) return `S/ ${value}`;
  if (key === "delivery")
    return (
      options?.deliveryMethods.find((option) => option.value === value)
        ?.label || value
    );
  if (key === "seller")
    return (
      options?.sellers.find((option) => option.value === value)?.label || value
    );
  if (key === "minDiscount") return `${value} % o más`;
  if (key === "minRating") return `${value} estrellas o más`;
  return value;
}
function Filters({
  params,
  options,
  onClose,
}: {
  params: URLSearchParams;
  options: FilterOptions;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => Object.fromEntries(params));
  const [error, setError] = useState("");
  function update(key: string, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
  }
  function apply(event: FormEvent) {
    event.preventDefault();
    if (
      draft.minPrice &&
      draft.maxPrice &&
      Number(draft.minPrice) > Number(draft.maxPrice)
    ) {
      setError("El precio mínimo no puede superar el máximo.");
      document.getElementById("filter-minPrice")?.focus();
      return;
    }
    const next = new URLSearchParams();
    Object.entries(draft).forEach(([key, value]) => {
      if (value && key !== "page") next.set(key, value);
    });
    onClose();
    navigate(`/catalogo?${next}`);
  }
  function select(
    key: string,
    label: string,
    values: { value: string; label: string }[],
  ) {
    return (
      <div className="field">
        <label htmlFor={`filter-${key}`}>{label}</label>
        <select
          id={`filter-${key}`}
          value={draft[key] || ""}
          onChange={(event) => update(key, event.target.value)}
        >
          <option value="">Todas las opciones</option>
          {values.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <Modal title="Filtrar productos" onClose={onClose}>
      <form onSubmit={apply}>
        <p className="muted modal-intro">
          Combina los filtros y encuentra lo que necesitas. Los cambios se
          aplican al confirmar.
        </p>
        <fieldset>
          <legend>Precio en soles</legend>
          <div className="field-grid">
            {["minPrice", "maxPrice"].map((key) => (
              <div className="field" key={key}>
                <label htmlFor={`filter-${key}`}>
                  {key === "minPrice" ? "Precio mínimo" : "Precio máximo"}
                </label>
                <input
                  id={`filter-${key}`}
                  type="number"
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  inputMode="decimal"
                  value={draft[key] || ""}
                  onChange={(event) => update(key, event.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "price-error" : undefined}
                  placeholder={key === "maxPrice" ? "Ej. 400" : "Ej. 0"}
                />
              </div>
            ))}
          </div>
          {error && (
            <p className="field-error" id="price-error" role="alert">
              {error}
            </p>
          )}
        </fieldset>
        <div className="field-grid">
          {select(
            "brand",
            "Marca",
            options.brands.map((value) => ({ value, label: value })),
          )}
          {select(
            "minDiscount",
            "Descuento mínimo",
            [10, 20, 30, 40].map((value) => ({
              value: String(value),
              label: `${value} % o más`,
            })),
          )}
          {select(
            "minRating",
            "Calificación mínima",
            [3, 4, 4.5].map((value) => ({
              value: String(value),
              label: `${value} estrellas o más`,
            })),
          )}
          {select("delivery", "Tipo de entrega", options.deliveryMethods)}
          {select("seller", "Vendedor", options.sellers)}
          {select(
            "capacity",
            "Capacidad",
            options.capacities.map((value) => ({ value, label: value })),
          )}
          {select(
            "color",
            "Color",
            options.colors.map((value) => ({ value, label: value })),
          )}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="text-button"
            onClick={() =>
              setDraft((current) => ({
                q: current.q || "",
                sort: current.sort || "",
              }))
            }
          >
            Restablecer
          </button>
          <button type="button" className="button secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit">
            Aplicar filtros
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function Catalog() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const [filterOpen, setFilterOpen] = useState(false);
  const options = useRemote<FilterOptions>("/catalog/filters");
  const products = useRemote<ProductPage>(`/products?${params}`);
  const { announce } = useShop();
  useEffect(() => {
    if (products.data)
      announce(`${products.data.totalElements} productos encontrados.`);
  }, [products.data, announce]);
  function change(key: string, value: string) {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    navigate(`/catalogo?${next}`);
  }
  function clear() {
    const next = new URLSearchParams();
    if (params.get("q")) next.set("q", params.get("q")!);
    navigate(`/catalogo?${next}`);
  }
  const active = [...params].filter(
    ([key, value]) => filterNames[key] && value,
  );
  const page = products.data?.page || 0;
  return (
    <section className="section catalog-section">
      <nav className="breadcrumbs" aria-label="Ubicación">
        <Link href="/">Inicio</Link>
        <Icon name="chevron" size={12} />
        <span>Freidoras de aire</span>
      </nav>
      <PageTitle
        eyebrow="MÁS SABOR, MENOS COMPLICACIONES"
        title={
          params.get("q")
            ? `Resultados para “${params.get("q")}”`
            : "Encuentra tu próxima freidora"
        }
      >
        Elige la capacidad, el precio y la entrega que van contigo.
      </PageTitle>
      <div className="catalog-tools">
        <div className="filter-buttons">
          {[
            "Precio",
            "Marca",
            "Descuento",
            "Calificación",
            "Entrega",
            "Vendedor",
            "Más filtros",
          ].map((label, index) => (
            <button
              className="filter-button"
              key={label}
              onClick={() => setFilterOpen(true)}
              disabled={!options.data}
              aria-haspopup="dialog"
            >
              {index === 0 && <Icon name="filter" size={17} />}
              <span>{label}</span>
              <span aria-hidden="true">+</span>
            </button>
          ))}
        </div>
        <div className="sort">
          <label htmlFor="sort">Ordenar por</label>
          <select
            id="sort"
            value={params.get("sort") || "recommended"}
            onChange={(event) => change("sort", event.target.value)}
            disabled={!options.data}
          >
            {(
              options.data?.sortOptions || [
                { value: "recommended", label: "Recomendados" },
              ]
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {options.error && (
        <ErrorState message={options.error} retry={options.retry} />
      )}
      <div className="results-bar">
        <p>
          {products.loading
            ? "Buscando productos…"
            : `${products.data?.totalElements ?? 0} productos`}
        </p>
        {active.length > 0 && (
          <div className="chips">
            {active.map(([key, value]) => (
              <button
                key={key}
                aria-label={`Quitar filtro ${filterNames[key]} ${chipValue(key, value, options.data)}`}
                onClick={() => change(key, "")}
              >
                {filterNames[key]}: {chipValue(key, value, options.data)}
                <Icon name="close" size={13} />
              </button>
            ))}
            <button className="clear-filters" onClick={clear}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
      {products.loading ? (
        <Loading />
      ) : products.error ? (
        <ErrorState message={products.error} retry={products.retry} />
      ) : products.data?.items.length ? (
        <>
          <div className="product-grid">
            {products.data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.data.totalPages > 1 && (
            <nav className="pagination" aria-label="Páginas de resultados">
              <button
                className="button secondary"
                disabled={page === 0}
                onClick={() => change("page", String(page - 1))}
              >
                Anterior
              </button>
              <span>
                Página {page + 1} de {products.data.totalPages}
              </span>
              <button
                className="button secondary"
                disabled={page + 1 >= products.data.totalPages}
                onClick={() => change("page", String(page + 1))}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={36} />
          <h2>No encontramos coincidencias</h2>
          <p>Prueba otro término o quita un filtro para ver más opciones.</p>
          <button
            className="button primary"
            onClick={() => navigate("/catalogo")}
          >
            Ver todo el catálogo
          </button>
        </div>
      )}
      {filterOpen && options.data && (
        <Filters
          params={params}
          options={options.data}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </section>
  );
}
