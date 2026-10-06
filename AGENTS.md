# Repository Guidance

## Project map
- UI routes use the Next.js App Router in `app/`; server endpoints use the Pages API Router in `pages/api/`.
- League calculations and domain models live in `classes/custom/`; Sleeper API models live in `classes/sleeper/`; shared roster and scoring rules live in `utility/rosterFunctions.ts`.
- Keep MongoDB access server-side in API routes or server-only helpers such as `lib/mongodb.ts`.
- The UI uses Chakra UI v2, Nivo charts, SWR, Axios, and React contexts. Follow nearby component patterns and the custom theme in `theme/`.

## Working conventions
- Trace the specific route and component that owns a requested UI change. Keep changes scoped to that surface; only update other routes or shared components when requested or when they genuinely share the behavior.
- Loading skeletons should reflect the actual content layout of their route, not generic placeholder blocks.
- Check APIs against the versions in `package.json` and `package-lock.json` and nearby working examples. Nivo point fill currently uses `pointColor={{from: 'series.color'}}`; other color options can use different context keys.
- When compiler errors appear, verify the workspace TypeScript version and installed package before changing compiler settings or dependencies. This project previously encountered an incomplete TypeScript 7 install; its declared TypeScript version is `~5.9.3`.

## Setup and validation
- See [README.md](README.md) for setup and the `MONGODB_URI` requirement; do not copy credentials from examples into source files.
- `.nvmrc` requests Node `26.9.0`, while `package.json` allows Node `>=20.9.0` and CI currently tests Node 20. Use the project version locally and account for CI's Node 20 environment when changing runtime-dependent code.
- Run focused tests when available, then `npm test` and `npm run build` for meaningful changes. These are the checks used by [CI](.github/workflows/test.yml).
- Existing tests use Jest, jsdom, and Testing Library. Start with [tests/coreLogic.test.ts](tests/coreLogic.test.ts) for scoring and roster logic; use neighboring component tests for UI behavior.