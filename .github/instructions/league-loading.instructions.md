---
name: visualeague-league-loading
description: "Use when creating or changing loading states for league routes."
applyTo: "app/league/**/loading.tsx"
---

- Inspect the matching route's `page.tsx`, layout, and major child components before changing its loading state. League routes have distinct content and responsive layouts.
- Mirror the page's major regions, order, and desktop/mobile arrangement with Chakra UI skeletons. Match approximate content dimensions so the loading state does not shift the page when data arrives.
- Keep route loading components data-independent: render placeholder shapes rather than importing page components that require league context or loaded API data.
- Keep nested route loading states specific to their page; use a shared fallback only when the routes genuinely share the same layout.
- Validate the affected route at mobile and desktop sizes and run `npm run build` when the loading component's types or rendering change.