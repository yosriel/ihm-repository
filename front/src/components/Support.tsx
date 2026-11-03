import { useState } from "react";
import { Modal } from "./ui";
import { Link } from "../router";

export function Support({ floating = false }: { floating?: boolean }) {
  const [open, setOpen] = useState<"help" | "advisor" | "phone" | null>(null);
  const [budget, setBudget] = useState("400");
  const title =
    open === "help"
      ? "Ayuda para comprar"
      : open === "phone"
        ? "Venta telefónica"
        : "Asesoría de compra";
  return (
    <>
      {floating ? (
        <button
          className="support-launcher"
          aria-label="Abrir asesoría de compra"
          onClick={() => setOpen("advisor")}
          aria-haspopup="dialog"
        >
          <img
            src="/images/advisor.svg"
            alt="Asesoría de compra"
            width="28"
            height="28"
          />
          <span>Asesoría</span>
        </button>
      ) : (
        <nav className="support-nav" aria-label="Ayuda y asesoría">
          <button
            className="text-button"
            onClick={() => setOpen("help")}
            aria-haspopup="dialog"
          >
            Ayuda
          </button>
          <button
            className="text-button"
            onClick={() => setOpen("phone")}
            aria-haspopup="dialog"
          >
            Venta telefónica
          </button>
        </nav>
      )}
      {open && (
        <Modal title={title} onClose={() => setOpen(null)}>
          <div className="support-content">
            {open === "help" ? (
              <>
                <details>
                  <summary>¿Cómo encuentro una freidora?</summary>
                  <p>
                    Busca un producto y abre los filtros de precio, marca o
                    capacidad. Aplica los filtros para actualizar los
                    resultados. Puedes quitar cada criterio o limpiar todos.
                  </p>
                </details>
                <details>
                  <summary>¿Cuánto cuesta la entrega?</summary>
                  <p>
                    La entrega a domicilio cuesta S/ 12.90 en los distritos
                    disponibles. El retiro de demostración no tiene costo. El
                    resumen confirma el total antes de finalizar.
                  </p>
                </details>
                <details>
                  <summary>¿Cómo corrijo mi dirección?</summary>
                  <p>
                    En Entrega, edita tus datos y elige Revisar dirección.
                    Puedes volver a editar antes de usarla. Si cambias la
                    dirección, debes revisarla nuevamente.
                  </p>
                </details>
                <details>
                  <summary>¿Se realizará un cobro?</summary>
                  <p>
                    Este es un prototipo académico. La confirmación registra una
                    simulación, sin cobros ni pedidos reales. No ingreses datos
                    bancarios reales.
                  </p>
                </details>
                <details>
                  <summary>¿Puedo usar el teclado?</summary>
                  <p>
                    Usa Tab y Mayús + Tab para recorrer controles, Enter para
                    enlaces y botones, Espacio para casillas y flechas para
                    elegir opciones. Escape cierra este diálogo.
                  </p>
                </details>
              </>
            ) : (
              <>
                {open === "phone" && (
                  <p>
                    Este prototipo ofrece orientación de compra en pantalla. No
                    realiza llamadas ni conecta con una central telefónica real.
                  </p>
                )}
                <p>
                  Elige tu presupuesto y consulta las freidoras que se ajustan a
                  él. En cada ficha puedes revisar capacidad, vendedor y
                  modalidad de entrega.
                </p>
                <label
                  htmlFor={
                    floating
                      ? "advisor-budget-floating"
                      : "advisor-budget-header"
                  }
                >
                  Presupuesto máximo en soles
                </label>
                <select
                  id={
                    floating
                      ? "advisor-budget-floating"
                      : "advisor-budget-header"
                  }
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="400">Hasta S/ 400</option>
                  <option value="600">Hasta S/ 600</option>
                  <option value="900">Hasta S/ 900</option>
                </select>
                <Link
                  href={`/catalogo?maxPrice=${budget}`}
                  className="button primary"
                  onClick={() => setOpen(null)}
                >
                  Ver opciones para mi presupuesto
                </Link>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
