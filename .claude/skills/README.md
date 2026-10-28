# Skills de diseño

- `landing-page-design` — de https://github.com/elayadesign/ai-design-skills (MIT)
- `redesign-existing-projects` — de https://github.com/elayadesign/redesign-skill (MIT)

## Prioridad en este proyecto

Manda el sistema de diseño «Arcoíris» de la app sobre los «Design values» de las skills:

- Fuentes: Outfit (texto) y DM Mono (etiquetas). No Geist/Manrope/Poppins.
- Colores: papel `#FFF9EC`, tinta `#1A1530` y los colores de cada prueba. Solo modo claro.
- Forma: radio de 28px en tarjetas, bordes de 2px en tinta, sin degradado en el titular.
- Iconos: los SVG propios de cada prueba.
- Se permiten guiones y signos de exclamación: forman parte del tono del juego.

De las skills se aplica la estructura (hero, cómo se juega, tagline, FAQ, CTA final),
el motion (`cubic-bezier(0.22, 1, 0.36, 1)`, 500ms movimiento / 300ms color, reveals con
IntersectionObserver, `prefers-reduced-motion`), los estados (hover/active/focus) y los
requisitos de publicación (skip link, 404, metadatos, FAQ con schema).
