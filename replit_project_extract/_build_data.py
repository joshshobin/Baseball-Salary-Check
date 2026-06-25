import json, csv
rows=list(csv.DictReader(open("player_data.csv")))
cols=json.load(open("feature_columns.json"))
def num(v): return 1.0 if v=="True" else 0.0 if v=="False" else float(v)
out=[]
for i,r in enumerate(rows):
    rec={"id":f"{r['playerID']}_{r['year']}","playerID":r['playerID'],"year":int(r['year']),
         "team":r['teamID'],"salary":int(float(r['salary']))}
    for c in cols: rec[c]=num(r[c])
    out.append(rec)
json.dump(out, open("players_data.json","w"))
print("rows:",len(out))
# distinct players
print("distinct playerIDs:", len(set(r['playerID'] for r in rows)))
print("salary range:", min(x['salary'] for x in out), max(x['salary'] for x in out))
print("year range:", min(x['year'] for x in out), max(x['year'] for x in out))
