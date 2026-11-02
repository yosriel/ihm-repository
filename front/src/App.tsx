import { ServiceStatus } from './components/ServiceStatus'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Falabella IHM, inicio">
          falabella<span className="brand-dot">.</span>
          <span className="brand-project">IHM</span>
        </a>
        <span className="project-label">Prototipo académico</span>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Experiencia de compra</p>
          <h1 id="page-title">Comprar debería ser más sencillo.</h1>
          <p className="intro-copy">
            Estamos preparando una experiencia con filtros más claros y opciones
            de entrega fáciles de entender, basada en el proyecto Falabella de
            Interacción Humano Máquina.
          </p>
          <span className="phase-label">Proyecto en preparación</span>
        </section>

        <section className="journeys" aria-labelledby="journeys-title">
          <h2 id="journeys-title">Los recorridos que construiremos</h2>
          <div className="journey-grid">
            <article className="journey">
              <span className="journey-number" aria-hidden="true">01</span>
              <h3>Encuentra lo que buscas</h3>
              <p>
                Buscar, filtrar y comparar productos con información ordenada
                para elegir con confianza.
              </p>
            </article>
            <article className="journey">
              <span className="journey-number" aria-hidden="true">02</span>
              <h3>Elige cómo recibirlo</h3>
              <p>
                Revisar el carrito, indicar una dirección y conocer las
                alternativas de entrega antes de confirmar.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Demostración académica · Sin compras ni cobros reales</p>
        <ServiceStatus />
      </footer>
    </div>
  )
}

export default App
