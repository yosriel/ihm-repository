# Entrega para el equipo frontend

Este documento conserva la especificación y planificación previas a la implementación. El frontend funcional se describe en [FRONTEND.md](FRONTEND.md) y sus resultados y pendientes actuales en [VERIFICACION_FRONTEND.md](VERIFICACION_FRONTEND.md). Los estados de planificación del texto original no sustituyen ese registro de ejecución.

La especificación se preparó en `feature-frontend.specification`, creada desde la base inicial de `dev`, y se integró en `dev` el 3 de noviembre de 2026 junto con el backend. Su aporte contiene documentación y fotografías referenciales; no implementa nuevas interfaces. La carpeta `front` conserva la base inicial y `back` ya incluye la API con MySQL.

## Documento que se puede compartir

[ENTREGA_FRONTEND.md](ENTREGA_FRONTEND.md) reúne en un único Markdown el rediseño, los recorridos, la responsividad, accesibilidad, contratos de API, rúbricas y fuentes visuales. Es la versión autónoma para entregar al equipo.

Las fuentes editables de esa entrega se mantienen separadas para facilitar su actualización:

| Documento | Responsabilidad |
| --- | --- |
| [GUIA_FRONTEND.md](GUIA_FRONTEND.md) | Pantallas, componentes, navegación, estados y criterios de aceptación |
| [API.md](API.md) | Copia versionada del contrato del backend para la integración |
| [MATRIZ_RUBRICAS.md](MATRIZ_RUBRICAS.md) | Relación con APF1, APF2 y R3 y evidencia pendiente |
| [FUENTES_IMAGENES.md](FUENTES_IMAGENES.md) | Origen y límites de las fotografías opcionales de `frontend-assets/` |

La prioridad responsive incluye 360, 390, 768, 1024 y 1440 px; reflow a 320 px CSS; zoom; orientación; y revisión en navegadores de escritorio, iOS y Android. Son criterios para implementar y comprobar, no resultados ya medidos sobre un nuevo frontend.

## Backend para integrar

La API completa con Spring Boot y MySQL ya está integrada en `dev`, procedente de [feature-backend.structure](https://github.com/yosriel/ihm-repository/tree/feature-backend.structure). Puede ejecutarse desde `back` siguiendo [sus instrucciones](../back/README.md), con las variables de conexión y una base MySQL del proyecto.

La versión funcional del contrato parte del commit backend **`cb0df79e54609e3343dbd197a52284026cb28193`**. El [contrato de esa versión](https://github.com/yosriel/ihm-repository/blob/cb0df79e54609e3343dbd197a52284026cb28193/docs/API.md) permite consultar el punto de partida; [API.md](API.md) es el contrato vigente en `dev`. La integración ajustó sus enlaces internos, sin cambiar rutas ni estructuras de respuesta. Una actualización funcional del backend requiere revisar también la entrega consolidada.

Las dos ramas aportaron inicialmente el mismo contrato, lo que permitió combinarlas sin conflicto. El equipo frontend consume HTTP; no necesita ni debe incluir credenciales MySQL en el navegador.

## Orden de versiones

- Base común: `dev` en `13a41ab`.
- Funcionalidad backend: `feature-backend.structure`.
- Especificación frontend: `feature-frontend.specification`.

Ambas ramas partieron de la base indicada y se fusionaron en `dev` mediante commits de integración separados el 3 de noviembre de 2026. `main` conserva su versión anterior. Los siguientes cambios se prepararán como nuevas ramas de funcionalidad desde `dev` según el flujo del equipo.
