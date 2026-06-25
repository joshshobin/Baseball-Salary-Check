# BaseballSalaryCheck

A baseball analytics web app that predicts an MLB hitter's fair-value salary from their batting stats (a linear-regression model) and tells you whether a given salary is Overpaid, Underpaid, or Paid Fairly.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/baseball-salary-check run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database or external env required — the dataset is static reference data loaded into memory.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (in-memory dataset, no DB)
- Frontend: React + Vite, Tailwind, shadcn/ui, TanStack Query
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)

## Where things live

- API contract: `lib/api-spec/openapi.yaml` (source of truth)
- Prediction model + data loading: `artifacts/api-server/src/lib/model.ts`
- Static data: `artifacts/api-server/data/` — `model_params.json` (regression coefficients + MinMax scaler), `players_data.json` (10,284 player-seasons, 1,872 players, 1984–2015)
- API routes: `artifacts/api-server/src/routes/players.ts`
- Frontend sections: `artifacts/baseball-salary-check/src/components/` (Predictor, Summary, Leaderboards, PlayerTable)
- Theme: `artifacts/baseball-salary-check/src/index.css` (dark stadium theme, green accent, Inter font)

## Architecture decisions

- The original model was a scikit-learn `LinearRegression` over MinMax-scaled features predicting `log10(salary)`. Rather than ship Python at runtime, the model params were extracted to JSON and the math is reimplemented in TypeScript (`predictSalary` in `model.ts`). This was verified to match the original `.joblib` model on all 10,284 dataset rows.
- Prediction: `log_salary = intercept + Σ((stat_i * scaler_scale_i + scaler_min_i) * coef_i)`, then `salary = 10^log_salary`. Feature order is fixed in `FEATURE_COLUMNS`.
- Verdict: percent difference between observed and predicted salary; within ±10% (`FAIR_THRESHOLD_PCT`) is "Paid Fairly", above is "Overpaid", below is "Underpaid".
- No database: the dataset is read-only reference data, loaded once at server startup and held in memory with precomputed valuations.

## Product

Single-page web app:
- Fair Value Predictor: search a player season, prefill their actual salary, submit a salary to evaluate, get a verdict with a gauge bar and fair-value card.
- Dataset Overview: aggregate stats and verdict breakdown.
- Leaderboards: most overpaid, most underpaid, highest paid.
- Players & Salaries: searchable, sortable, paginated, verdict-filterable table.

## User preferences

- No emojis anywhere in the UI.

## Gotchas

- Team values are Lahman codes (e.g. "BOS", "NYA"), not city/full names — table/predictor search matches on player id and team code.
- `players_data.json` is ~6.4MB; it is bundled via `fs.readFileSync` from `artifacts/api-server/data/` resolved against the workspace root (not `__dirname`, which points at the esbuild output).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
