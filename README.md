# Falabella IHM

Backend del prototipo académico de búsqueda y preparación de compra de Falabella, con Spring Boot, Java 21 y MySQL. Los productos y precios son ficticios; el cierre es una simulación sin cobro ni pedido real.

La rama `dev` integra el backend de `feature-backend.structure` y la documentación de `feature-frontend.specification`. La carpeta `front` conserva la base inicial; las nuevas interfaces siguen pendientes de implementación según [la especificación frontend](docs/README_FRONTEND.md).

## Documentación del proyecto

| Documento | Contenido |
| --- | --- |
| [Contrato de API](docs/API.md) | Endpoints, filtros, paginación, datos, ejemplos, errores e idempotencia |
| [Modelo de datos](docs/BASE_DATOS.md) | Tablas MySQL, relaciones, migraciones y datos de demostración |
| [Verificación](docs/VERIFICACION.md) | Comprobaciones realmente ejecutadas y sus límites |
| [Entrega frontend](docs/ENTREGA_FRONTEND.md) | Guía autónoma de rediseño, responsividad, accesibilidad, contrato API y rúbricas |

La [entrega frontend en Markdown](docs/ENTREGA_FRONTEND.md) define inicio, catálogo, filtros, comparación, ficha, favoritos, carrito, entrega, revisión y confirmación. Estas interfaces están **pendientes de implementación por el equipo frontend**; la integración actual incorpora su documentación.

## Backend implementado

- Catálogo almacenado en MySQL, con búsqueda, seis criterios principales de filtrado, atributos secundarios, orden y paginación.
- Detalle de producto y metadatos de filtros y entrega.
- Cotización calculada con precios del servidor y validación de cantidades/modalidad.
- Simulación con validación de dirección y condiciones, persistencia transaccional y reintentos sin duplicados.
- Errores JSON asociados a campos y CORS por orígenes explícitos.
- Migraciones Flyway y configuración local de MySQL mediante Docker Compose o instalación propia.

Carrito, favoritos y comparación serán estado del cliente en esta etapa. No hay cuentas ni sincronización entre dispositivos. La meta multiplataforma se especifica como interfaz responsive, accesible y funcional, sin atribuirle una sincronización que no existe.

## Arranque

Requisitos: JDK 21, `JAVA_HOME`, y una base MySQL dedicada con credenciales. No se necesita Maven global.

Desde `back`, prepara MySQL con [las instrucciones del backend](back/README.md), configura `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`, y ejecuta:

```powershell
.\mvnw.cmd spring-boot:run
```

API local: [http://localhost:8080/api/health](http://localhost:8080/api/health). Salud de la base: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health).

El backend requiere MySQL durante la ejecución normal. H2 está restringido a las pruebas rápidas y no es una alternativa silenciosa de producción.

## Pruebas

Desde `back`:

```powershell
.\mvnw.cmd verify
```

Para las pruebas adicionales con MySQL real, configurar una base dedicada cuyo nombre termine en `_test`, definir `IT_DB_URL`, `IT_DB_USERNAME` e `IT_DB_PASSWORD`, y ejecutar:

```powershell
.\mvnw.cmd -Pmysql-it verify
```

Consulta [VERIFICACION.md](docs/VERIFICACION.md) para los resultados de esta entrega. Las auditorías visuales, WAVE, NVDA y sesiones de usuarios del nuevo frontend siguen pendientes; el código del backend no sustituye la evidencia de las rúbricas.
