# Contrato de API para el equipo frontend

Versión de entrega: 2 de noviembre de 2026. Backend Spring Boot 4.1.2, Java 21 y MySQL. Esta API sirve una demostración académica; no procesa pagos, pedidos comerciales ni reservas de stock.

## Conexión

Base local: `http://localhost:8080/api`. Todas las respuestas de negocio usan JSON. Los POST requieren `Content-Type: application/json`; se recomienda `Accept: application/json`.

En desarrollo pueden usar el proxy `/api` del proyecto Vite existente o llamar a la base HTTP. Para un origen distinto, configurar `FRONTEND_ORIGINS` en el proceso del backend, con valores exactos separados por comas. El valor predeterminado es `http://localhost:5173`. No se requieren cookies ni credenciales de navegador. Las credenciales MySQL se configuran exclusivamente en el backend.

| Método | Ruta relativa a `/api` | Propósito |
| --- | --- | --- |
| GET | `/health` | Comprobar que el proceso API responde |
| GET | `/products` | Buscar, filtrar, ordenar y paginar productos |
| GET | `/products/{id}` | Consultar detalle |
| GET | `/catalog/filters` | Obtener opciones de los filtros |
| GET | `/checkout/options` | Obtener costos, distritos y punto de retiro demo |
| POST | `/checkout/quote` | Calcular importes con precios actuales del servidor |
| POST | `/checkout/simulate` | Validar y guardar una simulación de forma idempotente |

`GET /actuator/health`, fuera del prefijo `/api`, comprueba también la conexión a la base y devuelve 503 si no está disponible. `/api/health` solo comprueba el proceso.

## Catálogo paginado

`GET /products` devuelve **un objeto con `items`**, no un array en la raíz.

| Parámetro opcional | Tipo / valores | Reglas |
| --- | --- | --- |
| `q` | Texto | Búsqueda parcial en nombre, marca y descripción; máximo 120 caracteres; espacios exteriores se recortan |
| `brand` | Texto | Una marca de `/catalog/filters`; coincidencia exacta sin distinguir mayúsculas |
| `minPrice`, `maxPrice` | Decimal | 0 a 99999999.99; mínimo no superior al máximo |
| `minRating` | Decimal | 0 a 5 |
| `minDiscount` | Decimal | Porcentaje mínimo entre 0 y 100; se calcula con precio anterior y actual, sin redondear antes de filtrar |
| `delivery` | `home`, `pickup` | Domicilio o productos que admiten retiro |
| `seller` | `falabella`, `marketplace` | Tipo de vendedor, no nombre comercial de tienda |
| `capacity` | Texto | Una capacidad de metadatos, por ejemplo `4 L` |
| `color` | Texto | Un color de metadatos, por ejemplo `negro` |
| `sort` | `recommended`, `price-asc`, `price-desc`, `rating-desc` | Predeterminado `recommended` |
| `page` | Entero | Índice desde 0, hasta 10000; predeterminado 0 |
| `size` | Entero | 1 a 48; predeterminado 12 |

Los filtros se combinan con AND. Cada parámetro admite una selección por solicitud en esta versión. La interfaz debe usar radios o selección única por criterio; no ofrecer selección múltiple que la API no soporte. «Más filtros» puede agrupar capacidad y color. Los campos de texto vacíos equivalen a no filtrar. Una marca o capacidad sin coincidencias devuelve una lista vacía, no un error. El buscador trata `%`, `_` y comillas como texto, no como instrucciones de consulta.

Ejemplo: `/products?q=freidora&brand=Taurus&maxPrice=400&delivery=pickup&sort=price-asc&page=0&size=12`.

```json
{
  "items": [
    {
      "id": "taurus-air-fry",
      "slug": "taurus-air-fry",
      "brand": "Taurus",
      "name": "Freidora de aire Air Fry Digital 4 L",
      "description": "Prepara tus recetas con aire caliente y elige el tiempo y la temperatura desde su panel digital.",
      "price": 389.00,
      "previousPrice": 499.00,
      "rating": 4.7,
      "reviewCount": 128,
      "capacity": "4 L",
      "color": "negro",
      "image": "/images/taurus.jpg",
      "seller": "Falabella",
      "sellerType": "falabella",
      "delivery": "both",
      "stock": 12,
      "maxQuantity": 2,
      "features": ["Panel digital", "Canasta antiadherente", "Temperatura regulable", "Apagado automático"]
    }
  ],
  "page": 0,
  "size": 12,
  "totalElements": 1,
  "totalPages": 1
}
```

`recommended` ordena por calificación y luego cantidad de opiniones; los desempates usan el identificador. Los demás órdenes también tienen desempate estable por identificador. Una búsqueda vacía devuelve `items: []`, `totalElements: 0` y `totalPages: 0`. Una página posterior a la última conserva el total y devuelve `items: []`.

