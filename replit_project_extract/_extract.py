import json, numpy as np
from joblib import load
model = load("salary_model.joblib")
scaler = load("scaler.joblib")
cols = json.load(open("feature_columns.json"))
print("model type:", type(model).__name__)
print("scaler type:", type(scaler).__name__)
print("coef shape:", np.array(model.coef_).shape)
print("n features:", len(cols))
out = {
  "feature_columns": cols,
  "coef": [float(x) for x in np.array(model.coef_).ravel()],
  "intercept": float(np.array(model.intercept_).ravel()[0]) if np.array(model.intercept_).ndim else float(model.intercept_),
  "scaler_min": [float(x) for x in scaler.min_],
  "scaler_scale": [float(x) for x in scaler.scale_],
  "scaler_data_min": [float(x) for x in scaler.data_min_],
  "scaler_data_max": [float(x) for x in scaler.data_max_],
}
json.dump(out, open("model_params.json","w"))
# sanity check on a real row
import csv
print("intercept:", out["intercept"])
print("wrote model_params.json")
