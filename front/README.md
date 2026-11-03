# Frontend Falabella

Aplicación React con TypeScript y Vite para buscar y seleccionar productos, revisar un carrito, configurar la entrega y confirmar la selección mediante la API Spring Boot.

## Instalación y arranque

Requiere Node.js `^22.12.0 || >=24.0.0` y npm. Desde `front`:

```bash
npm ci
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). El backend debe ejecutarse en otra terminal con MySQL configurado según [su README](../back/README.md).

El catálogo normal utiliza la API; no carga automáticamente un catálogo local cuando falla el servidor. Los datos simulados de `tests/fixtures.ts` se utilizan únicamente durante las pruebas aisladas.

## Variables de entorno

La configuración predeterminada funciona con el backend en el puerto 8080. Para cambiarla:

macOS o Linux:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

| Variable | Valor inicial | Uso |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Base que utiliza el cliente HTTP del navegador |
| `BACKEND_URL` | `http://localhost:8080` | Destino del proxy de desarrollo de Vite |

Reinicia Vite después de modificar estas variables. Los valores `VITE_` se incluyen en la aplicación pública: no contienen credenciales MySQL ni otros secretos.

Para usar explícitamente la dirección IPv4 local:

```bash
npm run dev -- --host 127.0.0.1
```

## Funciones

- Inicio con búsqueda y selección de productos.
- Catálogo con seis filtros principales, filtros secundarios, chips para quitar selecciones, orden y paginación.
- Ficha con vendedor, características, cantidad y agregado al carrito.
- Favoritos y comparación de hasta tres productos.
- Carrito editable con límites por producto y estados vacíos.
- Domicilio y retiro según compatibilidad; formulario con errores asociados y alternativa sin número.
- Revisión del total calculado por el servidor y aceptación de condiciones.
- Confirmación alimentada por la respuesta de `/checkout/simulate`.

El botón visible «Confirmar compra» utiliza el cierre simulado del contrato. Su texto no cambia el alcance técnico del backend ni añade una integración de pagos.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 5173 |
| `npm run lint` | Análisis estático con oxlint |
| `npm run build` | Comprobación TypeScript y compilación en `dist` |
| `npm run preview` | Vista local del build; requiere resolver `/api` por separado |
| `npm run test:e2e` | Pruebas de interfaz con respuestas HTTP controladas |
| `npm run test:integration` | Casos con API real, activados con `IHM_LIVE_API=1` |
| `npm run format` | Formato del código y pruebas con Prettier |

## Pruebas de navegador

Instala Chromium una vez:

```bash
npx playwright install chromium
npm run test:e2e
```

La configuración inicia Vite automáticamente cuando hace falta y reutiliza el servidor local fuera de CI. El proyecto `mobile` usa emulación de iPhone 13 en Chromium; no ejecuta Safari ni acredita una prueba en un iPhone físico.

Para ejecutar los casos reales, inicia primero backend y MySQL y utiliza una base de desarrollo dedicada. Los casos crean registros de simulación y comprueban reintentos; no deben apuntar a datos de producción.

macOS o Linux:

```bash
IHM_LIVE_API=1 npm run test:integration
```

PowerShell:

```powershell
$env:IHM_LIVE_API = '1'
npm run test:integration
```

Sin esa variable, los casos de integración quedan omitidos. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` permite indicar una instalación de Chromium existente; normalmente se usa la descargada por Playwright.

Para abrir el informe HTML tras una ejecución:

```bash
npx playwright show-report
```

`playwright-report`, `test-results`, `node_modules`, `dist` y los archivos `.env.local` no se versionan.

## Persistencia y límites

El carrito y los favoritos se guardan en `localStorage` con identificadores y cantidades; los precios se consultan al servidor. Comparación, dirección, modalidad, revisión y confirmación se mantienen en memoria. Una recarga conserva carrito y favoritos, pero requiere volver a introducir y revisar la dirección.

La clave de idempotencia se conserva durante la sesión al reintentar la misma finalización. No se promete recuperar la confirmación después de cerrar o recargar la aplicación.

## Problemas frecuentes

| Síntoma | Comprobación |
| --- | --- |
| No cargan productos | Backend iniciado, conexión MySQL activa y `BACKEND_URL` correcto |
| API responde, pero la base no está disponible | `/api/health` solo comprueba el proceso; revisar también `/actuator/health` |
| No se puede finalizar | Cotización válida, carrito compatible, dirección revisada si corresponde y condiciones aceptadas |
| Un acceso directo al resumen no permite continuar | Completar antes los requisitos de carrito y entrega |
| Puerto 5173 ocupado | Cerrar la otra instancia o liberar el puerto; la configuración utiliza `strictPort` |
| `preview` no conecta con la API | El proxy está configurado para desarrollo; configurar un servidor que resuelva `/api` |
| Una ruta funciona al navegar, pero falla al recargar en hosting | Añadir fallback de las rutas de interfaz a `index.html` |

Consulta [la arquitectura](../docs/FRONTEND.md), [los resultados de verificación](../docs/VERIFICACION_FRONTEND.md) y [el contrato de API](../docs/API.md).
