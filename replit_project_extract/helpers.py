# Moneyball salary predictor - inference helper.
# The model predicts log10(salary) from MinMax-scaled features. So the app MUST:
#   1) order the inputs by feature_columns.json
#   2) scale them with scaler.joblib
#   3) predict, then convert back with 10 ** prediction to get dollars.
#
# Usage in the backend:
#   import json
#   from joblib import load
#   import helpers
#   model   = load("salary_model.joblib")
#   scaler  = load("scaler.joblib")
#   columns = json.load(open("feature_columns.json"))
#   dollars = helpers.predict_salary(model, scaler, columns, stats_dict)
import numpy as np

def predict_salary(model, scaler, feature_columns, stats):
    # stats: a dict mapping each feature_columns name to its value
    row = np.array([[float(stats[c]) for c in feature_columns]])
    log_salary = model.predict(scaler.transform(row))[0]
    return float(10 ** log_salary)
