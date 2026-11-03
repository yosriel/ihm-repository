# Falabella

Aplicación web de catálogo y preparación de compra con React, TypeScript y Vite, conectada a una API Spring Boot con MySQL. Conserva dos procesos: buscar, filtrar y seleccionar productos; revisar el carrito, configurar la entrega y confirmar la selección.

La interfaz utiliza lenguaje de tienda. El cierre sigue siendo una simulación del backend: no procesa pagos, pedidos comerciales ni reservas de inventario.

## Estado de esta rama

`feature/apf3-frontend` incorpora el frontend funcional sobre el backend de `feature-backend.structure`. El catálogo, los formularios y la confirmación consumen la API existente. La especificación previa de interfaz se conserva en [feature-frontend.specification](https://github.com/yosriel/ihm-repository/tree/feature-frontend.specification/docs).

| Área | Implementación |
| --- | --- |
| Búsqueda y selección | Catálogo, filtros combinables y reversibles, ordenamiento, paginación y ficha de producto |
| Colecciones | Favoritos persistidos en el navegador y comparación de hasta tres productos |
| Carrito | Agregado, edición de cantidades, límites, eliminación y estado vacío |
| Entrega | Domicilio o retiro compatible, dirección con alternativa sin número y revisión explícita |
| Cierre | Cotización del servidor, aceptación de condiciones, confirmación y reintentos idempotentes |
| Accesibilidad | Controles nativos, etiquetas, alternativas textuales, foco, teclado y anuncios de estado |
| Adaptación | Distribuciones de escritorio y móvil, con pruebas de reflow |

## Estructura

```text
ihm-repository/
├── front/                 Aplicación React y pruebas de navegador
│   ├── public/images/     Fotografías de productos
│   ├── src/               Pantallas, componentes, estado y cliente HTTP
│   └── tests/             Casos aislados y pruebas con la API real
├── back/                  API Spring Boot, migraciones y pruebas
├── docs/                  Arquitectura, contrato y verificación
└── REQUISITOS.md          Alcance e historial de requisitos
```

## Requisitos

- Node.js compatible con `front/package.json`: `^22.12.0 || >=24.0.0`, con npm.
- JDK 21 para el backend y `JAVA_HOME` configurado.
- MySQL dedicado al proyecto. Puede prepararse con Docker Compose según [la guía del backend](back/README.md).
- Acceso a Internet para la primera instalación de dependencias.

## Ejecutar en desarrollo

Primero prepara la base y define `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` siguiendo [back/README.md](back/README.md). Spring Boot no importa automáticamente el `.env` de Docker Compose.

Terminal 1, desde la raíz, en macOS o Linux:

```bash
cd back
sh ./mvnw spring-boot:run
```

En Windows, desde `back`, utiliza `.\mvnw.cmd spring-boot:run`.

Terminal 2, desde la raíz:

```bash
cd front
npm ci
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Vite redirige `/api` a `http://localhost:8080` durante el desarrollo. El puerto 5173 es fijo: si está ocupado, Vite informa el conflicto.

Para cambiar la configuración, copia `front/.env.example` a `front/.env.local`. Consulta [la guía de arranque frontend](front/README.md).

## Verificar

Desde `front`:

```bash
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas aisladas simulan las respuestas HTTP y no necesitan MySQL. Las pruebas de integración requieren la API y una base de desarrollo disponibles:

```bash
IHM_LIVE_API=1 npm run test:integration
```

En PowerShell, define primero `$env:IHM_LIVE_API = '1'` y ejecuta `npm run test:integration`.

Desde `back`, `sh ./mvnw verify` ejecuta la suite rápida existente. Las pruebas MySQL adicionales tienen sus propias instrucciones en [back/README.md](back/README.md).

## Documentación

| Documento | Contenido |
| --- | --- |
| [Frontend](front/README.md) | Instalación, variables, comandos y solución de problemas |
| [Arquitectura frontend](docs/FRONTEND.md) | Rutas, componentes, estado, API y decisiones de accesibilidad |
| [Verificación frontend](docs/VERIFICACION_FRONTEND.md) | Pruebas ejecutadas, revisión WAVE y pendientes |
| [Contrato de API](docs/API.md) | Operaciones, datos, errores y reglas de finalización |
| [Base de datos](docs/BASE_DATOS.md) | Tablas, relaciones y migraciones |
| [Verificación backend](docs/VERIFICACION.md) | Registro histórico de la entrega del backend |
| [Fuentes de imágenes](docs/FUENTES_IMAGENES.md) | Procedencia de las fotografías referenciales |
| [Requisitos](REQUISITOS.md) | Relación con los procesos anteriores y alcance vigente |

## Alcance de publicación

`npm run build` genera `front/dist`. El despliegue necesita servir las rutas de la SPA con fallback a `index.html` y dirigir `/api` al backend, o configurar una URL pública de API con su CORS correspondiente. El proxy de Vite solo funciona durante el desarrollo.

Esta rama no incluye despliegue ni flujo de CI. NVDA y las sesiones con grupos de usuarios siguen pendientes; los resultados automatizados no constituyen una certificación WCAG.
