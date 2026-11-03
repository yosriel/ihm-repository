# Verificación del frontend

Fecha: 3 de noviembre de 2026. Alcance: frontend React de la rama `feature/apf3-frontend`, conectado al backend de esta rama. Este registro describe comprobaciones técnicas y no asigna una nota ni sustituye las sesiones de usuarios.

## Resultado automatizado

| Comprobación | Procedimiento | Resultado |
| --- | --- | --- |
| Tipos y build | `npm run build` | Correcto; salida en `front/dist` |
| Análisis estático | `npm run lint` | Correcto, sin advertencias en la ejecución registrada |
| Interfaz y regresiones | `npm run test:e2e` | 30 casos aprobados: 15 escenarios en dos configuraciones |
| Integración HTTP real | `IHM_LIVE_API=1 npm run test:integration` | 4 casos aprobados: domicilio y retiro en dos configuraciones |
| Suite conjunta | `IHM_LIVE_API=1 npx playwright test` | 34 casos aprobados, sin fallos |

Entorno de la ejecución: macOS, Node.js 22.19.0, Chromium local y Playwright 1.64.1. El proyecto `desktop` utiliza 1440 × 1000 px y el proyecto `mobile` emula iPhone 13 en Chromium. La integración utilizó Spring Boot 4.1.2 con Java 22.0.2 y una instancia MySQL 9.7.0 aislada del servicio existente; no se modificó el requisito del proyecto de JDK 21. No se atribuye esta ejecución a Safari, dispositivos físicos, Docker ni a la versión MySQL propuesta por Compose.

Los 30 casos aislados interceptan la API con datos de `tests/fixtures.ts`. Los cuatro casos de integración usan los controladores y persistencia reales. Al repetir la prueba, los resultados deben obtenerse de la nueva ejecución; estas cifras no se mantienen automáticamente.

## Cobertura de los escenarios

| Área | Casos comprobados |
| --- | --- |
| Filtros | Aplicar, cancelar borrador, quitar un criterio, limpiar y conservar búsqueda |
| Domicilio | Campos inválidos, foco en el resumen de errores, dirección sin número, revisión y total |
| Retiro | Omisión de dirección, cambio de cantidad y total para dos unidades |
| Disponibilidad | Retiro incompatible y eliminación del último producto |
| Colecciones | Favoritos al recargar, comparación y límite de tres productos |
| Teclado | Activación de ambos procesos mediante eventos de teclado; Tab y Escape en el diálogo |
| Fallos | Cotización fallida, bloqueo del cierre, reintento de finalización y misma clave idempotente |
| Acceso directo | Resumen bloqueado al invalidar la revisión de dirección |
| Datos locales | Dirección ausente de almacenamiento persistente |
| Adaptación | Inicio, catálogo y ficha sin desbordamiento horizontal a 320, 360, 390, 768, 1024 y 1440 px |
| Semántica y contraste automático | axe-core en inicio, catálogo, ficha, carrito, entrega, condiciones, comparación y confirmación según los casos |
| Regresiones WAVE | Un destino por tarjeta, fotografía accionable, texto secundario legible y título estable ante anotaciones |
| Integración | Recorridos completos con cotización del servidor, confirmación y repetición idempotente |

Las comprobaciones axe ejecutadas utilizan las etiquetas `wcag2a`, `wcag2aa`, `wcag21a` y `wcag21aa`. No detectaron infracciones en los estados incluidos. Las reglas automáticas y los casos de teclado no acreditan por sí solos conformidad completa con WCAG 2.1 AA.

## Revisión manual con WAVE

Durante el desarrollo del 3 de noviembre se ejecutó la extensión WAVE en Brave sobre la aplicación local, con un producto para el proceso de carrito y entrega.

El inicio mostraba inicialmente 28 alertas por texto pequeño y cinco por enlaces redundantes. Se aumentaron los textos secundarios a 14 px y se unificaron los enlaces de imagen y nombre. La revisión posterior también permitió corregir el salto de encabezado del catálogo y el enlace redundante del carrito.

