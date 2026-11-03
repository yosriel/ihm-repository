import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "./router";
import { navigate, useLocation } from "./navigation";
import { ShopProvider } from "./store";
import { useShop } from "./shop-state";
import { Icon, PageTitle, Empty } from "./components/ui";
import { Home, Catalog } from "./pages/Catalog";
import { Product, Favorites, Compare } from "./pages/Product";
import { Cart, DeliveryPage, ReviewPage, Confirmation } from "./pages/Checkout";
import "./App.css";

function Header() {
  const { pathname, search } = useLocation();
  const [term, setTerm] = useState(
    () => new URLSearchParams(search).get("q") || "",
  );
  const shop = useShop();
  const count = shop.cart.reduce((sum, item) => sum + item.quantity, 0);
  function submit(event: FormEvent) {
    event.preventDefault();
    navigate(
      term.trim()
        ? `/catalogo?q=${encodeURIComponent(term.trim())}`
        : "/catalogo",
    );
  }
  return (
    <>
      <div className="announcement">
        <span>Una forma más simple de elegir.</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="falabella., inicio">
            falabella<span>.</span>
          </Link>
          <form className="header-search" role="search" onSubmit={submit}>
            <label className="sr-only" htmlFor="site-search">
              Buscar productos
            </label>
            <input
              id="site-search"
              type="search"
              maxLength={120}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="¿Qué estás buscando para tu cocina?"
            />
            <button type="submit" aria-label="Buscar">
              <Icon name="search" size={20} />
            </button>
          </form>
          <nav className="header-actions" aria-label="Navegación principal">
            <Link
              href="/favoritos"
              className="header-action"
              aria-label={`Favoritos ${shop.favorites.length}, productos guardados`}
              aria-current={pathname === "/favoritos" ? "page" : undefined}
            >
              <Icon name="heart" />
              <span>Favoritos</span>{" "}
              {shop.favorites.length > 0 && (
                <b className="count">{shop.favorites.length}</b>
              )}
            </Link>
            <Link
              href="/carrito"
              className="header-action"
              aria-label={`Mi carrito ${count}, unidades`}
              aria-current={pathname === "/carrito" ? "page" : undefined}
            >
              <Icon name="bag" />
              <span>Mi carrito</span> <b className="count">{count}</b>
            </Link>
          </nav>
        </div>
        <nav className="category-nav" aria-label="Explorar">
          <Link
            href="/catalogo"
            aria-current={pathname === "/catalogo" ? "page" : undefined}
          >
            Freidoras de aire
          </Link>
          <Link href="/catalogo?maxPrice=400">Hasta S/ 400</Link>
          <Link href="/catalogo?delivery=pickup">Con opción de retiro</Link>
          <Link
            href="/comparar"
            aria-current={pathname === "/comparar" ? "page" : undefined}
          >
            <Icon name="compare" size={16} />
            Comparar
            {shop.comparison.length > 0 && ` (${shop.comparison.length}/3)`}
          </Link>
        </nav>
      </header>
    </>
  );
}
function Layout() {
  const location = useLocation();
  const shop = useShop();
  const [dismissedNotice, setDismissedNotice] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
    let previousHeading: HTMLElement | null = null;
    function updateHeading(initial = false) {
      const heading = document.querySelector<HTMLElement>("main h1");
      if (!heading) return;
      document.title = `${heading.dataset.pageTitle || "Tu cocina, a tu manera"} | Falabella`;
      if (
        initial ||
        (heading !== previousHeading &&
          document.activeElement === document.body)
      )
        heading.focus({ preventScroll: true });
      previousHeading = heading;
    }
    const frame = requestAnimationFrame(() => updateHeading(true));
    const observer = new MutationObserver(() => updateHeading());
    const main = document.getElementById("main-content");
    if (main)
      observer.observe(main, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [location.pathname]);
  useEffect(() => {
    if (shop.notice) {
      const timeout = setTimeout(() => setDismissedNotice(shop.noticeId), 6500);
      return () => clearTimeout(timeout);
    }
  }, [shop.notice, shop.noticeId]);
  const path = location.pathname.replace(/\/$/, "") || "/";
  let page;
  if (path === "/") page = <Home />;
  else if (path === "/catalogo") page = <Catalog />;
  else if (path.startsWith("/producto/")) {
    let id = "";
    try {
      id = decodeURIComponent(path.slice(10));
    } catch {
      /* Invalid route is handled as an unavailable product. */
    }
    page = <Product key={id} id={id} />;
  } else if (path === "/favoritos") page = <Favorites />;
  else if (path === "/comparar") page = <Compare />;
  else if (path === "/carrito") page = <Cart />;
  else if (path === "/entrega") page = <DeliveryPage />;
  else if (path === "/resumen") page = <ReviewPage />;
  else if (path === "/confirmacion") page = <Confirmation />;
  else
    page = (
      <section className="section">
        <PageTitle title="No encontramos esta página" />
        <Empty title="Sigamos por aquí">
          Vuelve al catálogo para continuar explorando.
        </Empty>
      </section>
    );
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>
      <Header key={location.search} />
      <main id="main-content" tabIndex={-1}>
        {page}
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <Link className="brand footer-brand" href="/">
            falabella<span>.</span>
          </Link>
          <p>
            Elegir mejor empieza
            <br />
            por tenerlo más claro.
          </p>
          <Link href="/catalogo">
            Explora el catálogo <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="footer-bottom">
          <p>Tu cocina, a tu manera.</p>
          <p>Precios expresados en soles (S/).</p>
        </div>
      </footer>
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span key={shop.noticeId}>{shop.notice}</span>
      </div>
      {shop.noticeId !== dismissedNotice && shop.notice && (
        <div className="toast">
          <Icon name="check" size={18} />
          <p>{shop.notice}</p>
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setDismissedNotice(shop.noticeId)}
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
      {shop.comparison.length > 0 &&
        !["/comparar", "/entrega", "/resumen", "/confirmacion"].includes(
          path,
        ) && (
          <div className="comparison-bar">
            <Icon name="compare" />
            <p>
              <strong>{shop.comparison.length} de 3</strong>
              <span> productos para comparar</span>
            </p>
            <Link className="button primary" href="/comparar">
              Comparar
              <Icon name="arrow" size={17} />
            </Link>
            <button
              className="icon-button"
              aria-label="Vaciar comparación"
              onClick={() => {
                shop.setComparison([]);
                shop.announce("Comparación vaciada.");
              }}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
    </>
  );
}
export default function App() {
  return (
    <ShopProvider>
      <Layout />
    </ShopProvider>
  );
}
