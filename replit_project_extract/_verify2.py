import json, csv
p=json.load(open("model_params.json"))
cols=p["feature_columns"];coef=p["coef"];b=p["intercept"];smin=p["scaler_min"];sscale=p["scaler_scale"]
def num(v): return 1.0 if v=="True" else 0.0 if v=="False" else float(v)
def predict(s):
    log=b
    for i,c in enumerate(cols): log+=(num(s[c])*sscale[i]+smin[i])*coef[i]
    return 10**log
rows=list(csv.DictReader(open("player_data.csv")))
ok=sum(1 for r in rows if abs(predict(r)/float(r["salary"]) - float(r["SalaryRatio"]))<0.005)
print(f"predicted/actual matches csv SalaryRatio: {ok}/{len(rows)}")
