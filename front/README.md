# Frontend Falabella IHM

Aplicación React con TypeScript y Vite. Por ahora muestra la presentación del proyecto y consulta el estado del backend; los recorridos de compra aún no están implementados.

```powershell
npm.cmd ci
npm.cmd run dev
```

Abre http://localhost:5173 y ejecuta el backend en otra terminal. Las peticiones a `/api` se redirigen a `http://localhost:8080` durante el desarrollo.

- `src/App.tsx`: pantalla inicial.
- `src/components/ServiceStatus.tsx`: estado de conexión y reintento.
- `src/services/api.ts`: cliente HTTP y validación de la respuesta de salud.
- `.env.example`: configuración local opcional.
- `npm.cmd run lint`: revisión del código.
- `npm.cmd run build`: revisión de tipos y generación de `dist`.

Consulta [las instrucciones del proyecto](../README.md) para requisitos del equipo, backend y configuración del proxy.
