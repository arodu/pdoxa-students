# Academic Schedule Builder

Armador de horarios académicos: permite explorar los cursos y secciones de un proyecto, elegir
secciones, detectar choques de horario y **compartir o imprimir** el horario resultante. Diseñado
**mobile-first**, con el celular como caso principal.

- **Stack:** Vue 3 (Composition API, `<script setup>`) + Vite. JavaScript plano.
- **Tema:** plantilla [Mazer](https://github.com/zuramai/mazer) (Bootstrap 5), con modo claro/oscuro.
- **Estado:** singleton en `src/composables/useProjectState.js` (selección sincronizada con la URL y `localStorage`).

## Requisitos

- Node.js 20+ (recomendado) y npm.

## Correr localmente

```bash
npm install
npm run dev
```

Abrí la URL que imprime Vite y entrá el identificador del proyecto (ej. `2_ais`).

## Backend

La app consume un único endpoint: `GET {VITE_API_BASE_URL}/api/v1/schedule/{slug}`.

Configurá la base en `.env` (ver `.env.example`):

```
VITE_API_BASE_URL=https://demo.arodu.dev/pdoxa
```

## Tests

```bash
npm run test
```

Vitest + `happy-dom`; los tests viven junto a los fuentes (`src/**/*.{test,spec}.js`).

## Build y deploy

```bash
npm run build   # genera dist/ (+ dist/404.html y dist/.nojekyll)
npm run preview
```

El deploy a **GitHub Pages** corre por GitHub Actions (`.github/workflows/deploy.yml`) usando
`actions/deploy-pages`. Para subrutas, definí `VITE_BASE_PATH` (ej. `/<repo>/`).

## Licencia

[MIT](LICENSE).
