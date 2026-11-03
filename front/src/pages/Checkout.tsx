import { validateAddress } from "../validation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "../router";
import { navigate } from "../navigation";
import { ApiError, request, useRemote } from "../services/api";
import { useProductSet, useShop } from "../shop-state";
import type {
  Address,
  CheckoutOptions,
  Delivery,
  Product,
  Quote,
  Simulation,
  SimulationRequest,
} from "../types";
import {
  Empty,
  ErrorState,
  Icon,
  Loading,
  Modal,
  PageTitle,
  ProductImage,
  Quantity,
  Steps,
  Summary,
} from "../components/ui";
import { focusHeading, money } from "../utils";

function subtotal(
  products: Product[],
  items: { productId: string; quantity: number }[],
) {
  return products.reduce(
    (sum, product) =>
      sum +
      product.price *
        (items.find((item) => item.productId === product.id)?.quantity || 0),
    0,
  );
}
function cartInvalid(
  products: Product[],
  items: { productId: string; quantity: number }[],
) {
  return products.some(
    (product) =>
      (items.find((item) => item.productId === product.id)?.quantity || 0) >
      Math.min(product.stock, product.maxQuantity),
  );
}
function CheckoutGuard({
  children,
  current,
}: {
  children: ReactNode;
  current: number;
}) {
  const shop = useShop();
  if (!shop.cart.length)
    return (
      <section className="section">
        <Steps current={current} />
        <PageTitle title="Tu carrito está vacío" />
        <Empty title="Comienza con una buena elección">
          Agrega un producto antes de continuar con la entrega.
        </Empty>
      </section>
    );
  return children;
}
export function Cart() {
  const shop = useShop();
  const data = useProductSet(shop.cart.map((item) => item.productId));
  const invalid = cartInvalid(data.products, shop.cart);
  return (
    <section className="section">
      <Steps current={0} />
      <PageTitle eyebrow="CADA ELECCIÓN CUENTA" title="Tu carrito">
        Revisa tus productos antes de elegir cómo recibirlos.
      </PageTitle>
      {!shop.cart.length ? (
        <Empty title="Tu carrito tiene espacio para algo bueno">
          Explora nuestras freidoras y encuentra la que va contigo.
        </Empty>
      ) : data.loading ? (
        <Loading text="Actualizando precios y disponibilidad…" />
      ) : data.error ? (
        <ErrorState message={data.error} retry={data.retry} />
      ) : (
        <div className="checkout-layout">
          <div>
            <div className="cart-list">
              {data.products.map((product) => {
                const quantity = shop.cart.find(
                  (item) => item.productId === product.id,
                )!.quantity;
                const max = Math.min(product.stock, product.maxQuantity);
                return (
                  <article className="cart-line" key={product.id}>
                    <div className="cart-image">
                      <ProductImage product={product} />
                    </div>
                    <div className="cart-product">
                      <p className="product-brand">{product.brand}</p>
                      <h2>
                        <Link href={`/producto/${product.id}`}>
                          {product.name}
                        </Link>
                      </h2>
                      <p className="seller">
                        Vendido por <strong>{product.seller}</strong>
                      </p>
                      <p className="small muted">
                        {money(product.price)} por unidad
                      </p>
                      <div className="cart-controls">
                        <Quantity
                          name={product.name}
                          value={quantity}
                          max={max}
                          onChange={(value) =>
                            shop.setQuantity(product.id, value)
                          }
                        />
                        <button
                          className="text-button remove"
                          onClick={() => {
                            shop.remove(product.id);
                            focusHeading();
                          }}
                        >
                          <Icon name="trash" size={17} />
                          Eliminar
                          <span className="sr-only"> {product.name}</span>
                        </button>
                      </div>
                      {quantity > max && (
                        <p className="field-error">
                          {max
                            ? `La disponibilidad cambió. Reduce la cantidad a ${max} o elimina el producto.`
                            : "Este producto ya no está disponible. Elimínalo para continuar."}
                        </p>
                      )}
                    </div>
                    <strong className="line-total">
                      {money(product.price * quantity)}
                    </strong>
                  </article>
                );
              })}
              {data.missing.map((id) => (
                <div className="missing-product" key={id}>
                  <p>Uno de tus productos ya no está disponible.</p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      shop.remove(id);
                      focusHeading();
                    }}
                  >
                    Eliminar producto no disponible
                  </button>
                </div>
              ))}
            </div>
            <Link className="text-link continue-shopping" href="/catalogo">
              <span aria-hidden="true">←</span> Seguir explorando
            </Link>
          </div>
          <Summary subtotal={subtotal(data.products, shop.cart)}>
            {invalid || data.missing.length ? (
              <p className="field-error">
                Revisa la disponibilidad de los productos para continuar.
              </p>
            ) : (
              <Link className="button primary" href="/entrega">
                Continuar con la entrega <Icon name="arrow" size={18} />
              </Link>
            )}
            <p className="small muted">
              El costo de entrega se confirma en el siguiente paso.
            </p>
          </Summary>
        </div>
      )}
    </section>
  );
}
export function DeliveryPage() {
  return (
    <CheckoutGuard current={1}>
      <DeliveryForm />
    </CheckoutGuard>
  );
}
function DeliveryForm() {
  const shop = useShop();
  const options = useRemote<CheckoutOptions>("/checkout/options");
  const products = useProductSet(shop.cart.map((item) => item.productId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const pickupAllowed = products.products.every(
    (product) => product.delivery === "both",
  );
  function change<K extends keyof Address>(key: K, value: Address[K]) {
    const next = { ...shop.address, [key]: value };
    if (key === "noNumber" && value) next.number = "";
    shop.setAddress(next);
    shop.setAddressReviewed(false);
    if (attempted && options.data)
      setErrors(validateAddress(next, options.data.districts));
  }
  function validateField(key: string) {
    if (options.data) {
      const next = validateAddress(shop.address, options.data.districts);
      setErrors((current) => ({ ...current, [key]: next[key] || "" }));
    }
  }
  function review(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (
      !options.data ||
      products.loading ||
      products.error ||
      products.missing.length ||
      cartInvalid(products.products, shop.cart)
    )
      return;
    if (shop.delivery === "pickup") {
      if (pickupAllowed) navigate("/resumen");
      return;
    }
    const found = validateAddress(shop.address, options.data.districts);
    setErrors(found);
    if (Object.keys(found).length)
      requestAnimationFrame(() => errorRef.current?.focus());
    else setReviewOpen(true);
  }
  function mode(value: Delivery) {
    shop.setDelivery(value);
    shop.setAddressReviewed(false);
    setErrors({});
    setAttempted(false);
  }
  if (options.loading || products.loading)
    return (
      <section className="section">
        <Steps current={1} />
        <PageTitle title="Elige cómo recibirlo" />
        <Loading text="Cargando opciones de entrega…" />
      </section>
    );
  if (options.error || products.error)
    return (
      <section className="section">
        <Steps current={1} />
        <PageTitle title="Elige cómo recibirlo" />
        <ErrorState
          message={options.error || products.error!}
          retry={() => {
            options.retry();
            products.retry();
          }}
        />
      </section>
    );
  if (!options.data) return null;
  const config = options.data;
  const invalidCart =
    products.missing.length > 0 || cartInvalid(products.products, shop.cart);
  function field(
    key: "street" | "number" | "reference",
    label: string,
    help?: string,
  ) {
    return (
      <div className="field">
        <label htmlFor={`address-${key}`}>{label}</label>
        <input
          id={`address-${key}`}
          autoComplete={key === "street" ? "address-line1" : "off"}
          value={shop.address[key]}
          onChange={(event) => change(key, event.target.value)}
          onBlur={() => validateField(key)}
          disabled={key === "number" && shop.address.noNumber}
          maxLength={key === "street" ? 160 : key === "number" ? 6 : 200}
          inputMode={key === "number" ? "numeric" : "text"}
          aria-required={
            key !== "reference" && !(key === "number" && shop.address.noNumber)
          }
          aria-invalid={!!errors[key]}
          aria-describedby={
            `${help ? `address-${key}-help ` : ""}${errors[key] ? `address-${key}-error` : ""}`.trim() ||
            undefined
          }
        />
        {help && (
          <p className="field-help" id={`address-${key}-help`}>
            {help}
          </p>
        )}
        {errors[key] && (
          <p className="field-error" id={`address-${key}-error`}>
            {errors[key]}
          </p>
        )}
      </div>
    );
  }
  return (
    <section className="section">
      <Steps current={1} />
      <PageTitle eyebrow="A TU RITMO, A TU MANERA" title="Elige cómo recibirlo">
        Las opciones y sus costos, antes de finalizar.
      </PageTitle>
      <div className="checkout-layout">
        <form noValidate onSubmit={review} className="delivery-form">
          <fieldset className="delivery-options">
            <legend>Modalidad de entrega</legend>
            <label
              className={`delivery-option ${shop.delivery === "home" ? "chosen" : ""}`}
            >
              <input
                type="radio"
                name="delivery"
                value="home"
                checked={shop.delivery === "home"}
                onChange={() => mode("home")}
              />
              <Icon name="truck" size={27} />
              <span>
                <strong>Entrega a domicilio</strong>
                <span>En los distritos disponibles de Lima.</span>
              </span>
              <b>{money(config.homeDelivery)}</b>
            </label>
            <label
              className={`delivery-option ${shop.delivery === "pickup" ? "chosen" : ""} ${!pickupAllowed ? "unavailable" : ""}`}
            >
              <input
                type="radio"
                name="delivery"
                value="pickup"
                checked={shop.delivery === "pickup"}
                disabled={!pickupAllowed}
                onChange={() => mode("pickup")}
                aria-describedby={
                  !pickupAllowed ? "pickup-disabled" : undefined
                }
              />
              <Icon name="store" size={27} />
              <span>
                <strong>Retiro</strong>
                <span>Consulta la ubicación de retiro.</span>
              </span>
              <b>{money(config.pickupDelivery)}</b>
            </label>
            {!pickupAllowed && (
              <p className="field-help" id="pickup-disabled">
                Este carrito incluye un producto con entrega solo a domicilio.
                Selecciona domicilio para continuar.
              </p>
            )}
          </fieldset>
          {shop.delivery === "home" ? (
            <section className="address-form" aria-labelledby="address-title">
              <h2 id="address-title">¿A qué dirección?</h2>
              <p className="muted">
                Los campos son obligatorios salvo la referencia.
              </p>
              {Object.values(errors).some(Boolean) && attempted && (
                <div
                  className="error-summary"
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                >
                  <h3>Revisa estos datos para continuar</h3>
                  <ul>
                    {Object.entries(errors)
                      .filter(([, message]) => message)
                      .map(([key, message]) => (
                        <li key={key}>
                          <a
                            href={`#address-${key}`}
                            onClick={() =>
                              document.getElementById(`address-${key}`)?.focus()
                            }
                          >
                            {message}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <div className="field">
                <label htmlFor="address-district">Distrito</label>
                <select
                  id="address-district"
                  autoComplete="address-level2"
                  value={shop.address.district}
                  onChange={(event) => change("district", event.target.value)}
                  onBlur={() => validateField("district")}
                  aria-required="true"
                  aria-invalid={!!errors.district}
                  aria-describedby={
                    errors.district ? "address-district-error" : undefined
                  }
                >
                  <option value="">Selecciona tu distrito</option>
                  {config.districts.map((district) => (
                    <option key={district}>{district}</option>
                  ))}
                </select>
                {errors.district && (
                  <p id="address-district-error" className="field-error">
                    {errors.district}
                  </p>
                )}
              </div>
              {field(
                "street",
                "Calle, avenida o jirón",
                "Escribe el nombre completo, con al menos cinco letras.",
              )}
              <div className="address-number">
                {field("number", "Número")}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={shop.address.noNumber}
                    onChange={(event) =>
                      change("noNumber", event.target.checked)
                    }
                  />
                  Dirección sin número
                </label>
              </div>
              {field(
                "reference",
                "Referencia (opcional)",
                "Máximo 200 caracteres.",
              )}
              <p className="field-help">
                Revisa el distrito y la dirección antes de continuar.
              </p>
            </section>
          ) : (
            <section className="pickup-detail">
              <Icon name="store" size={32} />
              <h2>Punto de retiro</h2>
              <p>{config.pickupPoint.address.split("·")[0].trim()}</p>
              <p className="field-help">
                Revisa la ubicación y el costo antes de continuar.
              </p>
            </section>
          )}
          {invalidCart && (
            <p className="field-error">
              Cambió la disponibilidad.{" "}
              <Link href="/carrito">Revisa tu carrito</Link> antes de continuar.
            </p>
          )}
          {shop.delivery === "pickup" && !pickupAllowed && (
            <p className="field-error">
              Selecciona entrega a domicilio para este carrito.
            </p>
          )}
          <div className="form-actions">
            <Link className="text-link" href="/carrito">
              Volver al carrito
            </Link>
            <button
              className="button primary"
              type="submit"
              disabled={
                invalidCart || (shop.delivery === "pickup" && !pickupAllowed)
              }
            >
              {shop.delivery === "home"
                ? "Revisar dirección"
                : "Continuar a revisión"}
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </form>
        <Summary subtotal={subtotal(products.products, shop.cart)}>
          <p className="small muted">
            Entrega elegida:{" "}
            {money(
              shop.delivery === "home"
                ? config.homeDelivery
                : config.pickupDelivery,
            )}
            . Confirmaremos el total en la revisión.
          </p>
        </Summary>
      </div>
      {reviewOpen && (
        <Modal title="Revisa tu dirección" onClose={() => setReviewOpen(false)}>
          <p className="muted modal-intro">
            Confirma que estos son los datos de tu dirección de entrega.
          </p>
          <div className="address-preview">
            <strong>
              {shop.address.street}{" "}
              {shop.address.noNumber ? "s/n" : shop.address.number}
            </strong>
            <p>{shop.address.district}, Lima</p>
            {shop.address.reference && (
              <p>Referencia: {shop.address.reference}</p>
            )}
          </div>
          <p className="field-help">
            Puedes volver a editar la dirección si necesitas cambiar algún dato.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setReviewOpen(false)}
            >
              Editar dirección
            </button>
            <button
              className="button primary"
              onClick={() => {
                shop.setAddressReviewed(true);
                setReviewOpen(false);
                navigate("/resumen");
              }}
            >
              Usar esta dirección
              <Icon name="arrow" size={17} />
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
function isQuote(value: Quote, count: number) {
  return (
    value &&
    [value.subtotal, value.delivery, value.total].every(
      (amount) => Number.isFinite(amount) && amount >= 0,
    ) &&
    Math.abs(value.total - value.subtotal - value.delivery) < 0.011 &&
    value.currency === "PEN" &&
    value.itemCount === count
  );
}
export function ReviewPage() {
  return (
    <CheckoutGuard current={2}>
      <Review />
    </CheckoutGuard>
  );
}
function Review() {
  const shop = useShop();
  const products = useProductSet(shop.cart.map((item) => item.productId));
  const options = useRemote<CheckoutOptions>("/checkout/options");
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [quoteVersion, retryQuote] = useState(0);
  const quoteBody = JSON.stringify({
    items: shop.cart,
    deliveryMethod: shop.delivery,
  });
  const quoteKey = `${quoteBody}:${quoteVersion}`;
  const [quoteState, setQuoteState] = useState<{
    key: string;
    data?: Quote;
    error?: string;
  }>({ key: "" });
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    const count = (
      JSON.parse(quoteBody).items as { quantity: number }[]
    ).reduce((sum, item) => sum + item.quantity, 0);
    request<Quote>("/checkout/quote", {
      method: "POST",
      body: quoteBody,
      signal: abort.signal,
    })
      .then((data) => {
        if (!isQuote(data, count))
          throw new Error(
            "El total recibido no es válido. Vuelve a consultarlo.",
          );
        if (!abort.signal.aborted) setQuoteState({ key: quoteKey, data });
      })
      .catch((error) => {
        if (!abort.signal.aborted)
          setQuoteState({ key: quoteKey, error: error.message });
      });
    return () => abort.abort();
  }, [quoteBody, quoteKey]);
  const quote = quoteState.key === quoteKey ? quoteState.data : undefined;
  const quoteError = quoteState.key === quoteKey ? quoteState.error : undefined;
  const invalidDelivery =
    shop.delivery === "pickup" &&
    products.products.some((product) => product.delivery === "home");
  const invalidAddress =
    shop.delivery === "home" &&
    (!shop.addressReviewed ||
      !options.data ||
      Object.keys(validateAddress(shop.address, options.data.districts))
        .length > 0);
  const ready =
    !!quote &&
    !!options.data &&
    !options.loading &&
    !options.error &&
    !products.loading &&
    !products.error &&
    !products.missing.length &&
    !cartInvalid(products.products, shop.cart) &&
    !invalidDelivery &&
    !invalidAddress &&
    !fieldError;
  async function finish(event: FormEvent) {
    event.preventDefault();
    if (!accepted || !ready || busy || !quote) return;
    const payload: SimulationRequest = {
      items: shop.cart,
      deliveryMethod: shop.delivery,
      acceptedTerms: true,
      ...(shop.delivery === "home" ? { address: shop.address } : {}),
    };
    const fingerprint = JSON.stringify(payload);
    const simulationKey = shop.getSimulationKey(fingerprint);
    setBusy(true);
    setError("");
    try {
      const result = await request<Simulation>("/checkout/simulate", {
        method: "POST",
        body: fingerprint,
        headers: { "Idempotency-Key": simulationKey },
      });
      if (
        !isQuote(result, quote.itemCount) ||
        result.simulated !== true ||
        typeof result.simulationId !== "string" ||
        !result.simulationId.startsWith("SIM-") ||
        result.deliveryMethod !== shop.delivery
      )
        throw new ApiError(
          "No pudimos verificar la confirmación. Reintenta para recuperar el resultado.",
        );
      if (!live.current) return;
      shop.setPreviousTotal(quote.total);
      shop.setResult(result);
      shop.setCart([]);
      shop.clearSimulationAttempt();
      shop.setAddress({
        district: "",
        street: "",
        number: "",
        noNumber: false,
        reference: "",
      });
      shop.setAddressReviewed(false);
      navigate("/confirmacion");
      shop.announce("Confirmación completada.");
    } catch (error) {
      if (!live.current) return;
      const issue =
        error instanceof Error
          ? error.message
          : "No pudimos finalizar. Vuelve a intentarlo.";
      setError(issue);
      if (error instanceof ApiError && error.status === 400) {
        setFieldError(error.field || "request");
        if (error.field?.startsWith("address")) shop.setAddressReviewed(false);
      }
      if (error instanceof ApiError && error.status === 409) {
        setFieldError("idempotencyKey");
        shop.clearSimulationAttempt();
      }
    } finally {
      if (live.current) setBusy(false);
    }
  }
  return (
    <section className="section">
      <Steps current={2} />
      <PageTitle eyebrow="UN ÚLTIMO VISTAZO" title="Todo listo para revisar">
        Confirma tus productos, la entrega y el total.
      </PageTitle>
      {products.loading ? (
        <Loading text="Revisando tus productos…" />
      ) : products.error ? (
        <ErrorState message={products.error} retry={products.retry} />
      ) : (
        <div className="checkout-layout">
          <div className="review-content">
            <section className="review-block">
              <div className="block-heading">
                <h2>Tu selección</h2>
                <Link href="/carrito">Editar carrito</Link>
              </div>
              {products.products.map((product) => (
                <div className="review-line" key={product.id}>
                  <ProductImage product={product} />
                  <div>
                    <strong>{product.name}</strong>
                    <p className="seller">Vendido por {product.seller}</p>
                    <p>
                      Cantidad:{" "}
                      {
                        shop.cart.find((item) => item.productId === product.id)
                          ?.quantity
                      }
                    </p>
                  </div>
                  <span>{money(product.price)}</span>
                </div>
              ))}
              {(products.missing.length > 0 ||
                cartInvalid(products.products, shop.cart)) && (
                <p className="field-error">
                  La disponibilidad cambió.{" "}
                  <Link href="/carrito">Corrige tu carrito</Link> antes de
                  continuar.
                </p>
              )}
            </section>
            <section className="review-block">
              <div className="block-heading">
                <h2>
                  {shop.delivery === "home"
                    ? "Entrega a domicilio"
                    : "Retiro en tienda"}
                </h2>
                <Link href="/entrega">Editar entrega</Link>
              </div>
              {shop.delivery === "home" ? (
                invalidAddress ? (
                  <p className="field-error">
                    Falta revisar una dirección válida.{" "}
                    <Link href="/entrega">Completa y revisa tu dirección</Link>.
                  </p>
                ) : (
                  <div className="address-preview">
                    <strong>
                      {shop.address.street}{" "}
                      {shop.address.noNumber ? "s/n" : shop.address.number}
                    </strong>
                    <p>{shop.address.district}, Lima</p>
                    {shop.address.reference && (
                      <p>Referencia: {shop.address.reference}</p>
                    )}
                  </div>
                )
              ) : (
                <>
                  <p>Punto de retiro</p>
                  <p className="muted">
                    {options.data?.pickupPoint.address.split("·")[0].trim()}
                  </p>
                  {invalidDelivery && (
                    <p className="field-error">
                      Un producto solo admite domicilio.{" "}
                      <Link href="/entrega">Cambia la modalidad</Link>.
                    </p>
                  )}
                </>
              )}
            </section>
            {options.error && (
              <ErrorState message={options.error} retry={options.retry} />
            )}
          </div>
          <Summary
            subtotal={subtotal(products.products, shop.cart)}
            quote={quote}
          >
            {!quote && !quoteError && <Loading text="Confirmando el total…" />}
            {quoteError && (
              <div role="alert">
                <p className="field-error">{quoteError}</p>
                <button
                  className="button secondary"
                  onClick={() => retryQuote((n) => n + 1)}
                >
                  Reintentar cálculo
                </button>
              </div>
            )}
            <form onSubmit={finish}>
              <label className="checkbox-label terms-check">
                <input
                  type="checkbox"
                  checked={accepted}
                  disabled={busy}
                  onChange={(event) => setAccepted(event.target.checked)}
                />
                <span>Acepto las condiciones de compra.</span>
              </label>
              <button
                type="button"
                className="text-button terms-link"
                onClick={() => setTermsOpen(true)}
              >
                Ver condiciones de compra
              </button>
              {!accepted && (
                <p className="field-help" id="finalize-help">
                  Acepta las condiciones para habilitar la finalización.
                </p>
              )}
              <button
                className="button primary full-width"
                type="submit"
                disabled={!accepted || !ready || busy}
                aria-describedby={!accepted ? "finalize-help" : undefined}
              >
                {busy ? "Finalizando…" : "Confirmar compra"}
                <Icon name={busy ? "bag" : "arrow"} size={18} />
              </button>
              <span className="sr-only" role="status">
                {busy ? "Procesando tu confirmación. Espera un momento." : ""}
              </span>
              {error && (
                <div className="submit-error" role="alert">
                  <p>{error}</p>
                  {fieldError &&
                    (fieldError === "idempotencyKey" ? (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setFieldError("");
                          setError("");
                          retryQuote((n) => n + 1);
                        }}
                      >
                        Revisar total e iniciar otro intento
                      </button>
                    ) : (
                      <Link
                        href={
                          fieldError.startsWith("address") ||
                          fieldError === "deliveryMethod"
                            ? "/entrega"
                            : "/carrito"
                        }
                      >
                        Volver a corregir los datos
                      </Link>
                    ))}
                  {!fieldError && (
                    <p className="field-help">
                      Conservamos tu carrito. Reintenta con “Confirmar compra”
                      para recuperar el resultado sin duplicarlo.
                    </p>
                  )}
                </div>
              )}
            </form>
          </Summary>
        </div>
      )}
      {termsOpen && (
        <Modal
          title="Condiciones de compra"
          onClose={() => setTermsOpen(false)}
        >
          <div className="terms-copy">
            <p>
              Revisa los productos, las cantidades, la dirección y la modalidad
              de entrega antes de confirmar.
            </p>
            <p>
              El total incluye el costo de entrega seleccionado. Puedes volver a
              editar tu selección antes de continuar.
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="button primary"
              onClick={() => setTermsOpen(false)}
            >
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
export function Confirmation() {
  const shop = useShop();
  const result = shop.result;
  if (!result)
    return (
      <section className="section">
        <PageTitle title="No hay una confirmación disponible" />
        <Empty title="Puedes comenzar una nueva selección">
          Aquí encontrarás el resultado de tu última confirmación.
        </Empty>
      </section>
    );
  return (
    <section className="section confirmation">
      <div className="success-symbol">
        <Icon name="check" size={40} />
      </div>
      <p className="eyebrow">RECORRIDO COMPLETADO</p>
      <h1 tabIndex={-1} data-page-title="¡Una elección bien hecha!">
        ¡Una elección bien hecha!
      </h1>
      <h2>Confirmación completada</h2>
      <p className="lead">Tu selección se registró correctamente.</p>
      <div className="confirmation-receipt">
        <p className="receipt-id">
          <span>Número de confirmación</span>
          <strong>{result.simulationId}</strong>
        </p>
        <dl>
          <div>
            <dt>Unidades</dt>
            <dd>{result.itemCount}</dd>
          </div>
          <div>
            <dt>Modalidad</dt>
            <dd>{result.deliveryMethod === "home" ? "Domicilio" : "Retiro"}</dd>
          </div>
          <div>
            <dt>Productos</dt>
            <dd>{money(result.subtotal)}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{money(result.delivery)}</dd>
          </div>
          <div className="summary-total">
            <dt>Total</dt>
            <dd>{money(result.total)}</dd>
          </div>
        </dl>
        {shop.previousTotal !== null &&
          Math.abs(result.total - shop.previousTotal) > 0.01 && (
            <p className="info-message">
              El total cambió desde la revisión ({money(shop.previousTotal)}).
              El servicio confirmó el importe definitivo que se muestra aquí.
            </p>
          )}
      </div>
      <Link className="button primary" href="/catalogo">
        Seguir explorando
        <Icon name="arrow" size={18} />
      </Link>
    </section>
  );
}