| Pantalla revisada después de esos ajustes | Errores | Errores de contraste | Alertas |
| --- | ---: | ---: | ---: |
| Inicio | 0 | 0 | 1 |
| Catálogo | 0 | 0 | 0 |
| Carrito con un producto | 0 | 0 | 0 |
| Entrega a domicilio con formulario inicial | 0 | 0 | 1 |

La alerta del inicio relaciona accesos al catálogo en secciones distintas. La de entrega relaciona el paso «Carrito» y la acción de volver al carrito. Se revisaron como navegación contextual útil. No se ocultaron los avisos para modificar el resultado.

Estos resultados son observaciones de esas pantallas durante el desarrollo. Después se ajustaron textos de tienda; las capturas finales deben regenerarse sobre el commit y los estados que se entreguen. No se auditó con WAVE cada estado de filtros, errores, revisión, confirmación o cada ancho de pantalla. El puntaje AIM de la herramienta no es la nota académica ni una certificación.

## Repetir la prueba manual de teclado

1. Desactivar WAVE para que sus propios controles no formen parte del recorrido y recargar el inicio.
2. Usar Tab y Shift + Tab para desplazarse, Enter para activar enlaces y botones, Espacio para casillas y flechas para selectores y radios.
3. Completar búsqueda, presupuesto, producto y agregado sin ratón.
4. Completar carrito, modalidad, dirección cuando corresponda, revisión, condiciones y confirmación sin ratón.
5. Provocar errores de formulario, corregirlos y comprobar que el foco permite localizar cada problema.
6. Abrir un diálogo, recorrerlo, cerrarlo con Escape y verificar el retorno al control de origen.

Debe verse el foco y no debe perderse acceso a ninguna acción necesaria. La prueba automatizada de recorrido enfoca controles de forma programática y los activa con teclado; la revisión humana debe comprobar también el orden real completo de Tab.

## Pendientes

### Correcciones de revisión del PR 1

El 3 de noviembre de 2026 se alinearon el origen, la URL de espera y el servidor de Playwright con `http://localhost:5173`, permitido por el backend predeterminado. Para ejecutar manualmente desde `127.0.0.1`, el README explica cómo añadir ese origen a `FRONTEND_ORIGINS` y reiniciar la API.

Se añadieron avisos visibles de simulación sin cobros ni pedidos reales junto a la aceptación, en el diálogo de condiciones y en la confirmación, además del pie académico y el punto de retiro sin recortar. Los casos existentes de domicilio y retiro comprueban esos avisos.

La nueva ejecución en Windows con Edge/Chromium y MySQL 8.0.46 temporal aislado aprobó **34 pruebas: 30 de interfaz y 4 de integración HTTP real**. La API usó su configuración CORS predeterminada. Build y lint también pasaron. La base temporal y la API de comprobación se detuvieron al terminar; no se modificó el servicio MySQL existente. Estos resultados no acreditan una auditoría WAVE actualizada ni pruebas con NVDA o dispositivos físicos.

### Evidencia manual y despliegue

- Ejecutar NVDA en Windows y registrar los anuncios de ambos procesos. Su compatibilidad no se presenta como comprobada.
- Realizar las sesiones con dos grupos y conservar videos, tiempos, errores y citas auténticas.
- Generar capturas anotadas definitivas y comparativas con la web original para las barreras críticas y altas.
- Revisar los criterios A y AA aplicables y completar la matriz de conformidad con evidencia.
- Comprobar zoom, ampliación de texto y movimiento reducido con procedimientos manuales registrados.
- Validar Safari, iOS y Android reales; la emulación Chromium no los sustituye.
- Desplegar y verificar frontend y API si se necesita un enlace accesible para el equipo o la exposición.

Los resultados históricos del backend están en [VERIFICACION.md](VERIFICACION.md). La [guía de arquitectura](FRONTEND.md) describe qué implementa el código y sus límites de persistencia y finalización.
