# Entrega para el equipo frontend

Esta rama, `codex/feature-frontend-specification`, se creó directamente desde `dev`. Sus cambios contienen documentación y fotografías referenciales; no implementan nuevas interfaces ni incorporan los cambios del backend. Las carpetas base `front` y `back` ya existían en `dev` y se conservan sin modificaciones en esta rama.

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

La API completa con Spring Boot y MySQL se encuentra en [feature-backend.structure](https://github.com/yosriel/ihm-repository/tree/feature-backend.structure). Debe ejecutarse desde esa rama o desde un entorno de integración que contenga sus cambios. El esqueleto de backend heredado de `dev` en esta rama no implementa ese contrato completo.

La copia local de `API.md` corresponde exactamente al commit backend **`cb0df79e54609e3343dbd197a52284026cb28193`**, de esta entrega. El [contrato canónico de esa versión](https://github.com/yosriel/ihm-repository/blob/cb0df79e54609e3343dbd197a52284026cb28193/docs/API.md) queda identificado por ese commit; una actualización del backend requiere revisar la copia y la entrega consolidada antes de integrar.

Se copió el mismo archivo de contrato, sin alterar su contenido, para evitar contratos distintos en las dos ramas. El equipo frontend consume HTTP; no necesita ni debe incluir credenciales MySQL en el navegador.

## Orden de versiones

- Base común: `dev` en `13a41ab`.
- Funcionalidad backend: `feature-backend.structure`.
- Especificación frontend: `codex/feature-frontend-specification`.

Ambas ramas son independientes desde la base indicada. La publicación de estos cambios no los fusiona automáticamente con `dev` o `main`; esa integración se realizará mediante la revisión que establezca el equipo.
