import json, csv
p = json.load(open("model_params.json"))
cols = p["feature_columns"]; coef=p["coef"]; b=p["intercept"]
smin=p["scaler_min"]; sscale=p["scaler_scale"]
def num(v):
    if isinstance(v,str):
        if v=="True": return 1.0
        if v=="False": return 0.0
    return float(v)
def predict(stats):
    log=b
    for i,c in enumerate(cols):
        xs=num(stats[c])*sscale[i]+smin[i]
        log+=xs*coef[i]
    return 10**log
rows=list(csv.DictReader(open("player_data.csv")))
ok=0
for r in rows:
    pred=predict(r); actual=float(r["salary"])
    if abs(actual/pred - float(r["SalaryRatio"])) < 0.01: ok+=1
print(f"matched {ok}/{len(rows)} rows within 1%")
for r in rows[:3]:
    pred=predict(r); actual=float(r["salary"])
    print(f"{r['playerID']} {r['year']}: actual={actual:.0f} pred={pred:.0f} ratio={actual/pred:.4f} (csv={float(r['SalaryRatio']):.4f})")
