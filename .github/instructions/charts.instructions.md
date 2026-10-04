---
name: visualeague-charts
description: "Use when creating or changing Nivo charts in components/charts."
applyTo: "components/charts/**/*.tsx"
---

- Confirm which route and chart the request refers to before editing; several league and team pages use separate chart components. Keep the change scoped unless the request explicitly asks to update shared behavior across charts.
- Follow the chart's existing data shape, responsive container sizing, and nearby style conventions. For layout or loading changes, validate against the actual page that renders the chart.
- Check Nivo props against the installed version and its types or working examples. Do not assume color context keys are interchangeable: current line charts use `pointColor={{from: 'series.color'}}`; other options such as `pointBorderColor` may use a different context.
- When asked to update all charts, search the chart directory for every relevant usage and verify each intended component rather than extrapolating from one chart.
- Run the relevant tests when available and `npm run build` for chart changes that affect types or rendering.