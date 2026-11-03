# Backend Falabella IHM

API académica con Spring Boot, Java 21, JDBC y MySQL. El catálogo y las simulaciones se guardan en MySQL mediante migraciones Flyway. Los productos y precios son datos ficticios; finalizar una simulación no realiza cobros, pedidos ni reservas de inventario.

## Requisitos

- JDK 21 y `JAVA_HOME` configurado.
- Docker con Docker Compose para la base local aislada, o una base MySQL propia con sus credenciales.
- Acceso a Internet para descargar las dependencias iniciales. Maven Wrapper viene incluido.

La aplicación utiliza MySQL en ejecución normal y requiere `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`. No incluye una base H2 alternativa en producción. H2 se usa exclusivamente durante las pruebas rápidas.

## Base local con Docker

Ejecuta los siguientes pasos desde `back` en PowerShell. La base utiliza el puerto **3307** del equipo y el volumen propio `ihm_mysql_data`, de modo que no necesita utilizar una instalación MySQL existente en el puerto 3306.

```powershell
Copy-Item .env.example .env
```

Edita `.env` y completa `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD` con dos contraseñas propias. Compose detendrá el arranque si alguno de esos valores está vacío. El usuario de aplicación es `ihm_app` y la base es `falabella_ihm`; el backend no necesita la contraseña de root.

```powershell
docker compose up -d --wait
docker compose ps
```

El contenedor queda disponible en `localhost:3307`. La primera inicialización crea el usuario y la base. Cambiar posteriormente las variables de contraseña no modifica las credenciales ya guardadas en el volumen: se deben cambiar dentro de esa base de manera explícita. `docker compose stop` detiene el contenedor conservando sus datos.

## Iniciar la API

Spring Boot no carga automáticamente el archivo `.env` de Docker Compose. Define las variables del proceso de la terminal antes de iniciar la aplicación. El siguiente ejemplo importa únicamente los valores reconocidos de un `.env` simple, sin ejecutar su contenido:

```powershell
Get-Content -LiteralPath .env | ForEach-Object {
    if ($_ -match '^\s*(DB_URL|DB_USERNAME|DB_PASSWORD|FRONTEND_ORIGINS|PORT)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
.\mvnw.cmd spring-boot:run
```

También puedes definir cada valor directamente, por ejemplo `$env:DB_USERNAME = 'ihm_app'`. Para contraseñas con `$`, define `DB_PASSWORD` directamente con el valor original en PowerShell; Compose necesita escapar ese carácter como `$$` en `.env`. No guardes el `.env` con credenciales en Git.

Flyway aplica `V1__create_schema.sql` y `V2__seed_demo_products.sql` durante el arranque. No se utiliza creación o eliminación automática de tablas. Las migraciones deben ejecutarse sobre una base dedicada al proyecto.

Por defecto, la API escucha en `http://localhost:8080`:

- `GET /api/health`: estado de la aplicación.
- `GET /actuator/health`: estado de los componentes, incluida la conexión a MySQL.
- `GET /api/products`: catálogo filtrado y paginado.
- `GET /api/products/{id}`: detalle de un producto.
- `GET /api/catalog/filters`: opciones disponibles para los filtros.
- `GET /api/checkout/options`: condiciones de la simulación y distritos disponibles.
- `POST /api/checkout/quote`: cálculo de importes con precios del servidor.
- `POST /api/checkout/simulate`: validación y registro de una simulación académica.

`FRONTEND_ORIGINS` define los orígenes CORS autorizados, separados por comas; su valor inicial es `http://localhost:5173`. `PORT` permite cambiar el puerto HTTP del backend.

## Cotizaciones y simulaciones

La cotización recibe `items` con `productId` y `quantity`, y `deliveryMethod` con `home` o `pickup`. Las cantidades deben ser enteras entre 1 y 2 por producto, sin líneas repetidas. Los precios y los totales enviados por un cliente no se utilizan para calcular el importe.

Una simulación añade `acceptedTerms: true` y, para entrega a domicilio, `address` con distrito, calle y número o `noNumber: true`. La dirección solo se usa para validar esta solicitud: no se guarda en las tablas de simulaciones o de sus líneas.

Cada `POST /api/checkout/simulate` debe incluir una cabecera `Idempotency-Key` con un UUID. El cliente debe generar una clave nueva al iniciar una simulación y reutilizarla al reintentar la misma solicitud. Una repetición con la misma clave y carga devuelve el mismo `simulationId`; reutilizar esa clave para una carga distinta produce `409 Conflict`. Cada registro y sus líneas se guardan dentro de una transacción.

Ejemplo de clave desde PowerShell:

```powershell
$simulationKey = [guid]::NewGuid().ToString()
```

Las respuestas de validación incluyen `message` y, cuando corresponde, `field`, para que el frontend pueda asociarlas al control correspondiente.

## Pruebas

Pruebas rápidas con una base H2 temporal en modo de compatibilidad MySQL:

```powershell
.\mvnw.cmd verify
```

Estas pruebas no requieren credenciales MySQL y no utilizan una base del equipo. Las pruebas de integración necesitan una **base MySQL de prueba dedicada**; no requieren Testcontainers. Crear una base cuyo nombre termine en `_test`, distinta de la base de desarrollo, y configurar sus credenciales:

```powershell
$env:IT_DB_URL = 'jdbc:mysql://localhost:3307/ihm_reboot_test'
$env:IT_DB_USERNAME = 'ihm_test'
# Define IT_DB_PASSWORD con la contraseña de ese usuario de prueba.
.\mvnw.cmd -Pmysql-it verify
```

Las migraciones también se aplican en esa base de prueba y los tests añaden simulaciones. No apuntar estas variables a información de uso real. La suite comprueba el motor MySQL, migraciones, persistencia, reintentos simultáneos e invariancia del resultado ya registrado al cambiar un precio. En esta entrega se ejecutó sobre una instancia MySQL 8.0.46 aislada en un puerto distinto del servicio existente; el Compose incluido propone MySQL 8.4.

En macOS o Linux puedes ejecutar los mismos objetivos con `sh ./mvnw` y exportar las variables de entorno antes del arranque.

## Si utilizas tu instalación MySQL

Crear una base nueva y un usuario del proyecto desde una cuenta administradora. No reutilizar tablas ajenas. Sustituye la contraseña ilustrativa antes de ejecutar:

```sql
CREATE DATABASE falabella_ihm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ihm_app'@'localhost' IDENTIFIED BY '<tu-contraseña-propia>';
GRANT ALL PRIVILEGES ON falabella_ihm.* TO 'ihm_app'@'localhost';
```

Configura `DB_URL` con el puerto de esa instalación, por ejemplo `jdbc:mysql://localhost:3306/falabella_ihm`, y `DB_USERNAME` / `DB_PASSWORD` con el usuario creado. Flyway crea únicamente las tablas dentro de la base configurada. No se ha cambiado el servicio MySQL existente del equipo durante la verificación de esta entrega.

El [contrato de API](../docs/API.md) detalla filtros, paginación, ejemplos y validaciones. El [modelo de datos](../docs/BASE_DATOS.md) describe las tablas y los límites de persistencia.
