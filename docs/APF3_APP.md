# Aplicación preparada para obtener la evidencia APF3

Actualizado: 3 de noviembre de 2026. Rama de trabajo: `feature/apf3-accessibility-completion`, basada en `dev` f672158. El grupo elaborará el informe, los videos y la exposición. Este cambio complementa la aplicación para facilitar esa evaluación.

## Funciones incorporadas

La cabecera tiene **Ayuda** y **Venta telefónica**, ambas con botones nativos que abren diálogos con título accesible. Ayuda ofrece preguntas desplegables sobre filtros, entrega, dirección, simulación y teclado. Venta telefónica ofrece orientación por presupuesto en pantalla y explica que no existe una central real. No se inventa un número ni se generan llamadas.

El acceso flotante **Asesoría** tiene imagen con alternativa textual y un nombre accesible propio. Permite elegir presupuesto y abrir el catálogo filtrado. Los diálogos se cierran con Escape, contienen el recorrido de Tab y devuelven el foco al origen. Se incluyeron los controles nativos `summary` en el manejo de foco para que las preguntas desplegables sean alcanzables.

En **Revisión**, el medio de pago de demostración permite abrir un formulario, provocar un error, corregirlo, agregar y quitar una tarjeta ficticia. Solo admite el código `DEMO`, de hasta cuatro caracteres. No solicita números bancarios, vencimiento ni código de seguridad. El texto aclaratorio tiene color #333 sobre blanco y tamaño 14 px. El paso es opcional: la compra académica puede finalizar sin tarjeta.

La selección ficticia vive únicamente en el componente y se pierde al abandonar Revisión. El código introducido se borra al cerrar el diálogo. No se añade a peticiones HTTP, almacenamiento del navegador o MySQL. La confirmación sigue usando el contrato existente de simulación. Este cambio no incorpora una pasarela ni pagos reales.

## Correspondencia con las fichas del informe

| Ficha | Dónde obtener el después | Qué explicar |
| --- | --- | --- |
| B01 Botones sin nombre | Corazón de favoritos del catálogo y ficha | Nombre del producto y acción, estado presionado y anuncio observado con lector |
| B02 Imagen de asesoría | Acceso flotante Asesoría | Imagen `advisor.svg` con alt y botón con nombre accesible; selector por presupuesto y resultados reales de catálogo |
| B03 Formulario sin nombre | Filtros y dirección | Etiquetas asociadas, instrucciones y errores. El control original era un interruptor de evento: la comparación debe explicar el rediseño, no atribuirle otro selector. La captura original muestra una incidencia, no tres |
| B04 Comandos sin nombre | Ayuda y Venta telefónica | Botones con texto visible y título del diálogo. 4.1.2 es nivel A |
| B05 Roles sin contenedor | Navegación de ayuda | Se usan `nav` y botones nativos, sin roles `menuitem` artificiales. La orientación se conserva como interacción en pantalla; no es una llamada real |
| B06 Enlace al carrito | Mi carrito de la cabecera | Nombre accesible con cantidad de unidades y destino `/carrito` |
| B07 Contraste en pago | Revisión, Agregar tarjeta de demostración | Texto aclaratorio oscuro sobre blanco. Es el componente equivalente de un pago académico; no reproduce validación bancaria ni cargos de la web original |

Las capturas originales de Falabella son el ANTES. Las del prototipo son el DESPUÉS. Cada ficha debe incluir la misma necesidad de interacción, anotación, criterio, cambio técnico, severidad justificada y cita auténtica obtenida en la sesión. Una función implementada o una prueba automática no acredita por sí sola la experiencia con NVDA.

## Cómo recorrerlo

1. Buscar “freidora”, aplicar un presupuesto, abrir una ficha y agregar un producto.
2. Abrir Asesoría, cambiar presupuesto y comprobar que el catálogo conserva el filtro elegido.
3. Abrir Ayuda, desplegar respuestas con teclado y cerrar con Escape. Repetir Venta telefónica y seguir la recomendación.
4. En carrito, cambiar cantidad y continuar. Elegir domicilio, provocar errores y corregir la dirección. Revisarla y usarla. Repetir con retiro.
5. En Revisión, abrir la tarjeta ficticia, intentar enviar vacío y comprobar el error y el foco. Escribir `DEMO`, usar la tarjeta, quitarla y agregarla nuevamente.
6. Leer total y condiciones y confirmar la simulación. Comprobar la respuesta de éxito y el identificador real de simulación.

## Comprobaciones reproducibles

Desde `front`: `npm run build`, `npm run lint` y `npm run test:apf3`. La suite completa es `IHM_LIVE_API=1 npx playwright test`; en PowerShell se configura `$env:IHM_LIVE_API='1'`. Para Edge instalado en Windows se configura `$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'`.

Con Docker encendido, ejecutar `npm run audit:apf3` desde `front`. Genera auditorías axe y capturas en `outputs/APF3/evidencias` del repositorio, carpeta excluida de Git por ser salida generada. Usa API y MySQL de la demo, crea simulaciones académicas y no vacía ni elimina datos. Incluye 14 estados por ancho (320, 390, 768 y 1440 px), un control adicional de espaciado por ancho y un recorrido mediante Tab, Enter, Espacio y flechas sin enfocar controles por código. La emulación no equivale a equipos físicos ni a lectura NVDA.

El resultado de la ejecución registrada se conserva en `docs/evidencias/APF3/resultados.json`. Las reglas automáticas pueden dejar comprobaciones incompletas que necesitan revisión humana. La ausencia de infracciones detectadas no certifica WCAG 2.1 AA.

## Trabajo del grupo

- Ejecutar WAVE y NVDA sobre la versión final, registrar fecha, pantalla, procedimiento y resultado; corregir los defectos que aparezcan. La herramienta de la práctica del profesor sigue sin identificar.
- Realizar y grabar las sesiones de dos grupos. Actualmente el usuario confirmó que no existen videos, tiempos ni citas. La aplicación está disponible para obtenerlos.
- Probar ambos procesos en móvil, tablet y escritorio, incluyendo zoom y orientación; distinguir emulación de dispositivos físicos.
- Completar el informe y la matriz AA con resultados comprobados, preparar capturas anotadas, ZIP, enlace accesible, diapositivas y exposición de hasta 15 minutos.

La aplicación puede funcionar en la red local con el puerto publicado por Docker, pero `localhost` solo funciona en el equipo que la ejecuta. Para abrirla en otro dispositivo, usar la dirección de red de ese equipo y comprobar conectividad. No se ha publicado un sitio externo.
