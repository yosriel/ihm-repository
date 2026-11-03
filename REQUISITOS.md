# Alcance y requisitos de Falabella

Este archivo relaciona los antecedentes APF1 y APF2 con la implementación actual. En `feature/apf3-frontend`, las interfaces ya están desarrolladas en React sobre el backend Spring Boot con MySQL. La [arquitectura frontend](docs/FRONTEND.md) y el [contrato de API](docs/API.md) describen el comportamiento vigente.

## Antecedentes

Las referencias usadas para establecer el caso son:

- `APF1_Falabella_IHM.pptx`.
- `Informe_Avance_I_Falabella_APF1 (1).docx`.
- `Falabella_APF2_Presentacion_Completa.pptx.pdf`.
- `Informe_Final_Falabella_APF2 (1).docx`.

APF2 define los dos procesos y las mejoras previas de filtros, jerarquía de productos, dirección y costos. Sus métricas y revisiones de Figma son antecedentes; no se atribuyen como pruebas de la nueva aplicación.

La [especificación frontend previa](https://github.com/yosriel/ihm-repository/tree/feature-frontend.specification/docs) conserva el diseño propuesto y su matriz de rúbricas. Los cambios de esta rama convierten los recorridos en una interfaz conectada a la API.

## Objetivo

Reducir la carga visual al buscar productos y aclarar vendedor, dirección, modalidad de entrega y costo final. El caso de referencia consiste en encontrar una freidora con presupuesto aproximado de S/ 400 y completar una confirmación simulada.

## Proceso 1 Buscar y seleccionar

| Requisito | Estado actual |
| --- | --- |
| Búsqueda, orden y resultados en una vista | Implementado con parámetros de URL y datos de la API |
| Precio, marca, descuento, calificación, entrega y vendedor | Implementado; selección única por criterio, combinable con otros criterios |
| Filtros secundarios sin duplicación | Capacidad y color dentro del panel de filtros |
| Aplicar, cancelar y quitar filtros | Implementado con borrador, chips y restablecimiento |
| Identificación de vendedor y precio | Visible en tarjetas y ficha |
| Selección, cantidad y agregado | Implementado, con límites y feedback en la ficha |
| Favoritos y comparación | Favoritos del navegador y comparación de hasta tres productos |
| Acceso con teclado y nombres de controles | Implementado y cubierto parcialmente por pruebas automáticas y revisión manual |

El panel lateral de APF2 se sustituyó por herramientas superiores y un diálogo de filtros. La selección de precio ya no depende de un único estado fijo «Hasta S/ 400»: admite límites numéricos del contrato.

## Proceso 2 Carrito y entrega

| Requisito | Estado actual |
| --- | --- |
| Cantidades, eliminación y carrito vacío | Implementado; el carrito se conserva en el navegador |
| Domicilio o retiro | Implementado según la compatibilidad de los productos |
| Distrito, calle, número y referencia | Validación de formato y cobertura, con alternativa sin número |
| Revisión explícita de dirección | Implementada; modificar datos invalida la revisión |
| Corrección de errores | Mensajes por campo y resumen con enlaces |
| Productos, entrega y total separados | Implementado; la cotización válida proviene del servidor |
| Condiciones antes del cierre | Casilla sin marcar inicialmente y acción habilitada tras cumplir requisitos |
| Finalización y recuperación | Respuesta de `/checkout/simulate`, clave idempotente y carrito conservado ante fallo |

El botón visible «Confirmar compra» mantiene el cierre simulado. La revisión de dirección confirma lo escrito; no utiliza un servicio geográfico. La interfaz no solicita tarjetas ni ejecuta cobros.

## Importes de referencia

Estos importes corresponden a los datos iniciales del catálogo y al escenario Taurus; el frontend utiliza los valores vigentes de la API.

| Unidades | Modalidad | Productos | Entrega | Total |
| ---: | --- | ---: | ---: | ---: |
| 1 | Domicilio | S/ 389.00 | S/ 12.90 | S/ 401.90 |
| 1 | Retiro | S/ 389.00 | S/ 0.00 | S/ 389.00 |
| 2 | Domicilio | S/ 778.00 | S/ 12.90 | S/ 790.90 |
| 2 | Retiro | S/ 778.00 | S/ 0.00 | S/ 778.00 |

## Límites de la implementación

- MySQL almacena catálogo y simulaciones. Carrito y favoritos pertenecen al navegador; dirección y comparación se mantienen en memoria.
- No hay cuentas, autenticación, sincronización entre dispositivos, geocodificación ni pagos reales.
- Precios, valoraciones, stock y fotografías corresponden al catálogo de demostración; no establecen condiciones comerciales de Falabella.
- La interfaz tiene distribución de escritorio y móvil. La cobertura por tamaño y sus límites están en [VERIFICACION_FRONTEND.md](docs/VERIFICACION_FRONTEND.md).
- NVDA, sesiones de usuarios y evidencia académica completa siguen pendientes. La aplicación no declara conformidad WCAG completa.
