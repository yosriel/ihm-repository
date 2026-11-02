# Falabella IHM

Base del proyecto académico para mejorar la experiencia de búsqueda de productos y selección de entrega de Falabella. Incluye dos aplicaciones independientes, preparadas para trabajar juntas.

```text
ihm-repository/
├── front/          React, TypeScript y Vite
│   └── src/
│       ├── components/
│       └── services/
├── back/           Spring Boot, Java 21 y Maven Wrapper
│   └── src/
│       ├── main/
│       └── test/
└── REQUISITOS.md   Alcance extraído de los archivos APF1 y APF2
```

## Estado actual

- Pantalla inicial en español con presentación del proyecto y estado de conexión.
- Backend con `GET /api/health` y `GET /actuator/health`.
- Proxy de desarrollo: las peticiones de React a `/api` llegan a Spring Boot.
- Los recorridos de catálogo, carrito, dirección y entrega están pendientes de implementación.

## Requisitos del equipo

- Node.js 22.12 o posterior de la rama 22, o Node.js 24 o posterior, con npm.
- JDK 21 con `JAVA_HOME` apuntando a su carpeta de instalación.
- Acceso a Internet para descargar dependencias la primera vez.

Versiones iniciales: React 19.3, TypeScript 7, Vite 8.3 y Spring Boot 4.1.2. `front/package-lock.json` fija las dependencias de npm; el backend incluye Maven Wrapper y no requiere Maven global.

La estructura del cliente sigue la [guía oficial de React con Vite](https://react.dev/learn/build-a-react-app-from-scratch). El backend usa una versión estable disponible en [Spring Initializr](https://start.spring.io/).

## Iniciar en Windows con PowerShell

Abre dos terminales desde la raíz del repositorio.

**Terminal 1, backend:**

```powershell
cd back
.\mvnw.cmd spring-boot:run
```

Servicio: http://localhost:8080/api/health

**Terminal 2, frontend:**

```powershell
cd front
npm.cmd ci
npm.cmd run dev
```

Abre http://localhost:5173. El pie de página debe indicar «Servicio conectado» cuando ambas aplicaciones estén iniciadas. Si abriste la página antes de iniciar el backend, pulsa «Reintentar».

En macOS o Linux, usa `./mvnw` y `npm` en lugar de `mvnw.cmd` y `npm.cmd`.

## Configuración local

Los valores predeterminados funcionan sin crear archivos de entorno. Para modificarlos:

```powershell
Copy-Item front/.env.example front/.env.local
```

- `VITE_API_BASE_URL`: ruta de la API que usa el navegador; por defecto `/api`.
- `BACKEND_URL`: destino del proxy de Vite; por defecto `http://localhost:8080`.
- `PORT`: variable del proceso de Spring Boot; por defecto `8080`.

Si cambias `PORT`, ajusta también `BACKEND_URL` y reinicia Vite. Las variables `VITE_` son públicas: no deben contener contraseñas ni secretos.

El proxy se aplica al servidor de desarrollo. Para desplegar la compilación de React, habrá que configurar el servidor que dirija `/api` a Spring Boot o definir una URL de API y una política CORS concreta.

## Verificación

En `front`:

```powershell
npm.cmd run lint
npm.cmd run build
```

En `back`:

```powershell
.\mvnw.cmd verify
```

Respuesta esperada de `/api/health`:

```json
{"status":"UP","application":"falabella-ihm-back"}
```

## Referencias y siguiente etapa

El [resumen de requisitos](REQUISITOS.md) distingue las funcionalidades descritas en las referencias de lo que ya está implementado. La siguiente etapa es construir el catálogo y los filtros, seguida del carrito y la entrega. La persistencia, las cuentas de usuario y los servicios de direcciones se definirán al abordar esos módulos.
