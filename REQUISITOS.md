# Alcance del prototipo Falabella IHM

Este archivo conserva el resumen de las referencias APF1 y APF2. Esta rama desarrolla **solo backend con Spring Boot y MySQL**; el rediseño de interfaces se versiona por separado en [la entrega frontend](https://github.com/yosriel/ihm-repository/blob/codex/feature-frontend-specification/docs/ENTREGA_FRONTEND.md). Su [matriz de rúbricas](https://github.com/yosriel/ihm-repository/blob/codex/feature-frontend-specification/docs/MATRIZ_RUBRICAS.md) incorpora APF1, APF2 y R3. Las funcionalidades visuales de esta lista siguen pendientes de implementación; sus operaciones de catálogo, cotización y simulación ya tienen soporte en el [contrato de API](docs/API.md).

## Fuentes

Archivos originales, conservados en el escritorio del usuario:

- `APF1_Falabella_IHM.pptx`.
- `Informe_Avance_I_Falabella_APF1 (1).docx`.
- `Falabella_APF2_Presentacion_Completa.pptx.pdf`.
- `Informe_Final_Falabella_APF2 (1).docx`.

APF2 describe la propuesta más reciente. APF1 aporta antecedentes y recomendaciones de usabilidad. Las rúbricas e instrucciones de exposición contenidas en esos archivos se tratan como material de referencia.

## Objetivo

Reducir la carga visual al buscar productos y aclarar vendedor, dirección, modalidad de entrega y costo final. El caso principal consiste en encontrar una freidora con un presupuesto aproximado de S/ 400 y completar una simulación de compra.

## Recorrido de búsqueda y selección

- Mantener búsqueda, ordenamiento y resultados en una misma vista.
- Mostrar seis filtros principales: Precio, Marca, Descuento, Calificación, Tipo de entrega y Vendedor.
- Agrupar filtros secundarios bajo «Más filtros» y evitar atributos duplicados.
- Permitir aplicar, cambiar y cancelar un presupuesto desde un panel lateral, manteniendo visible el catálogo. El ejemplo ofrece «Hasta S/ 400» y «Sin límite de precio» y muestra dos resultados al filtrar.
- Organizar las tarjetas con imagen amplia y posiciones consistentes para nombre, vendedor y precio; dar menor énfasis a valoración y precio anterior.
- Mostrar confirmación de cantidad y precio al agregar un producto y ofrecer «Ver carro» y «Seguir explorando».
- Incorporar reversibilidad de filtros, etiquetas, foco visible y navegación con teclado como criterios de diseño.

Referencias: informe APF2, criterios 3 y 4 y figuras 1, 3, 4 y 5; presentación APF2, páginas 15–18. Las recomendaciones de vendedor y reversibilidad también aparecen en APF1.

## Recorrido de carrito y entrega

- Permitir modificar cantidades, eliminar productos y mostrar el carrito vacío. Conservar cantidades al navegar.
- Ayudar a completar dirección y referencia; ofrecer «Dirección sin número» y una confirmación de ubicación.
- Mostrar un error específico para una dirección inválida y deshabilitar la confirmación hasta corregirla; comunicar el error también con texto.
- Permitir elegir entrega a domicilio o retiro, conservando modalidad y costos al avanzar.
- Separar productos, entrega y total en el resumen.
- Mantener «Finalizar simulación» deshabilitado hasta aceptar las condiciones y mostrar después un cierre académico.

Referencias: informe APF2, figuras 6–10 y apartado de verificación manual; presentación APF2, páginas 19–23.

## Datos de ejemplo

Los siguientes importes pertenecen a la simulación descrita en APF2. No representan tarifas generales ni precios vigentes de Falabella.

| Cantidad de freidoras Taurus | Modalidad | Productos | Entrega | Total |
| ---: | --- | ---: | ---: | ---: |
| 1 | Domicilio | S/ 389.00 | S/ 12.90 | S/ 401.90 |
| 1 | Retiro | S/ 389.00 | S/ 0.00 | S/ 389.00 |
| 2 | Domicilio | S/ 778.00 | S/ 12.90 | S/ 790.90 |
| 2 | Retiro | S/ 778.00 | S/ 0.00 | S/ 778.00 |

Referencia: informe APF2, «Cantidades y costos de la simulación»; presentación APF2, página 23. El modelo exacto de la freidora no queda identificado en el texto extraído.

## Límites y decisiones pendientes

El alcance documentado usa datos ficticios y cierre simulado, sin cobros ni pedidos reales. La versión principal es de escritorio; el checkout móvil completo y la accesibilidad necesitan desarrollo y validación adicionales.

Los documentos no definen una base de datos ni una arquitectura de API. La decisión del usuario establece ahora MySQL: se almacenan catálogo y simulaciones; carrito, favoritos y comparación corresponden al estado del futuro frontend. No hay cuentas ni autenticación en esta etapa. El límite de dos unidades y las seis zonas de domicilio se usan como reglas de la demostración, sin convertirlas en políticas comerciales generales. La validación de dirección comprueba formato, sin proveedor de geocodificación.

Los resultados de evaluación incluidos en APF1 y APF2 corresponden a sus antecedentes académicos. No son pruebas realizadas sobre esta nueva aplicación.
