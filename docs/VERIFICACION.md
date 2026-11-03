# Verificación de la entrega backend

Este documento conserva la verificación histórica de la entrega backend `cb0df79`. Para el frontend incorporado después, consulta [VERIFICACION_FRONTEND.md](VERIFICACION_FRONTEND.md).

Fecha: 2 de noviembre de 2026. Alcance verificado: API Spring Boot, migraciones, persistencia MySQL, reglas de la simulación y documentación para el equipo frontend.

## Resultados ejecutados

| Comprobación | Entorno y procedimiento | Resultado |
| --- | --- | --- |
| Suite rápida | JDK 21.0.11; `back/mvnw.cmd verify`; H2 temporal en modo MySQL solo para tests | 53 pruebas, 0 fallos, 0 errores |
| Integración MySQL | `back/mvnw.cmd -Pmysql-it verify` con `IT_DB_*` hacia una instancia nueva MySQL 8.0.46 | 3 pruebas adicionales, 0 fallos, 0 errores |
| Migraciones reales | Flyway aplicó V1 y V2 sobre `ihm_reboot_test` vacía; segundo arranque validó versiones sin recrear datos | 4 tablas del dominio, 6 productos y 24 características; historial de dos migraciones |
| Concurrencia | Dos hilos finalizaron la misma carga con la misma clave sobre MySQL | Mismo identificador, un registro y una línea, sin descontar stock |
| Historial de importes | Cambio temporal de precio de un producto en la base aislada después de simular; reintento con misma carga y clave | Se recuperó el total registrado; se restauró el precio de la base de prueba |
| API HTTP real | JAR empaquetado, puerto 8081, variables `DB_*` y MySQL temporal | 7 escenarios correctos descritos abajo |
| Configuración Compose | `docker compose -f back/compose.yaml config --quiet`, con valores temporales para las contraseñas requeridas | Configuración válida; no se levantó el contenedor |
| Alcance de frontend | `git diff -- front` después de retirar el trabajo iniciado antes del cambio de alcance | Sin cambios respecto de la base previa |

Las pruebas de integración exigen un nombre de base terminado en `_test` antes de abrir la conexión. La instancia de verificación utilizó el puerto 3308, un directorio temporal y credenciales generadas para esta sesión. No se usaron credenciales ni tablas del servicio MySQL80 ya instalado. La API y la instancia temporal se detuvieron al finalizar la verificación.

## Casos cubiertos por la suite rápida

Catálogo: detalle/404, búsqueda, combinación de marca/presupuesto/retiro, calificación/descuento/vendedor/capacidad/color, orden, paginación, resultados vacíos, metadatos, rangos inválidos y tratamiento literal de comillas y comodines.

Cotización: una o dos unidades, costo de domicilio una vez por carrito, retiro gratuito del ejemplo, precios calculados desde el catálogo pese a campos manipulados del cliente, cantidades fuera de límite, fraccionarias o nulas, productos repetidos, inexistentes, carrito vacío y retiro incompatible.

Finalización: condiciones, dirección requerida, distrito disponible, calle con cinco letras como mínimo, número válido o alternativa sin número, errores JSON, persistencia de líneas y resultado, clave requerida, reintento sin duplicados, conflicto al cambiar la dirección y CORS de un origen permitido frente a uno no configurado.

## Escenarios HTTP comprobados

1. Catálogo filtrado por búsqueda, Taurus, máximo S/ 400 y retiro: un resultado; cabecera CORS correcta.
2. Opciones de filtros y entrega: cuatro marcas y seis distritos.
3. Cotización de dos Taurus con un precio ficticio de S/ 1 enviado por el cliente: el total del servidor fue S/ 790.90.
4. Finalización y reintento de la misma carga con la misma clave: mismo resultado.
5. Reutilización de la clave con otra dirección: HTTP 409.
6. Número de domicilio vacío sin alternativa sin número: HTTP 400 y `field: address.number`.
7. Reinicio completo del JAR y reintento de la primera finalización: mismo resultado recuperado de MySQL.

También se comprobó `/actuator/health` con la conexión activa. Los datos usados son los ejemplos académicos del catálogo, no datos personales de usuarios.

## Artefactos técnicos

Maven genera el JAR en `back/target/ihm-back-0.0.1-SNAPSHOT.jar`, los resultados rápidos en `back/target/surefire-reports/` y los de MySQL en `back/target/failsafe-reports/`. Estas salidas no se versionan y pueden regenerarse con las instrucciones del backend. Los scripts y registros temporales de la comprobación HTTP no forman parte del producto.

El servidor recomendado por Compose es MySQL 8.4. Se validó la configuración de Compose, pero no su arranque porque el motor Docker no estaba activo; las pruebas reales de base de datos se ejecutaron con MySQL 8.0.46. No se atribuye a MySQL 8.4 una ejecución que no se realizó.

## Estado del frontend al entregar el backend

Al entregar el backend el 2 de noviembre todavía no se habían desarrollado nuevas pantallas ni ejecutado comprobaciones del rediseño. Ese estado histórico fue actualizado por la implementación de `feature/apf3-frontend`; los resultados actuales y sus pendientes se registran en [VERIFICACION_FRONTEND.md](VERIFICACION_FRONTEND.md).

[La especificación frontend previa](GUIA_FRONTEND.md), conservada en este repositorio, define los casos por tamaño, plataforma y estado. [La matriz de rúbricas](MATRIZ_RUBRICAS.md) identifica la auditoría, las capturas anotadas, los grupos, las métricas y las evidencias humanas que siguen pendientes. Los resultados de backend no demuestran conformidad WCAG ni completan por sí solos las rúbricas.

## Integración en dev el 3 de noviembre de 2026

Se fusionaron `feature-backend.structure` (`cb0df79`) y `feature-frontend.specification` (`5d60eb8`) mediante dos commits de integración separados, sin conflictos. El código de `front` permanece como en la base inicial; la rama frontend aporta especificaciones y fotografías referenciales.

Se volvió a ejecutar `back/mvnw.cmd -B verify` sobre la versión integrada: **53 pruebas, 0 fallos y 0 errores**, con generación del JAR. También se comprobaron los enlaces locales de Markdown y se sustituyeron las referencias al nombre anterior de la rama frontend.

Las tres pruebas con MySQL real corresponden a la verificación del 2 de noviembre descrita arriba; no se repitieron durante esta integración. Esta fusión no configura ni inicia una base permanente del equipo.
