import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "./ui";

// Only an explicit, fictitious token is accepted. Nothing is sent or persisted.
export function PaymentDemo() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  function close() {
    setOpen(false);
    setToken("");
    setError("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (token.trim().toUpperCase() !== "DEMO") {
      setError(
        "Escribe DEMO. Este formulario no acepta números de tarjeta ni datos bancarios.",
      );
      inputRef.current?.focus();
      return;
    }
    setAdded(true);
    close();
  }
  return (
    <section className="payment-demo" aria-labelledby="payment-demo-title">
      <h2 id="payment-demo-title">Medio de pago de demostración</h2>
      <p>
        La compra se puede simular sin una tarjeta. Si quieres explorar este
        paso, agrega una tarjeta ficticia.
      </p>
      <p role="status">
        {added
          ? "Tarjeta de demostración agregada. No se realizará ningún cobro."
          : "Sin tarjeta de demostración."}
      </p>
      <button
        className="button secondary"
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {added
          ? "Cambiar tarjeta de demostración"
          : "Agregar tarjeta de demostración"}
      </button>
      {added && (
        <button
          className="text-button"
          type="button"
          onClick={() => setAdded(false)}
        >
          Quitar tarjeta de demostración
        </button>
      )}
      {open && (
        <Modal title="Agregar tarjeta de demostración" onClose={close}>
          <form noValidate onSubmit={submit} className="support-content">
            <p id="demo-payment-help">
              Escribe únicamente <strong>DEMO</strong>. No ingreses números de
              tarjeta, fecha de vencimiento ni código de seguridad reales.
            </p>
            <div className="field">
              <label htmlFor="demo-payment-token">
                Código de tarjeta ficticia
              </label>
              <input
                id="demo-payment-token"
                ref={inputRef}
                value={token}
                maxLength={4}
                autoComplete="off"
                spellCheck={false}
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={`demo-payment-help${error ? " demo-payment-error" : ""}`}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
              />
              {error && (
                <p id="demo-payment-error" className="field-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <p className="payment-notice">
              Para validar esta tarjeta ficticia no se hará ningún cargo. Los
              datos de este paso se descartan al salir de la revisión.
            </p>
            <button className="button primary" type="submit">
              Usar tarjeta de demostración
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
