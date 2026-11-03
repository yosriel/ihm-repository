# Matriz de rúbricas y rediseño de Falabella

Este documento conserva la especificación y planificación previas a la implementación. El frontend funcional se describe en [FRONTEND.md](FRONTEND.md) y sus resultados y pendientes actuales en [VERIFICACION_FRONTEND.md](VERIFICACION_FRONTEND.md). Los estados de planificación del texto original no sustituyen ese registro de ejecución.

Fecha de revisión: 2 de noviembre de 2026. Estado: planificación de cobertura y evidencia pendiente. Este documento relaciona el rediseño con las rúbricas; no asigna una calificación ni acredita pruebas que todavía no se realizaron.

Alcance vigente: backend Spring Boot con MySQL y documentación para el equipo frontend. Las decisiones de UI son propuestas para implementar después, detalladas en [GUIA_FRONTEND.md](GUIA_FRONTEND.md); no implican que se haya programado o auditado el frontend. El contrato técnico se centraliza en [API.md](API.md).

El trabajo conserva los dos procesos del APF2: **P1, buscar, filtrar y seleccionar una freidora**, y **P2, revisar carrito, configurar dirección y entrega y entender el total**. El cierre de compra seguirá siendo una simulación académica. El cambio de interfaz debe ser perceptible en la organización y en el comportamiento de estos procesos, además de su apariencia.

## Fuentes y numeración

| Clave | Documento original | Páginas revisadas |
| --- | --- | --- |
| F1 | RUBRICA AVANCE 1.pdf | 1 y 2 |
| F2 | GUIA-AVANCE2.pdf | 1, 2 y 3 |
| F3 | GUIA DE RUBRICA R3.pdf | 1 a 4 |
| F4 | Informe_Final_Falabella_APF2 (1).docx | Objetivo y alcance; criterios 3 y 4; figuras 3 a 11; verificación manual |

Las páginas citadas de los PDF son posiciones físicas del archivo, empezando por 1. F3 tiene una portada sin número: su página física 2 lleva impreso «Página 1», la física 3 «Página 2» y la física 4 «Página 3». Se extrajo el texto completo de las tres rúbricas y se inspeccionaron visualmente sus tablas e instrucciones relevantes. Los originales no fueron modificados.

## Qué cambia entre las revisiones

| Revisión | Centro de evaluación | Puntaje | Qué puede aportar el desarrollo |
| --- | --- | ---: | --- |
| APF1 | Entender el problema y los usuarios; aplicar modelos de IHC; evaluar las 10 heurísticas; argumentar | 20 | Pantallas y comportamientos que permiten demostrar las decisiones; requiere análisis, fuentes, capturas y exposición además del código |
| APF2 | Mantener al menos dos procesos reales como eje; Norman, experimentación, métricas, SUS, mejoras y prototipo funcional | 20 | Recorridos completos y estados verificables; requiere datos reales de participantes y comparativas documentadas |
| R3 / APF3 | Accesibilidad WCAG 2.1 AA en esos mismos dos procesos; auditoría, grupos de usuarios, barreras y mejoras | 20 | Implementación semántica y operable, auditorías técnicas y demostración; requiere también evidencia humana, capturas anotadas y registro de barreras |

La F2 pide que el prototipo refleje fielmente la interfaz analizada. En este rediseño se conserva el caso, la información comercial y las tareas del marketplace; la reorganización de pantallas responde a los problemas encontrados. Esa relación debe explicarse mediante el antes y después, en lugar de presentar la diferencia visual como prueba suficiente de mejora.

## APF1 criterios y niveles

F1 muestra encabezados de nivel Excelente 100 %, Bueno 80 %, En proceso 60 % e Inicio 40 %. Los puntajes explícitos de las celdas son los siguientes; se conservan sus rangos sin recalcularlos con esos porcentajes.

| Criterio | Máximo | Excelente | Bueno | En proceso | Inicio | Fuente |
| --- | ---: | --- | --- | --- | --- | --- |
| C1 Comprensión del problema, usuarios y contexto | 4 | 4: problemática clara; al menos dos personas completas, fuentes y contexto; capturas reales categorizadas y anotadas; escenario narrado | 3: personas completas basadas en supuestos sin fuente; capturas categorizadas con anotaciones parciales; falta escenario o hay capturas descriptivas | 2: usuarios genéricos o un perfil; capturas sin categoría ni anotación; descripción superficial | 0 a 1: caso confuso, sin usuarios identificables o sin capturas correspondientes al caso | F1 p. 1 |
| C2 Aplicación de conceptos de IHC, cognición y percepción | 5 | 5: GUI frente a UX; tres dimensiones cognitivas ancladas a capturas; ley o modelo cuantitativo correcto; modelo mental; Norman con fase de fallo; HTA o GOMS; errores clasificados | 3.5 a 4: análisis sólido con ley, capturas y errores, pero faltan dos o más elementos entre GUI/UX, modelo mental, tareas formales o clasificación de errores | 2 a 3: teoría poco vinculada a pantallas o una sola dimensión cognitiva; diagramas sin problemas anotados | 0 a 1.5: conceptos ausentes o incorrectos; se confunden modelos de interacción con arquitectura técnica | F1 p. 1 |
| C3 Diseño centrado en el usuario y heurísticas de Nielsen | 4 | 4: evalúa las 10 heurísticas; captura por hallazgo relevante; severidad o prioridad; perfil afectado; evidencia concreta de minimalismo y prevención de errores | 3: tabla de 10 heurísticas y problemas del caso, sin captura por hallazgo ni severidad; conexión parcial con perfiles | 2: menos de seis heurísticas o problemas genéricos; DCU ausente o desconectado | 0 a 1: heurísticas ausentes, incorrectas o solo teóricas; opiniones estéticas | F1 p. 2 |
| C4 Exposición, argumentación y respuestas | 7 | 6 a 7: todos dominan y exponen sin lectura literal; secuencia completa; edición cuidada; teoría conectada con hallazgos; limitaciones; cualquier integrante responde; 15 a 20 minutos | 4 a 5.5: todos exponen; dominio mayoritario; transiciones o edición mejorables; respuestas puntualmente vagas; leve desfase | 2 a 3.5: lectura frecuente; respuestas que repiten slides; dominio desigual; desorden o desfase notorio | 0 a 1.5: lectura permanente, contradicciones o falta de respuestas; solo participan uno o dos; sin estructura | F1 p. 2 |

Para C1, una persona completa incluye edad, ocupación, nivel digital, metas, frustraciones y comportamiento; su contexto incluye dispositivo, conectividad y frecuencia. Para C2, las tres dimensiones nombradas son carga cognitiva, memoria y atención/percepción. El cambio de código por sí solo no acredita esos análisis.

## APF2 criterios y niveles

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

## R3 criterios y niveles

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

## Matriz de implementación y evidencia

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

## Correspondencia técnica preliminar con WCAG 2.1

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

## Evidencia académica que el código no reemplaza

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

## Orden de la exposición R3

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

## Cierre de la matriz

Para actualizar este documento tras la implementación, registrar por cada comprobación: fecha, versión del prototipo, proceso/pantalla, procedimiento, resultado observado y ruta de evidencia. Diferenciar resultado automático, revisión manual, sesión con usuario real y simulación. La calificación depende de la evidencia completa y de la evaluación docente; esta matriz no garantiza una nota.