Los importes son números JSON en soles. Mostrarlos con formato `es-PE` y dos decimales. `rating` y `reviewCount`, al igual que precios, disponibilidad y especificaciones, son datos ficticios del catálogo de prueba; no son reseñas verificadas ni ofertas reales.

`delivery: "both"` permite domicilio y retiro; `"home"` permite solo domicilio. La cantidad admisible es de 1 a `min(stock, maxQuantity)`. No tratar `maxQuantity` como stock disponible.

### Detalle y fotografías

`GET /products/taurus-air-fry` devuelve el mismo objeto de producto, sin el envoltorio de paginación. Un identificador inexistente devuelve 404 con `field: "productId"`. En los datos iniciales `id` y `slug` coinciden.

`image` es una **ruta del futuro frontend**, no un archivo servido por Spring. El equipo dispone de fotografías opcionales y sus fuentes en [la rama de documentación frontend](https://github.com/yosriel/ihm-repository/blob/codex/feature-frontend-specification/docs/FUENTES_IMAGENES.md), dentro de su carpeta `docs/frontend-assets/`. Copiarlas al directorio público con los nombres indicados si decide usarlas, o sustituirlas por imágenes adecuadas actualizando los datos mediante una migración. Las fotografías son referenciales y no acreditan las especificaciones del catálogo ficticio.

### Metadatos de filtros

`GET /catalog/filters`:

```json
{
  "brands": ["Imaco", "Oster", "Philips", "Taurus"],
  "capacities": ["3 L", "4 L", "5 L", "6 L", "7 L"],
  "colors": ["negro"],
  "sellers": [
    {"value": "falabella", "label": "Falabella"},
    {"value": "marketplace", "label": "Tiendas del marketplace"}
  ],
  "deliveryMethods": [
    {"value": "home", "label": "Entrega a domicilio"},
    {"value": "pickup", "label": "Retiro en tienda"}
  ],
  "sortOptions": [
    {"value": "recommended", "label": "Recomendados"},
    {"value": "price-asc", "label": "Menor precio"},
    {"value": "price-desc", "label": "Mayor precio"},
    {"value": "rating-desc", "label": "Mejor calificación"}
  ]
}
```

Estos metadatos describen el catálogo completo, no facetas recalculadas por la búsqueda activa. Capacidad y color se devuelven como textos; no asumir un orden numérico si en el futuro aparecen otras capacidades.

## Opciones de entrega

`GET /checkout/options`:

```json
{
  "currency": "PEN",
  "homeDelivery": 12.90,
  "pickupDelivery": 0.00,
  "maxQuantityPerProduct": 2,
  "districts": ["Barranco", "Jesús María", "Miraflores", "San Borja", "San Isidro", "Santiago de Surco"],
  "pickupPoint": {
    "id": "demo-miraflores",
    "name": "Punto de retiro de demostración",
    "address": "Miraflores, Lima · ubicación académica sin atención real"
  }
}
```

El retiro es un escenario académico: no mostrar un mapa ni afirmar que existe atención real en esa ubicación. La tarifa de domicilio se aplica una vez al carrito en esta simulación, no por unidad. No representa una política comercial de Falabella.

## Cotización

`POST /checkout/quote`:

```json
{
  "items": [{"productId": "taurus-air-fry", "quantity": 2}],
  "deliveryMethod": "home"
}
```

Respuesta 200:

```json
{"subtotal": 778.00, "delivery": 12.90, "total": 790.90, "currency": "PEN", "itemCount": 2}
```

`itemCount` es la suma de unidades. El servidor obtiene los precios de MySQL. Los campos de precio o totales que añada el cliente no alteran el cálculo. La lista no puede estar vacía, tener más de 48 líneas, repetir un producto ni incluir productos inexistentes. Las cantidades deben ser enteras, positivas y respetar stock y límite. El retiro se rechaza si algún producto solo admite domicilio. Una cotización no escribe una simulación ni reserva existencias.

Solicitar una nueva cotización al cambiar productos, cantidades o modalidad y descartar respuestas que ya no correspondan al estado actual. El cliente no debe habilitar el cierre con una estimación local.

## Finalización académica

`POST /checkout/simulate` requiere además la cabecera **`Idempotency-Key: <UUID>`**. Generar un UUID por intento lógico de finalización y conservarlo al reintentar la misma solicitud.

```json
{
  "items": [{"productId": "taurus-air-fry", "quantity": 1}],
  "deliveryMethod": "home",
  "address": {
    "district": "Miraflores",
    "street": "Avenida Arequipa",
    "number": "123",
    "noNumber": false,
    "reference": "Frente al parque"
  },
  "acceptedTerms": true
}
```

Respuesta 200:

```json
{
  "simulationId": "SIM-00000000-0000-4000-8000-000000000001",
  "subtotal": 389.00,
  "delivery": 12.90,
  "total": 401.90,
  "currency": "PEN",
  "itemCount": 1,
  "deliveryMethod": "home",
  "simulated": true
}
```

El identificador mostrado es ilustrativo: la implementación genera uno propio. Se guardan resultado y líneas dentro de una transacción MySQL. No se guardan la dirección ni la referencia en texto; se conserva una huella SHA-256 de la carga normalizada para detectar reintentos distintos. No hay cobro, envío, pedido real ni descuento de stock.

Misma clave y mismos datos devuelve el resultado ya guardado, incluso si cambió el precio del catálogo. El orden de las líneas y los ceros decimales de la cantidad no cambian el significado de la solicitud. Misma clave con datos distintos devuelve **409** y `field: "idempotencyKey"`. Si la persona modifica la solicitud después de un error, debe usar otra clave; un simple reintento de red reutiliza la original.

No hay consulta pública de simulaciones por ID en esta versión. Conservar la respuesta de éxito para alimentar la confirmación. Tras un timeout, reenviar la misma carga y clave permite recuperar el resultado sin duplicarlo. Vaciar el carrito solo después de un éxito confirmado.

El total se recalcula al finalizar y puede diferir de una cotización antigua si alguien modificó el catálogo. El equipo debe mostrar el total definitivo devuelto y comunicar cualquier diferencia. Esta etapa no implementa congelación de precio ni aprobación comercial de cambios.

### Validación de domicilio

| Campo | Regla del backend |
| --- | --- |
| `acceptedTerms` | Obligatorio y exactamente `true` para cualquier modalidad |
| `address` | Obligatorio para `home`; innecesario y descartado para `pickup` |
| `address.district` | Uno de los seis distritos de opciones; se recortan espacios exteriores |
| `address.street` | Como máximo 160 caracteres y al menos cinco letras; no basta escribir números |
| `address.number` | String de 1 a 6 dígitos, valor 1 a 999999, salvo que `noNumber` sea `true` |
| `address.noNumber` | Boolean; `true` permite omitir número; no acredita que la dirección exista |
| `address.reference` | Opcional, máximo 200 caracteres |

Esta es una validación de formato y cobertura de la demostración. No geocodifica, no verifica una dirección real y no garantiza reparto. «Confirmar dirección» en frontend significa que la persona revisó su entrada, no que un servicio externo verificó la ubicación.

## Errores y estados

Las validaciones de negocio devuelven JSON:

```json
{"message": "Selecciona un distrito disponible.", "field": "address.district"}
```

| HTTP | Tratamiento en frontend |
| --- | --- |
| 200 | Usar la respuesta; comprobar que corresponde a la solicitud vigente |
| 400 | Mostrar `message`, asociarlo a `field` si existe y conservar los demás datos |
| 404 | Producto no encontrado; permitir volver al catálogo |
| 409 | La clave de simulación se reutilizó con otra carga; no mostrar éxito ficticio |
| 503 | No se pudieron consultar/guardar datos; conservar estado y ofrecer reintento |
| Fallo de red / timeout | No asumir éxito o fracaso definitivo de la simulación; reintentar con la misma clave y carga |

`field` puede ser `q`, `brand`, `minPrice`, `maxPrice`, `minRating`, `minDiscount`, `delivery`, `seller`, `capacity`, `color`, `sort`, `page`, `size`, `productId`, `items`, `quantity`, `deliveryMethod`, `acceptedTerms`, `idempotencyKey`, `address` o uno de los campos de dirección anteriores. JSON malformado devuelve 400 con `message` y sin campo concreto. La API informa un problema por respuesta; el frontend puede evaluar todos sus campos locales antes de enviar.

## Estado que corresponde al frontend

Carrito, favoritos y selección de comparación pertenecen al estado del cliente en esta etapa. No hay cuentas, registro, autenticación ni sincronización de estas preferencias entre dispositivos. «Multiplataforma» describe una interfaz adaptable y operable, no sincronización de cuentas. No inventar endpoints para operaciones que no existen.

Guardar como máximo identificadores y cantidades necesarios; volver a consultar precios y disponibilidad. Mantener la dirección en memoria durante el recorrido, fuera de URL y almacenamiento persistente. Las reglas de UI, navegación, accesibilidad y responsividad se especifican en [la guía de la rama frontend](https://github.com/yosriel/ihm-repository/blob/codex/feature-frontend-specification/docs/GUIA_FRONTEND.md).
