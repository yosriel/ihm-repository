# Entrega al equipo frontend de Falabella IHM

Fecha de corte: 2 de noviembre de 2026.

Este archivo reúne la especificación completa para implementar el frontend en React. Incluye rediseño de pantallas, comportamiento responsive y multiplataforma, accesibilidad, contrato real del backend Spring Boot con MySQL, criterios de aceptación y relación con las rúbricas APF1, APF2 y R3. Se puede compartir como un único Markdown.

El desarrollo de esta etapa corresponde al backend. Las pantallas descritas están pendientes de implementación por el equipo frontend. No se han ejecutado sobre ellas auditorías automáticas, NVDA ni pruebas con usuarios.

Este documento es una instantánea de la guía, API y matriz del repositorio en la fecha indicada. Ante una nueva versión del backend, revisar el contrato actualizado antes de integrar. Las fotografías son opcionales: se incluyen sus fuentes originales para que el archivo sea útil sin copiar los assets locales.

- [Guía de rediseño e implementación](#guia)
- [Contrato de API](#contrato-api)
- [Trazabilidad de rúbricas](#rubricas)
- [Fotografías referenciales](#imagenes)

<a id="guia"></a>

## Guía de rediseño e implementación

Documento de entrega al equipo frontend. Fecha: 2 de noviembre de 2026.

Esta guía define la experiencia que se implementará con React sobre el backend Spring Boot y MySQL de este repositorio. El alcance actual entrega **backend y documentación**: las interfaces descritas aquí son especificaciones para el equipo frontend y no se presentan como pantallas ya programadas, probadas o publicadas.

El propósito es reconstruir la experiencia de búsqueda y preparación de compra de Falabella con una organización claramente distinta de la propuesta APF2, manteniendo el caso y sus dos procesos: encontrar y seleccionar una freidora; revisar el carrito, configurar la entrega y comprender el total. El cierre seguirá siendo una simulación académica, sin cobro, datos de tarjeta ni pedido comercial real.

El [contrato de API](#contrato-api) es la fuente única para rutas, métodos, estructuras de datos, restricciones, errores y configuración de conexión. Esta guía no replica ejemplos JSON ni inventa operaciones fuera de ese contrato. La [matriz de rúbricas](#rubricas) contiene criterios, pesos, fuentes y evidencia académica pendiente. Las tres piezas están reunidas en este archivo.

### 1. Dirección del rediseño

El nuevo diseño cambia la arquitectura de las pantallas, la jerarquía de la información y la continuidad de las tareas. Una variación de color o tamaño sobre el APF2 no alcanza este objetivo.

| Área | Decisión para la nueva interfaz | Cómo reconocer el cambio |
| --- | --- | --- |
| Inicio | Composición editorial con una propuesta principal, búsqueda prominente y selección breve de productos | No reproduce el antiguo catálogo con filtros como pantalla de bienvenida |
| Catálogo | Cuadrícula de ancho completo y herramientas en la parte superior | No hay una barra lateral permanente que reste espacio a los productos |
| Filtros | Resumen de filtros activos, seis accesos prioritarios y un panel accesible para editar opciones | El catálogo sigue siendo la referencia de la tarea y los cambios se pueden revertir |
| Producto | Imagen amplia y bloque de decisión con vendedor, entrega y precio | Las promociones secundarias no compiten con la compra |
| Comparación | Atributos relevantes alineados en escritorio y comparación por secciones en móvil | No exige recordar datos entre tarjetas ni desplazar una tabla horizontalmente |
| Carrito | Edición directa, opciones de entrega comprensibles y resumen legible | Cantidad, vendedor y costo se distinguen sin abrir pantallas adicionales |
| Entrega y revisión | Recorrido en pasos con formulario, revisión explícita de dirección y total confirmado | Los errores se corrigen junto al campo y el usuario sabe qué falta para continuar |
| Finalización | Cierre académico con alcance claro y resultado del backend | No se representa un pago real ni se simula éxito cuando falla la conexión |

El lenguaje conserva «Vendido por», «Entrega a domicilio», «Retiro» y «Total». Las decisiones sobre disponibilidad, precio, stock y límites provienen de la API. Los valores históricos de APF2 sirven como referencia de la demostración, no como importes que el frontend deba imponer.

### 2. Sistema visual

| Token | Valor propuesto | Uso |
| --- | --- | --- |
| Forest | `#213e31` | Texto principal, navegación, botones principales y bordes de foco cuando contrasten con el fondo |
| Lime | `#c8e87f` | Acentos, selecciones y superficies breves con texto oscuro |
| Cream | `#f7f7f2` | Fondo general |
| Surface | `#ffffff` | Formularios y superficies de lectura |
| Muted | Verde grisáceo oscuro por definir y medir | Texto secundario que conserve contraste suficiente |
| Border | Verde grisáceo claro por definir y medir | Separación de secciones; no usarlo como único indicador del estado |
| Error | Rojo oscuro por definir y medir | Mensaje e icono de error; acompañado de texto |
| Radio de superficie | 16 px | Paneles, imágenes y bloques del resumen |
| Escala de espacio | 4, 8, 12, 16, 24, 32, 48 y 64 px | Ritmo consistente; mayor separación entre decisiones distintas |
| Ancho de contenido | Aproximadamente 1280 px como máximo | Centrar en pantallas grandes, con márgenes laterales fluidos |

Usar una familia sans serif legible con pesos y tamaños consistentes. El texto de formulario y el cuerpo principal parten de 16 px. Evitar textos pequeños para vendedor, entrega o errores. Los títulos editoriales pueden ser amplios, pero deben permitir el salto de línea y no desplazar la acción principal fuera de contexto.

La estética combina fondo crema, tipografía oscura, fotografía de producto, espacio disponible y acentos lima. Las tarjetas no necesitan sombra intensa ni múltiples sellos. Un botón principal debe distinguirse por jerarquía y texto, además del color. Medir todas las combinaciones finales: elegir estos tokens no acredita automáticamente contraste WCAG.

Los controles tendrán un área de interacción recomendada de al menos 44 por 44 px, con separación suficiente. Es una decisión de usabilidad de este proyecto; no atribuir este mínimo al nivel AA de WCAG 2.1. El criterio de tamaño de objetivo 2.5.5 pertenece a AAA en esa versión.

### 3. Arquitectura de navegación

Estas rutas de interfaz son propuestas de organización, no endpoints del backend.

| Ruta propuesta | Pantalla | Propósito y salida principal |
| --- | --- | --- |
| `/` | Inicio | Iniciar búsqueda o explorar freidoras |
| `/catalogo` | Catálogo | Buscar, filtrar, ordenar y abrir un producto |
| `/comparar` | Comparación | Comparar una selección de hasta tres productos |
| `/producto/:slug` | Ficha de producto | Entender condiciones y agregar al carrito |
| `/favoritos` | Favoritos | Recuperar productos guardados en este dispositivo o sesión |
| `/carrito` | Carrito | Revisar productos, cantidades y continuar con entrega |
| `/entrega` | Entrega | Elegir modalidad y revisar los datos necesarios |
| `/resumen` | Revisión | Consultar el total del backend y aceptar el cierre simulado |
| `/confirmacion` | Confirmación | Mostrar el resultado confirmado de la simulación |

La cabecera comparte marca, búsqueda, acceso a favoritos y carrito con contador. En escritorio puede incluir una navegación corta de categorías. En móvil, la búsqueda ocupa una fila propia y el menú secundario se abre con un control identificado. No mostrar accesos a cuenta, seguimiento o categorías que no tengan un recorrido implementado; no dejar botones decorativos con apariencia de acciones disponibles.

Los parámetros de búsqueda, filtros y orden deben conservarse en la URL cuando sea razonable, para permitir volver, recargar y compartir la vista. No incluir direcciones ni otros datos personales en parámetros. Al volver de una ficha, restaurar la selección, la posición de la lista y el foco útil si siguen siendo válidos.

El carrito, la entrega y la revisión comparten un indicador de pasos: **1 Carrito, 2 Entrega, 3 Revisión**. Indicar el paso actual en texto y semántica; los pasos anteriores accesibles permiten regresar sin perder datos. El resultado final puede mostrar todos los pasos completados sin ofrecer una vuelta engañosa a una operación ya cerrada.

### 4. Inicio

La primera pantalla debe establecer qué se puede hacer y llevar a una tarea concreta. Proponer un bloque editorial con título breve, texto de apoyo y una acción «Explorar freidoras», acompañado de una fotografía o composición de producto. La búsqueda debe tener etiqueta accesible y permitir enviar con Enter.

Debajo, presentar una selección pequeña y real del catálogo, seguida de orientación para comparar precio, vendedor y entrega. Evitar carruseles automáticos, banners que tapen el contenido y mensajes comerciales sin respaldo, como «envío gratis» para todos los productos.

Una búsqueda enviada desde el inicio abre el catálogo con el término visible y editable. Si la búsqueda está vacía, indicar cómo continuar o abrir el catálogo completo; no generar una página sin explicación. El inicio no necesita mostrar todos los filtros ni reproducir la densidad de resultados.

**Aceptación verificable**

- La persona encuentra la búsqueda y la acción principal sin abrir un menú.
- Enter ejecuta la búsqueda una sola vez y conserva el término en el catálogo.
- Productos destacados muestran datos de la API y permiten abrir su ficha.
- Una carga fallida permite reintentar; no se presentan precios locales inventados como datos vigentes.

### 5. Catálogo, búsqueda y filtros

La parte superior contiene título, término buscado, cantidad de resultados y control de orden. Los seis filtros iniciales son **Precio, Marca, Descuento, Calificación, Tipo de entrega y Vendedor**. Los atributos secundarios se agrupan en «Más filtros» y se eliminan duplicados semánticos.

La API actual admite una selección por criterio en cada solicitud. Usar radios o selectores únicos dentro de cada grupo; no implementar casillas de selección múltiple para marcas u otros criterios sin ampliar antes el contrato. Los criterios distintos sí se pueden combinar.

Usar una fila de controles que pueda organizarse en varias líneas. No obligar a desplazar horizontalmente las opciones. La cuadrícula aprovecha el ancho disponible; no conserva una columna lateral fija del diseño anterior.

En móvil, «Filtrar» abre un panel modal accesible con título, cierre, grupos de opciones, selección en borrador y acciones claras «Aplicar filtros» y «Cancelar». Puede ocupar casi toda la pantalla. En escritorio se puede reutilizar ese panel o abrir filtros concretos en un panel contextual, manteniendo una experiencia coherente y accesible.

El panel mueve el foco a su título o primer control relevante, mantiene el foco dentro mientras sea modal, cierra con Escape y devuelve el foco al botón que lo abrió. El contenido del fondo queda fuera de la interacción durante su apertura. No anidar modales. Cada grupo tiene nombre, cada opción una etiqueta y cada estado seleccionado una representación que no dependa solo del color.

«Aplicar filtros» actualiza resultados y cierra el panel. «Cancelar» descarta solo el borrador de esa apertura. Cerrar con Escape o con el botón de cierre debe seguir esa misma regla, sin modificar silenciosamente el catálogo. Los filtros aplicados se muestran como chips con una acción de quitar identificada, por ejemplo «Quitar filtro Marca Taurus», y existe «Limpiar filtros».

Al cambiar los filtros, anunciar de forma breve la actualización o la nueva cantidad de resultados sin mover el foco de manera inesperada. Si hay solicitudes concurrentes, ignorar respuestas antiguas. El orden cambia realmente la lista conforme al contrato; no presentar opciones que no tengan comportamiento.

**Tarjeta de producto**

El orden visual es imagen, marca y nombre, vendedor, entrega y precio principal. Precio anterior y descuento se muestran solo si los datos los justifican. La calificación incluye una descripción textual y el número de opiniones cuando exista en la respuesta. Evitar que estrellas, iconos o distintivos repitan información innecesaria al lector de pantalla.

La tarjeta ofrece abrir la ficha, guardar en favoritos y seleccionar para comparar. Si permite agregar directamente al carrito, debe conservar la misma validación y feedback que la ficha. No anidar botones dentro de un enlace que cubra toda la tarjeta. Cada control necesita un nombre que incluya el producto cuando el contexto no lo identifique suficientemente.

**Aceptación verificable**

- Combinar filtros reduce el conjunto esperado; quitar uno conserva los demás.
- Cancelar el panel no cambia los filtros aplicados.
- «Limpiar filtros» restablece todos los criterios y actualiza resultados.
- Una búsqueda sin coincidencias conserva término y filtros, explica la situación y permite corregir o limpiar.
- La respuesta vacía se distingue de un error de red.
- Abrir y cerrar el panel funciona con teclado y devuelve el foco al origen.
- Volver desde una ficha recupera la vista de resultados sin perder la tarea.

### 6. Comparación

La selección de comparación admite hasta tres productos como decisión de alcance de esta propuesta. Un estado persistente indica cuántos hay seleccionados y permite abrir «Comparar». Seleccionar un cuarto explica el límite y permite quitar otro; no borra una selección de manera silenciosa.

La pantalla compara imagen y nombre, precio, vendedor, capacidad, calificación, disponibilidad y modalidad de entrega, únicamente cuando esos datos existan. Las diferencias pueden destacarse con texto o un indicador adicional. Cada producto conserva acciones para ver ficha, guardar y quitar de la comparación.

En escritorio, alinear atributos entre columnas. En móvil, organizar secciones por atributo con los nombres de producto asociados a cada valor o fichas de comparación claramente rotuladas. No comprimir tres columnas hasta hacerlas ilegibles ni introducir una tabla con desplazamiento horizontal. Mantener relaciones semánticas comprensibles en el formato elegido.

Con cero productos, ofrecer volver al catálogo. Con uno, mostrarlo y orientar a elegir otro, sin fingir una comparación. Quitar un producto mantiene los restantes y anuncia el cambio. Los identificadores deben resolver contra el catálogo vigente; si un producto deja de existir, avisar y permitir retirarlo.

### 7. Ficha de producto

El bloque principal reúne una imagen de buena calidad, marca, nombre, precio, vendedor y opciones de entrega. A continuación se presentan características en una lista legible. No usar una lista de atributos decorativa si el backend no entrega esos datos.

«Vendido por» debe ser visible antes del agregado. Un enlace o desplegable «Sobre este vendedor» explica de forma breve las condiciones disponibles y su origen. No inventar garantías, reputación o políticas. Si el catálogo no contiene una condición concreta, señalar que la información no está disponible en esta demostración o no ofrecer una afirmación comercial.

La cantidad respeta stock y límite del producto según la API. Deshabilitar acciones imposibles con explicación próxima. Ante falta de disponibilidad, mostrar «No disponible» y permitir seguir explorando. El frontend no será la única validación: debe tratar los rechazos del backend como resultados posibles.

Agregar al carrito informa producto y cantidad junto a la acción, actualiza el contador y ofrece «Ver carrito» y «Seguir explorando». Mantener la ficha visible; no mostrar una pantalla aislada solo para confirmar el agregado. Prevenir duplicados por una acción en curso y ofrecer feedback si se alcanza el límite.

Los controles de favoritos y comparación reflejan el estado compartido. Abrir la ficha desde comparación o favoritos no debe eliminar esas selecciones. Una imagen fallida se sustituye por una alternativa sobria con nombre de producto, sin deformar el diseño.

### 8. Favoritos

Mostrar productos guardados con la misma información esencial del catálogo y una acción identificada para quitar cada uno. Conservar el estado al navegar y volver. Si la persistencia es solo del dispositivo, indicarlo de forma comprensible; no prometer sincronización con una cuenta inexistente.

Al quitar, anunciar el resultado y mantener el foco en una posición útil, como el siguiente producto o el título del estado vacío. Puede ofrecerse deshacer si se implementa de forma coherente. No confundir eliminar de favoritos con eliminar del carrito.

El estado vacío ofrece una explicación breve y «Explorar productos». Los precios y la disponibilidad se actualizan desde la API; guardar un producto no congela sus condiciones comerciales.

### 9. Carrito

Cada línea muestra imagen, nombre, vendedor, precio unitario, cantidad, importe de línea y acción de eliminar. Los controles de cantidad tienen nombres específicos, estados límite y separación suficiente respecto de eliminar. El total de unidades de la cabecera debe coincidir con la suma de cantidades, no con el número de tipos de producto.

En escritorio, las líneas ocupan la columna principal y el resumen una columna secundaria. En móvil, disponer ambos bloques en el flujo vertical; no superponer un panel al contenido ni ocultar controles con una barra fija. La acción principal es «Continuar con la entrega».

El resumen distingue productos y entrega. Antes de consultar el cálculo final, cualquier importe provisional debe estar identificado como estimación. No mostrar «Total confirmado» para una suma calculada solo en el cliente. Si la entrega depende de la modalidad que todavía no se eligió, expresar «Se confirma al elegir la entrega» en lugar de asumir gratuidad.

Cambiar cantidad conserva los demás productos. Al eliminar, actualizar importes y contador; si hay deshacer, restaurar la cantidad dentro de los límites vigentes. El carrito vacío explica qué ocurrió, anuncia el estado y ofrece volver al catálogo. Las pantallas de entrega y revisión deben detectar un carrito vacío y orientar al usuario.

**Aceptación verificable**

- Aumentar y disminuir cambia una sola línea y actualiza cantidades e importes coherentes.
- Los límites se comunican sin provocar cantidades inválidas ni peticiones repetidas.
- Eliminar el último producto lleva al estado vacío y bloquea continuar al checkout.
- Regresar desde entrega conserva las cantidades y productos válidos.
- Un cambio de precio o stock recibido de la API se comunica antes del cierre.

### 10. Entrega y dirección

Presentar tarjetas de selección con controles radio para «Entrega a domicilio» y «Retiro». Sus costos y disponibilidad deben corresponder al contrato y al contenido del carrito. Si cualquier producto solo admite domicilio, deshabilitar retiro con una explicación visible y asociada, sin esperar al último paso para revelar la incompatibilidad.

El retiro solo debe describir un punto o condición que exista en el alcance del backend. No inventar sucursales, horarios o reservas. Si se trata de un escenario académico, nombrarlo como tal. Seleccionar retiro no exige una dirección domiciliaria si el contrato no la requiere.

Para domicilio, el formulario incluye distrito, calle o avenida, número, alternativa «Dirección sin número» y referencia opcional. Las opciones de distrito y las restricciones de longitud/formato deben seguir [API.md](#contrato-api). No mantener listas que contradigan el backend. Si no hay una operación para consultar opciones, el equipo debe usar el mecanismo documentado en el contrato, sin inventar un endpoint.

Cada campo tiene etiqueta visible, ayuda cuando sea necesaria, indicación de obligatoriedad y mensaje de error específico. Validar al perder el foco y al intentar continuar. No marcar errores mientras la persona apenas empieza a escribir. Al corregir un campo con error, actualizar su estado de manera oportuna sin reiniciar el formulario.

La opción sin número elimina la obligatoriedad del número y evita enviar un valor contradictorio. No excluir domicilios sin numeración. No aceptar un texto genérico como dirección geográficamente comprobada solo porque supera una longitud mínima.

Al enviar un formulario inválido, mostrar y enfocar un resumen de errores con enlaces a los campos afectados. Asociar ayuda y error al control y anunciar el estado inválido. Conservar todos los datos válidos. Un rechazo de la API debe poder incorporarse al campo correcto cuando el contrato lo identifique; los errores generales se muestran cerca de la acción con una opción de reintento.

**Revisión explícita de la dirección**

La acción «Revisar dirección» presenta una versión formateada de los datos y permite «Editar» o «Usar esta dirección». El texto explica que se está revisando lo escrito. No mostrar un mapa decorativo, un pin arbitrario o un sello «Dirección verificada» si no existe una integración geográfica real.

Solo habilitar el paso a revisión cuando la modalidad sea compatible y, en domicilio, los datos sean válidos y la dirección haya sido aceptada en ese estado. Editar calle, distrito, número o referencia invalida la aceptación anterior. Cambiar de modalidad también obliga a revisar las condiciones vigentes, conservando la dirección por si se vuelve a domicilio.

La dirección se mantiene al regresar entre pasos durante la sesión. No guardarla en almacenamiento persistente del navegador ni en la URL por defecto. Un refresh puede requerir recuperarla de forma segura conforme al contrato o introducirla otra vez; explicar ese caso sin simular que sigue revisada.

**Aceptación verificable**

- Campos vacíos o inválidos producen mensajes accionables y enlaces de corrección.
- La persona puede completar un domicilio sin número.
- El control de continuar no permite omitir requisitos de dirección o modalidad.
- Cambiar un dato después de revisarlo obliga a revisarlo de nuevo.
- Volver al carrito y regresar no borra la dirección introducida durante la misma sesión.
- La pantalla nunca confunde validación de formato con verificación geográfica.

### 11. Revisión y cierre simulado

La revisión reúne productos y cantidades, vendedor, modalidad elegida, dirección cuando corresponda y desglose final de productos, entrega y total. Cada bloque editable incluye una acción para volver al paso adecuado sin perder el resto del trabajo.

Solicitar el cálculo al backend según [API.md](#contrato-api). Durante la carga, mantener el contexto y mostrar «Confirmando el total…». Solo se permite finalizar con una respuesta válida correspondiente al carrito y la modalidad actuales. Si cambian esos datos, invalidar el cálculo anterior y solicitar uno nuevo. Ignorar respuestas tardías de solicitudes anteriores.

En un fallo, conservar los productos y mostrar «No pudimos confirmar el total. Inténtalo de nuevo». Ofrecer reintentar y volver a editar. Una estimación local puede ayudar a entender el contexto si está rotulada, pero no habilita el cierre ni reemplaza una respuesta del backend.

El acceso directo a `/resumen` debe comprobar requisitos. Si falta carrito, modalidad compatible o dirección revisada, explicar qué falta y ofrecer el enlace correspondiente. No confiar únicamente en que el botón anterior estuviera deshabilitado.

La aceptación de condiciones se hace con una casilla sin marcar inicialmente. Junto a ella, un acceso «Ver condiciones de la simulación» abre un diálogo accesible con título, cierre y foco gestionado. Debe explicar en lenguaje sencillo que se usarán datos de demostración, que no se realizará un cargo y que no se tramitará un pedido comercial. No incluir un formulario de tarjeta para simular una integración inexistente.

La acción principal es «Finalizar simulación». Está deshabilitada hasta que se acepte el alcance y el total sea válido. Mientras se procesa, cambiar a «Finalizando…», anunciar el estado y bloquear envíos repetidos. No borrar el carrito al iniciar la petición.

El cliente genera una clave UUID de idempotencia para esa finalización y la conserva al reintentar la misma carga, según el contrato. Cambiar productos, cantidades, modalidad o dirección inicia otro intento lógico y requiere una clave nueva. El bloqueo visual del botón no reemplaza esta protección del backend.

Un error de conexión o del backend conserva el carrito y presenta un reintento. Si el error identifica un dato inválido, ofrecer volver a corregirlo y quitar su estado de revisión cuando corresponda. No mostrar una animación de éxito ni una confirmación ficticia por un timeout.

### 12. Confirmación

La confirmación solo se muestra tras recibir una respuesta de éxito válida del backend. Antes de vaciar el carrito activo, guardar el resultado que alimentará esta pantalla. Su identificador y desglose proceden de la API, no de un generador independiente del cliente.

Mostrar un símbolo de finalización acompañado del título «Simulación completada», identificador, cantidad y total de la respuesta. Incluir «No se realizó ningún cobro ni se envió un pedido real» y una acción «Seguir explorando». El icono no sustituye el texto ni debe anunciarse dos veces si es decorativo.

El resultado no representa una reserva de stock, entrega contratada o transacción financiera salvo que el contrato indique expresamente otra cosa. Si una recarga o acceso directo no permite recuperar un resultado válido, mostrar «No hay una simulación disponible para mostrar» con una salida útil; no reconstruir una confirmación a partir de un carrito vacío.

### 13. Componentes y estados compartidos

| Componente | Responsabilidad | Estados necesarios |
| --- | --- | --- |
| Cabecera y navegación | Buscar y acceder a colecciones/carrito | Navegación abierta/cerrada; contador actualizado; foco visible |
| Búsqueda | Introducir, enviar y corregir término | Vacía, escrita, cargando, sin coincidencias, error |
| Tarjeta y ficha de producto | Presentar decisión comercial y acciones | Disponible, sin stock, imagen fallida, favorito, comparación, agregado |
| Panel de filtros | Editar un borrador accesible | Abierto, cerrado, selección temporal, aplicado, cancelado |
| Chips y resumen de filtros | Explicar y revertir criterios | Seleccionado, eliminado, restablecido |
| Selección de comparación | Mantener hasta tres productos | Vacía, una selección, lista para comparar, límite alcanzado |
| Cantidad y línea de carrito | Editar sin perder el contexto | Mínimo, máximo, actualización, eliminación, rechazo de stock |
| Aviso de estado | Confirmar acciones y errores | Informativo, éxito, error; acción contextual cuando exista |
| Selector de entrega | Elegir una modalidad compatible | Seleccionada, disponible, incompatible con explicación |
| Campo de formulario | Etiqueta, ayuda y validación | Inicial, editado, válido, inválido, no aplicable |
| Resumen de errores | Agrupar y enlazar correcciones | Oculto sin errores; visible y enfocado tras intento inválido |
| Resumen de compra | Desglosar productos, entrega y total | Estimación rotulada, cálculo en curso, confirmado, desactualizado, error |
| Diálogo de condiciones | Mostrar alcance sin perder la tarea | Abierto/cerrado, foco contenido, cierre y retorno al origen |
| Botón de acción | Ejecutar una intención clara | Normal, hover, foco, deshabilitado, ocupado |
| Estado vacío o de fallo | Explicar situación y siguiente paso | Sin productos, sin favoritos, sin comparación, no encontrado, fallo recuperable |

Los anuncios deben ser proporcionales: un cambio de cantidad puede usar una región de estado discreta; un fallo que impide continuar necesita mayor prioridad. No anunciar toda la página después de cada selección. Los avisos importantes deben permanecer el tiempo necesario o quedar disponibles junto al elemento afectado.

### 14. Comportamiento responsive

No basta reducir la versión de escritorio. Verificar cada recorrido en 360, 390, 768, 1024 y 1440 px de ancho, incluyendo errores y textos largos. Estos tamaños son puntos de prueba; el diseño debe comportarse también entre ellos.

| Ancho de referencia | Catálogo y navegación | Comparación y formularios | Carrito y revisión |
| --- | --- | --- | --- |
| 360 px | Márgenes de 16 px; búsqueda en fila propia; herramientas en varias filas; una tarjeta por fila como base legible | Filtros en panel modal; comparación apilada; campos en una columna | Líneas apiladas; resumen y CTA dentro del flujo; pasos compactos con texto completo |
| 390 px | Misma estructura móvil; aprovechar espacio adicional sin disminuir legibilidad | Etiquetas y errores envuelven; cierre del panel siempre alcanzable | Precio, cantidad y eliminar tienen espacios distintos; total sin recorte |
| 768 px | Cabecera compacta; dos tarjetas por fila cuando el contenido quepa | Panel adaptado al ancho; formularios pueden agrupar campos relacionados sin alterar el orden | Resumen bajo las líneas o columna solo si conserva ancho útil; no forzar escritorio |
| 1024 px | Navegación de escritorio y tres tarjetas por fila como referencia | Comparación en columnas legibles; formulario principal y ayuda breve | Dos columnas para contenido y resumen; el resumen no tapa el pie ni el foco |
| 1440 px | Contenido centrado con máximo aproximado de 1280 px; hasta cuatro tarjetas por fila | Espacio editorial e imágenes amplias sin estirar textos | Resumen lateral proporcionado; lectura cómoda y acciones próximas a los datos |

En cualquier ancho, las filas se pueden envolver y las columnas deben poder contraerse. Aplicar cortes a identificadores largos sin perder acceso al valor completo cuando sea necesario. Las imágenes conservan proporción. No usar anchos rígidos que excedan el contenedor ni ocultar el desbordamiento para disimular contenido cortado.

No debe aparecer scroll horizontal en los anchos de prueba, ni en filtros, tablas, stepper, formularios o confirmaciones. Comprobar además zoom y reflow conforme a la auditoría de accesibilidad. Los elementos fijos o pegajosos, si se usan, deben reservar espacio y no ocultar contenido, acciones, mensajes o foco.

Añadir una comprobación de reflow a 320 px CSS, zoom de texto al 200 % y zoom de página al 400 % en un escritorio de 1280 px. Revisar también orientación vertical y horizontal, teclado virtual, áreas seguras del dispositivo y campos con textos largos. No fijar una altura que impida leer errores al abrirse el teclado.

La matriz de compatibilidad del equipo debe incluir Chrome y Edge en Windows, Firefox de escritorio, Safari en iOS y Chrome en Android. La emulación de viewport comprueba distribución, pero no acredita funcionamiento en un dispositivo o navegador que no se haya probado. Registrar versiones y distinguir pruebas en dispositivos reales de emulación. Si no se dispone de una plataforma, dejarla pendiente con su alcance concreto.

### 15. Teclado y accesibilidad

La meta es WCAG 2.1 AA en ambos procesos completos. Esta guía no declara conformidad ni una auditoría realizada. La [matriz](#rubricas) relaciona la preparación técnica con los requisitos académicos y sus pendientes.

- Estructurar cabecera, navegación, contenido principal y pie; usar encabezados en orden y un enlace visible al recibir foco para saltar al contenido.
- Usar enlaces para navegar, botones para acciones, controles de formulario nativos y nombres accesibles coherentes con el texto visible.
- Permitir completar ambos procesos con Tab, Shift+Tab, Enter, Espacio y las teclas habituales de los controles. No crear interacciones que dependan únicamente de hover, arrastre o puntería precisa.
- Mantener un indicador de foco claramente visible y un orden que siga la lectura. Al cambiar de pantalla, orientar al título; al volver a una lista o cerrar un panel, restaurar un foco útil y predecible.
- Gestionar foco, cierre y fondo inactivo en diálogos. No permitir trampas de teclado ni llevar el foco a controles ocultos.
- Proporcionar etiquetas, instrucciones y errores asociados a los campos. El resumen de errores debe llevar a una corrección concreta.
- Medir contraste de texto, iconos funcionales, bordes y estados. No depender solo de color para selección, error o disponibilidad.
- Dar texto alternativo útil a fotografías de producto. Los iconos puramente decorativos no necesitan una segunda descripción que repita el texto contiguo.
- Anunciar resultados, cambios de carrito y estados de solicitudes sin provocar anuncios excesivos. Revisar nombres, roles y valores con lector de pantalla.
- Permitir zoom, cambio de tamaño y ajuste de texto sin perder datos o controles. Respetar la preferencia de movimiento reducido y evitar animaciones que dificulten la tarea.
- Si se incorporan videos o audio, evaluar los criterios aplicables y proporcionar las alternativas necesarias. Si no existen medios, documentar la no aplicabilidad con su razón; no inventar un hallazgo audiovisual.

No confundir una herramienta sin errores automáticos con conformidad completa. Registrar los resultados de las herramientas realmente ejecutadas y las comprobaciones manuales. No marcar NVDA, WAVE, grupos de usuarios o contraste como verificados por haber escrito atributos o definido colores.

### 16. Integración con Spring Boot y MySQL

El frontend consume la API de Spring Boot. La conexión a MySQL, credenciales, consultas y migraciones pertenecen al backend. Nunca incluir usuario, contraseña o acceso directo a la base de datos en el navegador, variables públicas del frontend o solicitudes del cliente.

Obtener productos, condiciones y resultados según [API.md](#contrato-api). No duplicar las estructuras de respuesta en este documento. Configurar la URL del servicio conforme al entorno documentado y evitar direcciones de desarrollo rígidas dentro de las pantallas.

Los precios y el stock de este proyecto son **datos de demostración**. El producto debe comunicarlo de forma breve y comprensible, por ejemplo en una nota de alcance del catálogo o del cierre. No mostrar a la persona nombres de tablas, errores SQL, rastros de excepciones o detalles de configuración.

| Situación | Comportamiento del frontend |
| --- | --- |
| Carga inicial | Mostrar estructura estable y un estado de carga; no anunciar skeletons como productos |
| Error del catálogo | Explicar que no se pudieron cargar productos y permitir reintentar |
| Datos previamente cargados y fallo posterior | Conservar el contexto, señalar que no se pudo actualizar y evitar afirmar vigencia no confirmada |
| Sin conexión | Mensaje comprensible y reintento; no inventar una simulación exitosa |
| Producto inexistente | Estado «Producto no disponible» y salida al catálogo |
| Precio o stock cambiado | Informar el cambio y recalcular; solicitar revisión antes de finalizar |
| Error de validación | Asociar al campo o decisión cuando el contrato lo permita; conservar datos útiles |
| Error inesperado | Mensaje general recuperable; registrar diagnóstico por los mecanismos del equipo, sin mostrar detalles internos |
| Respuesta antigua | Ignorar si ya no corresponde a búsqueda, carrito o modalidad actuales |

Si el contrato no contempla persistencia de favoritos o comparación, pueden mantenerse en el cliente como preferencias del dispositivo, sin prometer cuenta o sincronización. Para el carrito, conservar solo la información mínima necesaria y volver a resolver condiciones vigentes con la API. No conservar dirección ni datos de pago en almacenamiento persistente por defecto. La confirmación depende del éxito del backend y del mecanismo de recuperación que el contrato admita.

### 17. Textos de interfaz

Los siguientes textos son propuestas para mantener consistencia. Ajustar los valores dinámicos con la información real y los mensajes de validación con las restricciones del contrato.

| Situación | Texto propuesto |
| --- | --- |
| Búsqueda | «Busca tu próxima freidora» |
| Filtros | «Filtrar», «Aplicar filtros», «Cancelar», «Limpiar filtros» |
| Sin coincidencias | «No encontramos productos con esta búsqueda. Prueba otro término o quita un filtro.» |
| Catálogo fallido | «No pudimos cargar los productos. Inténtalo de nuevo.» |
| Aviso de demostración | «Catálogo de demostración. Los precios y la disponibilidad son datos de prueba.» |
| Producto agregado | «Agregaste [cantidad] de [producto] al carrito.» |
| Límite de cantidad | «Puedes llevar hasta [límite] unidades de este producto.» |
| Carrito vacío | «Tu carrito está vacío. Encuentra algo para tu cocina.» |
| Retiro incompatible | «Este carrito incluye un producto con entrega solo a domicilio.» |
| Distrito pendiente | «Selecciona un distrito disponible.» |
| Calle pendiente | «Escribe el nombre de la calle o avenida.» |
| Número pendiente | «Escribe el número o marca Dirección sin número.» |
| Resumen de errores | «Revisa estos datos para continuar.» |
| Revisión de dirección | «Revisa que esta sea la dirección que deseas usar en la simulación.» |
| Cambio de dirección | «La dirección cambió. Revísala otra vez para continuar.» |
| Cálculo del total | «Confirmando el total…» |
| Error del total | «No pudimos confirmar el total. Inténtalo de nuevo.» |
| Aceptación | «Entiendo que es una simulación sin cobros ni pedido real.» |
| Acción final | «Finalizar simulación» |
| Acción en curso | «Finalizando…» |
| Confirmación | «Simulación completada» |
| Alcance del resultado | «No se realizó ningún cobro ni se envió un pedido real.» |

No introducir afirmaciones de confianza sin evidencia, como «dirección verificada», «stock reservado», «pago seguro procesado» o «envío garantizado» cuando la demostración no realice esas acciones.

### 18. Trazabilidad con las rúbricas

| Requisito académico | Decisiones de UI que lo apoyan | Evidencia adicional necesaria |
| --- | --- | --- |
| APF1 C1: problema, personas y contexto | Inicio y navegación con tareas claras; vendedor y entrega visibles; diseño adaptable | Personas sustentadas, escenario, capturas reales categorizadas y anotadas |
| APF1 C2: cognición y modelos | Filtros progresivos, comparación y feedback persistente; controles amplios | GUI frente a UX, tres dimensiones, modelo cuantitativo correcto, modelo mental, Norman y HTA/GOMS ligados a pantallas |
| APF1 C3: diez heurísticas | Control de filtros, coherencia, prevención y recuperación, lenguaje claro | Evaluación de las diez heurísticas, severidad/prioridad, perfil afectado y captura por hallazgo relevante |
| APF2 C1: dos procesos y Norman | P1 catálogo/ficha/agregado; P2 carrito/dirección/entrega/revisión | Siete etapas por proceso, brechas y capturas del prototipo |
| APF2 C2: experimentación | Recorridos funcionales, estables y reiniciables | Diseño justificado, asignación de participantes, registros individuales, métricas y SUS real |
| APF2 C3: mejoras | Reorganización visible y estados de error, selección y finalización | Feedback real, afinidad, severidad/frecuencia, mapa de calor, mejora por problema relevante y antes/después con cita |
| APF2 C4: prototipo | Todos los recorridos y acciones descritos en esta guía | Wireframes anotados, flujos completos y enlace accesible; no solo mockups |
| R3 C1: auditoría | Semántica, alternativas, contraste, foco, etiquetas, medios cuando existan y lector | Ambos procesos, siete elementos, dos herramientas requeridas y capturas anotadas |
| R3 C2: usuarios | Recorridos operables con teclado y tecnologías de asistencia | Dos grupos, videos, tiempos, errores y citas; identificar simulación y respetar topes |
| R3 C3: barreras | Estados y componentes verificables para diagnosticar problemas | Al menos seis barreras comprobadas de tres grupos definidos, con ID, captura, WCAG, severidad, frecuencia y prioridad |
| R3 C4: mejoras y prototipo | Resolver barreras Críticas y Altas en el código y permitir la demostración | Fichas de antes/después, cambio técnico, WCAG, cita; Tab, NVDA y WAVE realmente comprobados |
| Exposición y documentación | Recorridos demostrables y decisiones explicables | Informe, slides, ensayo y participación de todo el equipo; límite R3 de quince minutos |

La herramienta «de la práctica» y los grupos concretos de R3 no están identificados por nombre en la guía recibida. La matriz conserva esa limitación. No atribuir equivalencia al requisito literal del curso únicamente por ejecutar dos herramientas distintas.

### 19. Plan de entrega al equipo frontend

| Etapa | Entrega revisable | Criterio de salida |
| --- | --- | --- |
| 1. Alinear contenido y contrato | Inventario de pantallas, acciones y datos disponibles; wireframes nuevos de ambos procesos | Cada acción tiene comportamiento definido y sus datos están en el contrato o identificados como pendientes |
| 2. Construir base visual y navegación | Tokens, componentes, cabecera, búsqueda, rutas y estados comunes | Navegación y foco funcionales; sin enlaces vacíos; estructura legible en móvil |
| 3. Completar búsqueda y selección | Inicio, catálogo, filtros, comparación, ficha y favoritos | P1 completo, reversible y conectado a datos de la API |
| 4. Completar preparación de compra | Carrito, entrega, validación, revisión y confirmación | P2 completo; total del backend; éxito y fallos tratados correctamente |
| 5. Revisar adaptación y accesibilidad | Evidencia por tamaño, teclado, contraste, semántica y herramientas disponibles | Defectos reproducibles registrados y corregidos; pendientes manuales identificados |
| 6. Preparar evaluación académica | Capturas anotadas, fichas, matriz AA, protocolo, registros reales y materiales de exposición | Separación clara entre implementación, pruebas técnicas, sesiones reales y simulaciones |

Revisar los wireframes antes de convertirlos en componentes para comprobar que la nueva composición se distingue del APF2. Actualizarlos tras los cambios para que las pantallas documentadas coincidan con el prototipo final. El backend debe estar disponible con datos de demostración y contrato actualizado durante la integración.

### 20. Checklist de aceptación y evidencia

Este checklist es un plan de verificación sin resultados marcados. Completar cada punto con fecha, versión, procedimiento y evidencia real.

- [ ] P1 se completa desde inicio: buscar, aplicar y quitar filtros, comparar, abrir ficha y agregar una cantidad válida.
- [ ] P2 se completa: revisar carrito, elegir entrega compatible, corregir dirección, revisarla y explicar el total antes del cierre.
- [ ] Favoritos, comparación y carrito mantienen su estado al navegar y volver.
- [ ] Se revisan estados vacíos, producto no disponible, imágenes fallidas, carga, error, reintento y desconexión.
- [ ] No se obtiene una confirmación al fallar el cálculo o la simulación del backend.
- [ ] Se prueban los límites vigentes de cantidad/stock y los cambios de condiciones sin imponer valores históricos de APF2.
- [ ] Domicilio y retiro conservan datos y costos conforme al contrato, incluidos sus casos incompatibles.
- [ ] La dirección admite la alternativa sin número y los errores tienen corrección accesible.
- [ ] Un acceso directo a revisión no permite omitir los requisitos anteriores.
- [ ] La aceptación de condiciones es explícita; el cierre evita solicitudes repetidas.
- [ ] El carrito se vacía solo después del éxito y la confirmación muestra datos auténticos de esa respuesta.
- [ ] Se verifican ambos procesos en 360, 390, 768, 1024 y 1440 px, con textos largos y mensajes de error, sin scroll horizontal.
- [ ] Se comprueban zoom/reflow, tamaño de texto y preferencia de movimiento reducido.
- [ ] Ambos procesos se completan con teclado; no hay trampas y el foco permanece visible y útil.
- [ ] Paneles y diálogos cierran y devuelven el foco correctamente.
- [ ] Se registran mediciones de contraste y auditorías automáticas realmente ejecutadas.
- [ ] Se realiza y documenta la prueba de NVDA y la comprobación requerida con WAVE; si no se ejecutan, permanecen pendientes.
- [ ] Se diagnostican barreras reales antes de asignar IDs, grupos, severidad, frecuencia y prioridad.
- [ ] Las capturas ANTES corresponden a la web analizada y las DESPUÉS al prototipo; ambas tienen anotaciones y versión identificable.
- [ ] Las citas, videos, tiempos, errores y respuestas SUS proceden de sesiones documentadas; las simulaciones están etiquetadas.
- [ ] La matriz AA distingue cumplido con evidencia, pendiente y no aplicable con justificación.
- [ ] La exposición R3 se ensaya en quince minutos o menos, con todos los integrantes y video de respaldo.

No trasladar al nuevo desarrollo métricas antiguas sin registros primarios ni completar esta lista con datos supuestos. La aplicación funcional y la evidencia académica se revisan por separado: ambas son necesarias para sostener la presentación del proyecto.

<a id="contrato-api"></a>

## Contrato de API

Versión de entrega: 2 de noviembre de 2026. Backend Spring Boot 4.1.2, Java 21 y MySQL. Esta API sirve una demostración académica; no procesa pagos, pedidos comerciales ni reservas de stock.

### Conexión

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

### Catálogo paginado

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

#### Detalle y fotografías

`GET /products/taurus-air-fry` devuelve el mismo objeto de producto, sin el envoltorio de paginación. Un identificador inexistente devuelve 404 con `field: "productId"`. En los datos iniciales `id` y `slug` coinciden.

`image` es una **ruta del futuro frontend**, no un archivo servido por Spring. El equipo dispone de fotografías opcionales y sus fuentes en [FUENTES_IMAGENES.md](#imagenes) y `frontend-assets/`. Copiarlas al directorio público con los nombres indicados si decide usarlas, o sustituirlas por imágenes adecuadas actualizando los datos mediante una migración. Las fotografías son referenciales y no acreditan las especificaciones del catálogo ficticio.

#### Metadatos de filtros

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

### Opciones de entrega

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

### Cotización

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

### Finalización académica

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

#### Validación de domicilio

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

### Errores y estados

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

### Estado que corresponde al frontend

Carrito, favoritos y selección de comparación pertenecen al estado del cliente en esta etapa. No hay cuentas, registro, autenticación ni sincronización de estas preferencias entre dispositivos. «Multiplataforma» describe una interfaz adaptable y operable, no sincronización de cuentas. No inventar endpoints para operaciones que no existen.

Guardar como máximo identificadores y cantidades necesarios; volver a consultar precios y disponibilidad. Mantener la dirección en memoria durante el recorrido, fuera de URL y almacenamiento persistente. Las reglas de UI, navegación, accesibilidad y responsividad se especifican en [GUIA_FRONTEND.md](#guia).

<a id="rubricas"></a>

## Trazabilidad completa de rúbricas

Fecha de revisión: 2 de noviembre de 2026. Estado: planificación de cobertura y evidencia pendiente. Este documento relaciona el rediseño con las rúbricas; no asigna una calificación ni acredita pruebas que todavía no se realizaron.

Alcance vigente: backend Spring Boot con MySQL y documentación para el equipo frontend. Las decisiones de UI son propuestas para implementar después, detalladas en [GUIA_FRONTEND.md](#guia); no implican que se haya programado o auditado el frontend. El contrato técnico se centraliza en [API.md](#contrato-api).

El trabajo conserva los dos procesos del APF2: **P1, buscar, filtrar y seleccionar una freidora**, y **P2, revisar carrito, configurar dirección y entrega y entender el total**. El cierre de compra seguirá siendo una simulación académica. El cambio de interfaz debe ser perceptible en la organización y en el comportamiento de estos procesos, además de su apariencia.

### Fuentes y numeración

| Clave | Documento original | Páginas revisadas |
| --- | --- | --- |
| F1 | RUBRICA AVANCE 1.pdf | 1 y 2 |
| F2 | GUIA-AVANCE2.pdf | 1, 2 y 3 |
| F3 | GUIA DE RUBRICA R3.pdf | 1 a 4 |
| F4 | Informe_Final_Falabella_APF2 (1).docx | Objetivo y alcance; criterios 3 y 4; figuras 3 a 11; verificación manual |

Las páginas citadas de los PDF son posiciones físicas del archivo, empezando por 1. F3 tiene una portada sin número: su página física 2 lleva impreso «Página 1», la física 3 «Página 2» y la física 4 «Página 3». Se extrajo el texto completo de las tres rúbricas y se inspeccionaron visualmente sus tablas e instrucciones relevantes. Los originales no fueron modificados.

### Qué cambia entre las revisiones

| Revisión | Centro de evaluación | Puntaje | Qué puede aportar el desarrollo |
| --- | --- | ---: | --- |
| APF1 | Entender el problema y los usuarios; aplicar modelos de IHC; evaluar las 10 heurísticas; argumentar | 20 | Pantallas y comportamientos que permiten demostrar las decisiones; requiere análisis, fuentes, capturas y exposición además del código |
| APF2 | Mantener al menos dos procesos reales como eje; Norman, experimentación, métricas, SUS, mejoras y prototipo funcional | 20 | Recorridos completos y estados verificables; requiere datos reales de participantes y comparativas documentadas |
| R3 / APF3 | Accesibilidad WCAG 2.1 AA en esos mismos dos procesos; auditoría, grupos de usuarios, barreras y mejoras | 20 | Implementación semántica y operable, auditorías técnicas y demostración; requiere también evidencia humana, capturas anotadas y registro de barreras |

La F2 pide que el prototipo refleje fielmente la interfaz analizada. En este rediseño se conserva el caso, la información comercial y las tareas del marketplace; la reorganización de pantallas responde a los problemas encontrados. Esa relación debe explicarse mediante el antes y después, en lugar de presentar la diferencia visual como prueba suficiente de mejora.

### APF1 criterios y niveles

F1 muestra encabezados de nivel Excelente 100 %, Bueno 80 %, En proceso 60 % e Inicio 40 %. Los puntajes explícitos de las celdas son los siguientes; se conservan sus rangos sin recalcularlos con esos porcentajes.

| Criterio | Máximo | Excelente | Bueno | En proceso | Inicio | Fuente |
| --- | ---: | --- | --- | --- | --- | --- |
| C1 Comprensión del problema, usuarios y contexto | 4 | 4: problemática clara; al menos dos personas completas, fuentes y contexto; capturas reales categorizadas y anotadas; escenario narrado | 3: personas completas basadas en supuestos sin fuente; capturas categorizadas con anotaciones parciales; falta escenario o hay capturas descriptivas | 2: usuarios genéricos o un perfil; capturas sin categoría ni anotación; descripción superficial | 0 a 1: caso confuso, sin usuarios identificables o sin capturas correspondientes al caso | F1 p. 1 |
| C2 Aplicación de conceptos de IHC, cognición y percepción | 5 | 5: GUI frente a UX; tres dimensiones cognitivas ancladas a capturas; ley o modelo cuantitativo correcto; modelo mental; Norman con fase de fallo; HTA o GOMS; errores clasificados | 3.5 a 4: análisis sólido con ley, capturas y errores, pero faltan dos o más elementos entre GUI/UX, modelo mental, tareas formales o clasificación de errores | 2 a 3: teoría poco vinculada a pantallas o una sola dimensión cognitiva; diagramas sin problemas anotados | 0 a 1.5: conceptos ausentes o incorrectos; se confunden modelos de interacción con arquitectura técnica | F1 p. 1 |
| C3 Diseño centrado en el usuario y heurísticas de Nielsen | 4 | 4: evalúa las 10 heurísticas; captura por hallazgo relevante; severidad o prioridad; perfil afectado; evidencia concreta de minimalismo y prevención de errores | 3: tabla de 10 heurísticas y problemas del caso, sin captura por hallazgo ni severidad; conexión parcial con perfiles | 2: menos de seis heurísticas o problemas genéricos; DCU ausente o desconectado | 0 a 1: heurísticas ausentes, incorrectas o solo teóricas; opiniones estéticas | F1 p. 2 |
| C4 Exposición, argumentación y respuestas | 7 | 6 a 7: todos dominan y exponen sin lectura literal; secuencia completa; edición cuidada; teoría conectada con hallazgos; limitaciones; cualquier integrante responde; 15 a 20 minutos | 4 a 5.5: todos exponen; dominio mayoritario; transiciones o edición mejorables; respuestas puntualmente vagas; leve desfase | 2 a 3.5: lectura frecuente; respuestas que repiten slides; dominio desigual; desorden o desfase notorio | 0 a 1.5: lectura permanente, contradicciones o falta de respuestas; solo participan uno o dos; sin estructura | F1 p. 2 |

Para C1, una persona completa incluye edad, ocupación, nivel digital, metas, frustraciones y comportamiento; su contexto incluye dispositivo, conectividad y frecuencia. Para C2, las tres dimensiones nombradas son carga cognitiva, memoria y atención/percepción. El cambio de código por sí solo no acredita esos análisis.

### APF2 criterios y niveles

| Criterio | Máximo | Excelente | Cumple correctamente | Cumple parcialmente | No cumple | Fuente |
| --- | ---: | --- | --- | --- | --- | --- |
| C1 Ciclo de Interacción de Norman | 4 | 4: todas las etapas en dos procesos reales, captura del prototipo y análisis de brechas | 3: mayoría de etapas, procesos y evidencia; brechas parciales | 2: algunas etapas con procesos genéricos o sin captura | 0 a 1: sin ciclo o con procesos abstractos | F2 p. 1 |
| C2 Evaluación Experimental | 6 | 6: diseño justificado, asignación de participantes, métricas calculadas y SUS con evidencia completa | 4 a 5: mayoría de elementos y evidencia suficiente | 2 a 3: elementos, evidencia o análisis incompletos | 0 a 1: sin evaluación o sin evidencia | F2 pp. 1 y 2 |
| C3 Análisis de Usabilidad y Mejoras | 6 | 6: métricas, severidad Nielsen, problemas, feedback y mejoras con antes/después | 4 a 5: escala aplicada, mejoras claras y comparativa visual | 2 a 3: problemas y algunas mejoras, con análisis o comparativa incompletos | 0 a 1: sin análisis ni mejoras | F2 pp. 1 y 2 |
| C4 Prototipado | 2 | 2: wireframes completos y prototipo navegable y funcional en todos los flujos | 1: wireframes claros y prototipo funcional en flujos principales | 0 a 1: wireframes básicos o funcionalidad parcial | 0: wireframes incorrectos o prototipo no funcional | F2 pp. 1 y 2 |
| C5 Exposición | 2 | 2: claridad, orden, dominio y respuestas seguras | 1: organización y dominio parcial | 0 a 1: presentación incompleta o difícil de explicar | 0: no expone o resulta incomprensible | F2 pp. 1 a 3 |

Las siete etapas exigidas en C1 son formación del objetivo, formación de la intención, especificación de la acción, ejecución de la acción, percepción del estado, interpretación del estado y evaluación del resultado. La brecha de ejecución se analiza en etapas 2 a 4; la de evaluación, en etapas 5 a 7. Fuente: F2 pp. 1 y 2.

C2 exige justificar Between-Subjects o Within-Subjects; tabla con N, perfiles, grupos/condiciones y orden de tareas; contrabalanceo cuando corresponda; efectividad, tiempo y errores por participante y tarea; cuestionario SUS de diez ítems, cálculo e interpretación. La rúbrica no establece un N mínimo concreto. Fuente: F2 p. 2.

C3 exige tabla global y por tarea, mapa de calor de pantallas problemáticas, severidad Nielsen 0 a 4 justificada con heurística, frecuencia y evidencia, tabla priorizada con ID y pantalla, feedback directo e indirecto agrupado por afinidad, una mejora por problema de severidad mayor o igual a 2 y comparativa con cita real del usuario. Fuente: F2 p. 2.

C4 exige wireframes de todas las pantallas con anotaciones y flujo indicado, todos los botones y acciones funcionando y un enlace accesible. No queda satisfecho solo con una portada o una colección de pantallas estáticas. Fuente: F2 p. 2.

### R3 criterios y niveles

| Criterio | Máximo | Excelente | Bueno | En proceso | Fuente |
| --- | ---: | --- | --- | --- | --- |
| C1 Auditoría | 5 | 5: siete elementos en dos procesos, dos herramientas y capturas anotadas | 4: una herramienta; faltan una o dos capturas | 2 a 3: un solo proceso o capturas sin anotar | F3 p. 4 |
| C2 Usuarios | 4 | 4: dos grupos reales con video, tiempos, errores y citas | 3: reales con evidencia parcial o simulación completa | 2: un grupo o simulación parcial | F3 p. 4 |
| C3 Barreras | 3 | 3: seis o más barreras de tres grupos, cada una con captura y WCAG | 2: tabla completa y capturas en la mayoría | 1: sin severidad o sin WCAG | F3 p. 4 |
| C4 Mejoras y prototipo | 5 | 5: antes/después de barreras Críticas y Altas con cita; demostración sin fallos | 4: mayoría de fichas o con observación; fallos menores | 2 a 3: comparativas parciales | F3 p. 4 |
| C5 Documento y exposición | 3 | 3: documento completo, 15 minutos o menos, todos exponen | 2: capturas incompletas o se excede dos minutos | 1: desordenado o cortado | F3 p. 4 |

La nota inferior de F3 p. 4 considera insuficiente 0 a 1 puntos cuando no hay evidencia o capturas. Establece además topes específicos de C2: 4 con dos grupos reales, 3.5 con un real y otro simulado, 3 con dos simulados.

La guía añade condiciones operativas que deben conservarse:

- Auditar cada proceso con dos herramientas: «la de la práctica + WAVE o Axe». **No identifica por nombre la herramienta de la práctica.** Axe y Lighthouse pueden aportar evidencia técnica si se ejecutan, pero no se debe afirmar sin más que reemplazan la combinación literal del curso. Fuente: F3 p. 2.
- Cubrir siete elementos: HTML, texto alternativo, contraste, foco, etiquetas, subtítulos y lector de pantalla, con meta AA. Fuente: F3 p. 2.
- Registrar al menos seis barreras de tres grupos, con ID, captura, grupo, WCAG, severidad, frecuencia y prioridad. **La guía no enumera una taxonomía concreta para esos tres grupos.** El grupo afectado se deberá definir y justificar en la auditoría. Fuente: F3 p. 2.
- Probar con dos grupos de usuarios, grabar un mínimo de tres minutos por grupo y registrar tiempo de tarea, errores y citas textuales. Si se simula: NVDA, solo teclado, video sin sonido o cronómetro; prueba un integrante que no haya desarrollado esa parte. La guía tampoco define cuáles deben ser los dos grupos; los perfiles de edad/experiencia del APF1 no demuestran por sí solos cobertura de accesibilidad. Fuente: F3 p. 2.
- Implementar ambos procesos en un prototipo funcional de HTML, CSS y JavaScript y resolver todas las barreras Críticas y Altas. React puede producir esta interfaz web; el uso de React no sustituye ninguna comprobación. Fuente: F3 p. 2.
- Para cada mejora: ANTES de la web actual y DESPUÉS del prototipo, cambio técnico, WCAG y cita del usuario. La guía indica que los hallazgos y mejoras sin captura anotada no se califican. Por tanto, seis filas inventadas o capturas solo del nuevo diseño no completan la evidencia. Fuente: F3 p. 2.
- Verificar recorrido completo con Tab y foco visible, anuncios con NVDA y ausencia de errores en WAVE. Una revisión automatizada no acredita por sí sola todos los aspectos de AA. Fuente: F3 p. 2; véase también el alcance de conformidad de WCAG en la sección técnica de este documento.

### Matriz de implementación y evidencia

Las acciones de la columna «Rediseño previsto» son decisiones de implementación. Las de «Evidencia para cerrar» son trabajo de verificación o investigación: no se consideran realizadas por estar escritas aquí.

| ID | Criterios relacionados | Rediseño previsto | Evidencia para cerrar | Estado de cobertura |
| --- | --- | --- | --- | --- |
| D01 | APF1 C1/C2; APF2 C1/C4 | Organizar navegación y títulos alrededor de P1 y P2, con pasos reconocibles, sin acciones principales competidoras | Capturas y análisis de los siete estados de Norman por proceso; tareas narradas y HTA | Diseño e implementación previstos; análisis completo pendiente |
| D02 | APF1 C2/C3; APF2 C3/C4 | Catálogo con seis filtros iniciales, secundarios progresivos, selección visible, eliminación individual y restablecimiento | Antes/después anotado; prueba de aplicar, modificar y quitar filtros; comprensión con usuarios; verificar duplicados | El código puede demostrar reversibilidad; beneficio de desempeño pendiente |
| D03 | APF1 C1/C3; APF2 C1/C3 | Tarjetas y ficha con nombre, vendedor, entrega y precio principal comparables; condiciones del vendedor cercanas a la decisión | Comparativa anotada; comprobar que usuarios identifican vendedor y consecuencias; registro de dudas | Jerarquía implementable; comprensión no medida |
| D04 | APF1 C2/C3; APF2 C1/C4; R3 C1/C4 | Feedback persistente de filtros y agregado; contador y cantidades coherentes; estados de carga/error/éxito anunciados | Acciones reproducibles y lectura de estados con tecnologías de asistencia; capturas de estado | Verificación técnica y NVDA pendientes |
| D05 | APF1 C2/C3; APF2 C3/C4; R3 C1/C4 | Carrito editable, borrar con resultado comprensible, total siempre explicado, domicilio/retiro claros | Rutas de una y dos unidades en ambas modalidades; teclado; anuncios de cantidades y totales; evaluación con usuarios | Comportamiento implementable; evidencia de pruebas pendiente |
| D06 | APF1 C3; APF2 C1/C3; R3 C1/C4 | Formulario con etiquetas visibles, instrucciones, error asociado al campo, resumen de errores y conservación de datos; alternativa sin número | Casos vacío/inválido/corrección; lectura de errores; captura antes/después y feedback real; distinguir validación de formato de verificación real de dirección | Validación local prevista; geocodificación/verificación real fuera de lo demostrado |
| D07 | APF2 C4; R3 C1/C4 | Resumen final, aceptación explícita y cierre simulado; nombres de botones claros | Tab y Shift+Tab por ambos procesos, foco tras cambiar de pantalla, lectura del resumen y ausencia de acciones accidentales | Cierre académico previsto; no representa pago real |
| D08 | APF1 C3; R3 C1/C4 | Landmarks, jerarquía de encabezados, enlace para saltar al contenido, botones y campos nativos, nombres accesibles e imágenes con alternativas útiles | Auditoría técnica; inspección semántica; recorrer con lector de pantalla | Preparación técnica; NVDA pendiente hasta ejecución efectiva |
| D09 | APF1 C2/C3; R3 C1/C4 | Foco visible, contraste suficiente, controles separados, orden lógico y diseño adaptable | Medir contraste; navegación sin ratón y sin trampas; zoom/reflow; dispositivos y resoluciones; capturas | Objetivo de diseño; resultados deben añadirse tras pruebas |
| D10 | R3 C1/C3/C4 | Mantener significado sin depender solo de color, posición, imagen o audio; respetar preferencia de movimiento reducido | Evaluación de mensajes y controles; auditar medios existentes y marcar no aplica con razón cuando corresponda | No inferir barreras audiovisuales si no existen medios |
| D11 | APF2 C2/C3; R3 C2 | Hacer recorridos estables, reiniciables y observables para sesiones de prueba | Diseño de estudio, participantes, consentimiento, registros, videos, tiempos, errores, SUS y citas auténticas | El código facilita la prueba; no genera participantes ni resultados |
| D12 | APF1 C4; APF2 C5; R3 C5 | Mantener una demostración corta y completa; exponer decisiones y límites | Informe, wireframes, fichas antes/después, matriz AA, slides, videos y ensayo con todos los integrantes | Entregables académicos y ensayo pendientes |

### Correspondencia técnica preliminar con WCAG 2.1

Esta lista ayuda a preparar la auditoría; no es una declaración de conformidad ni la matriz AA completa. La conformidad requiere revisar páginas y procesos completos y los criterios A y AA aplicables. Referencia normativa: [WCAG 2.1 del W3C](https://www.w3.org/TR/WCAG21/).

| Área prevista | Criterios a comprobar | Comprobación prevista |
| --- | --- | --- |
| Semántica e imágenes | 1.1.1; 1.3.1 | Alternativas y relaciones estructurales |
| Contraste y adaptación | 1.4.1; 1.4.3; 1.4.10; 1.4.11 | Color, texto, reflow y controles |
| Teclado | 2.1.1; 2.1.2 | Operación y ausencia de trampas |
| Navegación | 2.4.1; 2.4.3; 2.4.6; 2.4.7 | Saltos, orden, títulos y foco |
| Formularios | 3.3.1; 3.3.2; 3.3.3 | Identificación, instrucciones y corrección |
| Componentes dinámicos | 4.1.2; 4.1.3 | Nombre, rol, valor y mensajes |
| Idioma | 3.1.1 | Idioma de página |
| Medios, si existen | 1.2.2; 1.2.4 | Subtítulos de grabaciones y directos |

Las áreas grandes de interacción son una mejora de usabilidad; no se debe atribuir el mínimo de tamaño de objetivo de WCAG 2.1 al nivel AA: su criterio 2.5.5 es AAA. La meta del curso sigue siendo 2.1 AA, con requisitos adicionales de demostración y evidencia definidos por F3.

### Evidencia académica que el código no reemplaza

| Pendiente | Contenido mínimo | Fuente |
| --- | --- | --- |
| Diagnóstico APF1 | Dos personas sustentadas, contexto, escenario, capturas reales anotadas y categorizadas, GUI/UX, tres dimensiones, modelo cuantitativo, modelo mental, Norman, HTA/GOMS y errores | F1 pp. 1 y 2 |
| Evaluación APF2 | Diseño experimental, asignación y orden de tareas, registros individuales de éxito/tiempo/errores, diez respuestas SUS por persona y condición, cálculos e interpretación | F2 p. 2 |
| Análisis APF2 | Síntesis y mapa de calor basados en datos, tabla de problemas con severidad/frecuencia, afinidad del feedback, mejora por problema de severidad >= 2, citas y antes/después | F2 p. 2 |
| Auditoría R3 | Ambos procesos, siete elementos, combinación de herramientas del curso, resultados reproducibles y capturas con anotaciones | F3 pp. 2 y 4 |
| Registro R3 | Seis o más barreras comprobadas de tres grupos definidos, con ID, pantalla/captura, grupo afectado, WCAG, severidad, frecuencia y prioridad | F3 pp. 2 y 4 |
| Sesiones R3 | Dos grupos, al menos tres minutos grabados por grupo, tiempos, errores y citas; etiquetar simulación y respetar sus topes | F3 pp. 2 y 4 |
| Mejora R3 | Ficha por barrera Crítica o Alta: antes real, después, anotaciones, cambio técnico, WCAG y cita; Tab, NVDA y WAVE ejecutados | F3 pp. 2 a 4 |
| Documentación y exposición R3 | PDF con resumen, auditoría, pruebas, barreras, antes/después, guía técnica, matriz AA y conclusiones; capturas en ZIP; videos; enlace al prototipo; slides; ensayo | F3 pp. 3 y 4 |

Las métricas anteriores de veinte participantes y SUS 64.5 del informe Falabella permanecen identificadas como antecedentes sin registros primarios disponibles (F4, criterio 2). No deben reutilizarse como resultado del nuevo código. Las citas de usuarios, las frecuencias de barreras y los tiempos no se rellenarán retrospectivamente con ejemplos ficticios.

Las seis barreras y sus capturas son requisitos del **entregable académico R3**, no un permiso para inventar seis fallos ni una propiedad automática del prototipo. La implementación y los resultados técnicos cubren una parte de ese entregable. Las pruebas humanas, NVDA, la documentación de la web original y las evidencias no realizadas permanecerán pendientes aunque la aplicación compile y navegue correctamente.

### Orden de la exposición R3

F3 p. 3 fija un máximo de quince minutos, sin las preguntas del docente, y advierte que lo no mostrado antes del corte no se califica en la parte oral.

| Bloque | Tiempo |
| --- | ---: |
| Web y dos procesos | 1 min |
| Auditoría y hallazgos con capturas | 3 min |
| Pruebas, con un clip de un minuto por grupo | 3 min |
| Tabla priorizada de barreras | 2 min |
| Antes y después | 5 min |
| Matriz AA y conclusiones | 1 min |

Los slides se concentran en barreras Críticas y Altas con antes/después lado a lado. La demostración exige un proceso completo solo con teclado y NVDA, con audio audible en Zoom, y video de respaldo. Todos deben exponer al menos un bloque y ensayar en quince minutos o menos. Fuente: F3 p. 3.

### Cierre de la matriz

Para actualizar este documento tras la implementación, registrar por cada comprobación: fecha, versión del prototipo, proceso/pantalla, procedimiento, resultado observado y ruta de evidencia. Diferenciar resultado automático, revisión manual, sesión con usuario real y simulación. La calificación depende de la evidencia completa y de la evaluación docente; esta matriz no garantiza una nota.

<a id="imagenes"></a>

## Fotografías referenciales opcionales

Consulta y descarga: 2 de noviembre de 2026. Fotografías procedentes de sitios oficiales de fabricantes y sus servidores de imágenes. Se entregan como material opcional en `docs/frontend-assets/`; esta etapa no implementa el frontend. El equipo podrá copiarlas a su directorio público conservando los nombres y las atribuciones.

Las fotografías son referenciales. Los nombres de variantes, precios, vendedores, valoraciones, disponibilidad, costos de entrega y especificaciones que muestre el catálogo académico son datos de demostración; no constituyen una oferta comercial ni se verificaron a partir de estas imágenes.

| Archivo local | Contenido visual | Fuente primaria | Imagen original |
| --- | --- | --- | --- |
| `taurus.jpg` | Freidora digital Taurus de una cesta sobre fondo blanco | [Colección oficial de freidoras Taurus](https://taurus-home.com/en/collections/air-fryers) | [Fotografía Taurus](https://taurus-home.com/cdn/shop/files/airfry-min.jpg?v=1689700805&width=940) |
| `taurus-family.jpg` | Taurus Air Fry Digital Duo de dos cestas sobre fondo blanco | [Colección oficial de freidoras Taurus](https://taurus-home.com/en/collections/air-fryers) | [Fotografía Taurus Duo](https://taurus-home.com/cdn/shop/files/grill1-min.jpg?v=1689711156) |
| `oster.jpg` | Oster digital con ventana, modelo fotografiado CKSTAF60WDDF | [Ficha oficial Oster de 6 litros](https://www.oster.com.pe/oster-freidora-de-aire-digital-recubrimiento-oster-diamondforce-6l-de-capacidad-10-programas-automaticos-ckstaf60wddf/p) | [Fotografía del servidor oficial Oster](https://osterpe.vteximg.com.br/arquivos/ids/159815/SAP_2204818_1.jpg?v=638580739880630000) |
| `oster-compact.jpg` | Oster digital con ventana, modelo fotografiado CKSTAF40WDDF | [Ficha oficial Oster de 4 litros](https://www.oster.com.pe/oster-freidora-de-aire-digital-con-recubrimiento-oster-diamondforce-4l-de-capacidad-con-10-programas-automaticos-ckstaf40wddf/p) | [Fotografía del servidor oficial Oster](https://osterpe.vteximg.com.br/arquivos/ids/159851/SAP_2204820_1.jpg?v=638608891944570000) |
| `imaco.jpg` | Imaco de cesta, modelo fotografiado AF6516D | [Colección oficial de freidoras Imaco](https://imaco.pe/collections/freidoras) | [Fotografía Imaco](https://imaco.pe/cdn/shop/files/AF6516D-1.jpg?v=1716319070) |
| `philips.jpg` | Philips Airfryer XL negro, modelo fotografiado HD9270/90 | [Ficha oficial Philips](https://www.philips.com.ph/c-p/HD9270_90/essential-airfryer-xl) | [Fotografía del servidor oficial Philips](https://images.philips.com/is/image/philipsconsumer/vrs_708fcd35_9dce_4860_832ac44dabdf2f21?wid=900&hei=900&fit=constrain) |
| `kitchen.jpg` | Cocina con freidora Taurus y platos preparados | [Ficha oficial Taurus Air Fry Digital 360](https://taurus-home.com/en/products/air-fry-digital-360) | [Fotografía de ambiente Taurus](https://taurus-home.com/cdn/shop/files/973988000-Air-Fry-Digital-360-min_05.jpg?v=1709220904&width=1600) |

Las imágenes de Oster se localizaron mediante el catálogo público del sitio oficial, consultando los modelos CKSTAF60WDDF y CKSTAF40WDDF. Las fotografías de Taurus e Imaco se localizaron mediante búsqueda de imágenes y sus colecciones oficiales; la de Philips se obtuvo de la ficha oficial enlazada.

Se conservó la fotografía original y se exportó una copia JPEG optimizada, con orientación corregida y tamaño máximo de 800 × 800 px para productos y 1100 × 1100 px para la fotografía de ambiente. No se añadieron productos, personas, textos ni elementos generados. Los seis productos emplean fotografías distintas. Peso conjunto aproximado: 356 KB.

La atribución identifica el origen de las fotografías y no implica patrocinio ni afiliación de los fabricantes con este proyecto académico.
