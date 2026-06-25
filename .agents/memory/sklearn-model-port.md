---
name: Porting scikit-learn models to TypeScript at runtime
description: When a bundled project ships a .joblib/.pkl model, extract params to JSON and reimplement the math in TS instead of running Python in production.
---

# Porting a scikit-learn model to TypeScript

When a user's bundled project includes a trained scikit-learn model (`.joblib`/`.pkl`) plus a scaler, do NOT ship Python at runtime. Instead:

1. Use a one-off Python script to extract the model params to JSON: regression `coef_` (array), `intercept_` (scalar), and the scaler's `min_`/`scale_` arrays (for `MinMaxScaler`). Also capture the exact feature column order.
2. Reimplement inference in TypeScript. For a `LinearRegression` over `MinMaxScaler`-scaled features predicting `log10(target)`:
   `logY = intercept + Σ_i ( (x_i * scale_i + min_i) * coef_i )`, then `y = 10 ** logY`.
   Note sklearn's `MinMaxScaler.transform` is `x * scale_ + min_` (scale_ and min_ are precomputed), NOT `(x - data_min) / range`.
3. **Verify parity**: run the TS math against every row of the provided dataset and compare to the recorded target/ratio. Only trust the port after a full-dataset match.

**Why:** Avoids a Python runtime dependency in a Node/Express artifact, keeps the server fast and bundleable via esbuild, and the JSON params are tiny.

**How to apply:** Any "build an app from my ML model" request where the model is linear/tree-simple enough to reimplement. For complex models (deep nets, gradient boosting), reconsider.
