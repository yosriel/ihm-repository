# Arquitectura y comportamiento del frontend

El frontend implementa los dos procesos de búsqueda y preparación de compra mediante React, TypeScript y Vite. Esta guía describe el código de `feature/apf3-frontend`; la especificación anterior permanece disponible en [su rama de origen](https://github.com/yosriel/ihm-repository/tree/feature-frontend.specification/docs).

## Procesos y rutas

| Ruta | Función |
| --- | --- |
| `/` | Inicio, buscador y productos destacados |
| `/catalogo` | Búsqueda, filtros, orden y resultados paginados |
| `/producto/:id` | Ficha, cantidad y agregado al carrito |
| `/favoritos` | Productos guardados en este navegador |
| `/comparar` | Comparación de hasta tres productos |
| `/carrito` | Edición de cantidades, eliminación y resumen |
| `/entrega` | Modalidad, dirección y revisión explícita |
| `/resumen` | Cotización confirmada, condiciones y envío de la finalización |
| `/confirmacion` | Resultado recibido del backend durante la sesión |

El proceso 1 recorre inicio, catálogo, ficha y agregado. El proceso 2 continúa por carrito, entrega, revisión y confirmación. Favoritos y comparación complementan la selección.

Los filtros y el orden se conservan en parámetros de URL. Cada criterio admite una selección, conforme a la API; distintos criterios se combinan. El índice de paginación empieza en cero y se restablece al modificar criterios.

## Organización del código

| Archivo o carpeta dentro de `front` | Responsabilidad |
| --- | --- |
| `src/App.tsx` | Cabecera, rutas, pie, avisos y gestión de foco al cambiar de pantalla |
| `src/navigation.ts` y `src/router.tsx` | Historial del navegador y enlaces internos |
| `src/pages/Catalog.tsx` | Inicio, catálogo y panel de filtros |
| `src/pages/Product.tsx` | Ficha, favoritos y comparación |
| `src/pages/Checkout.tsx` | Carrito, entrega, revisión y confirmación |
| `src/components/ui.tsx` | Controles, tarjetas, diálogos, resumen y estados compartidos |
| `src/store.tsx` y `src/shop-state.ts` | Contexto de React, persistencia local y estado del recorrido |
| `src/services/api.ts` | Cliente HTTP, errores, cancelación y carga de datos |
| `src/validation.ts` | Validaciones locales de dirección |
| `src/types.ts` | Tipos del catálogo, entrega y finalización |
| `src/App.css` y `src/index.css` | Diseño, adaptación, foco y movimiento reducido |
| `public/images` | Imágenes servidas por Vite y por el build |
| `tests` | Pruebas de navegador y respuestas controladas |

## Integración HTTP

El [contrato de API](API.md) define las estructuras y restricciones. La interfaz consume estas operaciones bajo `/api`:

| Operación | Uso |
| --- | --- |
| `GET /products` | Búsqueda, filtros, orden y paginación; la respuesta contiene `items` |
| `GET /products/{id}` | Ficha y actualización de condiciones de productos guardados |
| `GET /catalog/filters` | Opciones de filtros y orden |
| `GET /checkout/options` | Distritos, tarifas y punto de retiro |
| `POST /checkout/quote` | Cotización del carrito y la modalidad |
| `POST /checkout/simulate` | Validación y registro del cierre simulado |

`src/services/api.ts` aplica un límite de espera de 15 segundos. Las cargas cancelables usan `AbortController`; las respuestas que ya no corresponden a la solicitud activa no actualizan la vista. Los fallos mantienen la selección y permiten reintentar.

La confirmación incluye `Idempotency-Key` con un UUID. El mismo contenido reutiliza su clave durante la sesión; cambiar el contenido genera otra. Un fallo de red no se presenta como éxito y el carrito solo se vacía tras una respuesta de éxito comprobada.

El texto de interfaz es «Confirmar compra». Técnicamente sigue siendo `/checkout/simulate`: no hay pasarela, cobro, pedido comercial ni reserva de stock. No se añadieron endpoints ni se cambió el esquema MySQL para implementar las pantallas.

## Estado y persistencia

| Información | Ubicación y duración |
| --- | --- |
| Carrito | `localStorage`, clave `ihm.cart.v1`; identificadores y cantidades |
| Favoritos | `localStorage`, clave `ihm.favorites.v1`; identificadores |
| Comparación | Memoria de la aplicación; máximo tres productos |
| Modalidad y dirección | Memoria; se conservan al volver entre pasos durante la sesión |
| Dirección revisada | Memoria; se invalida al modificar dirección o modalidad |
| Cotización | Estado de revisión asociado al carrito y la modalidad actuales |
| Intento de finalización | Memoria, con contenido y clave idempotente |
| Confirmación | Respuesta del backend en memoria; no se recupera por ID tras recargar |

El carrito y los favoritos dependen del origen del navegador: `localhost` y `127.0.0.1` tienen almacenamiento distinto. No hay cuentas, autenticación ni sincronización entre dispositivos. La dirección no se guarda en URL, `localStorage` ni `sessionStorage`.

## Validación y recuperación

La dirección respeta los distritos y formatos definidos por el backend. La calle requiere al menos cinco letras y admite hasta 160 caracteres; el número admite de uno a seis dígitos positivos salvo la alternativa sin número; la referencia es opcional y admite hasta 200 caracteres.

La revisión de dirección confirma lo escrito por la persona. No geocodifica ni verifica que una ubicación exista. El retiro muestra la localidad del punto configurado; no añade un mapa ni inventa una dirección de atención.

Los controles de cantidad siguen `min(stock, maxQuantity)`. El carrito impide continuar cuando falta un producto o la cantidad supera la disponibilidad. El retiro se deshabilita si algún producto solo admite domicilio.

Una URL directa al resumen no permite omitir carrito, modalidad compatible o dirección revisada cuando corresponde. La finalización necesita una cotización válida y aceptación explícita de las condiciones. Un resultado inválido o un fallo HTTP no genera una confirmación local ficticia.

## Accesibilidad y adaptación

La implementación incluye etiquetas visibles, alternativas de imagen, controles nativos, orden de encabezados, enlace para saltar al contenido, foco visible, regiones de estado y errores asociados al campo. Los errores de dirección se agrupan en un resumen enfocado con enlaces para corregirlos.

Los diálogos utilizan `dialog`, contienen el recorrido con Tab, cierran con Escape y devuelven el foco al origen. Los enlaces de imagen y nombre de producto comparten un único destino interactivo para reducir navegación redundante. Los títulos de pestaña se obtienen de los datos de la pantalla para conservarlos cuando una herramienta inserta anotaciones en el DOM.

La distribución adapta catálogo, comparación, carrito y formulario. Se respeta `prefers-reduced-motion`. Las pruebas de reflow recorren inicio, catálogo y ficha entre 320 y 1440 px; las demás pantallas tienen recorridos de prueba en escritorio y móvil emulado. Esto no equivale a comprobar cada pantalla en cada ancho o navegador.

Consulta [VERIFICACION_FRONTEND.md](VERIFICACION_FRONTEND.md) para separar las comprobaciones ejecutadas de NVDA, dispositivos reales y sesiones de usuarios todavía pendientes.

## Presentación y recursos

La interfaz conserva los textos de tienda y muestra el carácter académico del catálogo en el pie de página. Antes de aceptar las condiciones y en la confirmación se explica que no hay cobros ni pedidos reales. El punto de retiro muestra su nombre y dirección completos, incluido el aviso de demostración de la API.

Las fotografías se copian a `public/images` con los nombres utilizados por el catálogo. Su procedencia y carácter referencial se registran en [FUENTES_IMAGENES.md](FUENTES_IMAGENES.md).
