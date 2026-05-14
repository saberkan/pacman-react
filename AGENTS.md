# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is **pacman-react** — a browser-based Pac-Man game built with React 18, TypeScript, and styled-components. It is a client-side SPA with no backend or database.

### Commands

| Task | Command |
|------|---------|
| Install deps | `yarn install --frozen-lockfile` |
| Dev server | `BROWSER=none yarn start` (port 3000) |
| Lint | `npx eslint src/` |
| Tests | `CI=true yarn test` |
| Build | `yarn build` |

### Notes

- The dev server runs on port 3000 by default. Set `BROWSER=none` to prevent it from trying to open a browser.
- Use `CI=true` when running tests to avoid Jest watch mode (which requires TTY input).
- ESLint is configured inline in `package.json` under `eslintConfig`; there is no standalone `.eslintrc` file.
- There are existing React hooks dependency warnings in lint/build output — these are pre-existing and not regressions.
- The production build assumes `homepage` is `/pacman-react/` (configured in `package.json`). The dev server ignores this.
