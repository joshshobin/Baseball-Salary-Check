import { Router, type IRouter } from "express";
import {
  ListPlayersQueryParams,
  GetPlayerParams,
  PredictSalaryBody,
} from "@workspace/api-zod";
import {
  players,
  getPlayerById,
  predictSalary,
  classify,
  FEATURE_COLUMNS,
  type Player,
  type Stats,
} from "../lib/model";

const router: IRouter = Router();

function median(sortedAsc: number[]): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0
    ? (sortedAsc[mid - 1]! + sortedAsc[mid]!) / 2
    : sortedAsc[mid]!;
}

router.get("/players", (req, res): void => {
  const parsed = ListPlayersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, sort, order, verdict, limit, offset } = parsed.data;

  let result: Player[] = players;

  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.playerID.toLowerCase().includes(needle) ||
        p.team.toLowerCase().includes(needle) ||
        p.id.toLowerCase().includes(needle),
    );
  }

  if (verdict) {
    result = result.filter((p) => p.verdict === verdict);
  }

  const dir = order === "asc" ? 1 : -1;
  const key = sort;
  result = [...result].sort((a, b) => {
    let av: number | string;
    let bv: number | string;
    if (key === "playerID") {
      av = a.playerID;
      bv = b.playerID;
      return av < bv ? -dir : av > bv ? dir : 0;
    }
    av = a[key];
    bv = b[key];
    return (Number(av) - Number(bv)) * dir;
  });

  const total = result.length;
  const page = result.slice(offset, offset + limit);

  res.json({ items: page, total });
});

router.get("/player-options", (_req, res): void => {
  const options = players.map((p) => ({
    id: p.id,
    playerID: p.playerID,
    year: p.year,
    team: p.team,
    salary: p.salary,
  }));
  res.json(options);
});

router.get("/summary", (_req, res): void => {
  const salaries = players.map((p) => p.salary);
  const sortedSalaries = [...salaries].sort((a, b) => a - b);
  const years = players.map((p) => p.year);
  const distinctPlayers = new Set(players.map((p) => p.playerID)).size;

  let overpaidCount = 0;
  let underpaidCount = 0;
  let fairCount = 0;
  for (const p of players) {
    if (p.verdict === "Overpaid") overpaidCount++;
    else if (p.verdict === "Underpaid") underpaidCount++;
    else fairCount++;
  }

  const avgSalary =
    salaries.reduce((acc, s) => acc + s, 0) / (salaries.length || 1);

  res.json({
    totalSeasons: players.length,
    distinctPlayers,
    avgSalary,
    medianSalary: median(sortedSalaries),
    minSalary: sortedSalaries[0] ?? 0,
    maxSalary: sortedSalaries[sortedSalaries.length - 1] ?? 0,
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    overpaidCount,
    underpaidCount,
    fairCount,
  });
});

router.get("/leaders", (_req, res): void => {
  const byPctDesc = [...players].sort(
    (a, b) => b.percentDifference - a.percentDifference,
  );
  const byPctAsc = [...players].sort(
    (a, b) => a.percentDifference - b.percentDifference,
  );
  const bySalaryDesc = [...players].sort((a, b) => b.salary - a.salary);

  res.json({
    mostOverpaid: byPctDesc.slice(0, 10),
    mostUnderpaid: byPctAsc.slice(0, 10),
    highestPaid: bySalaryDesc.slice(0, 10),
  });
});

router.get("/players/:id", (req, res): void => {
  const parsed = GetPlayerParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const player = getPlayerById(parsed.data.id);
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(player);
});

router.post("/predict", (req, res): void => {
  const parsed = PredictSalaryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { stats: rawStats, currentSalary } = parsed.data;

  const stats = {} as Stats;
  for (const col of FEATURE_COLUMNS) {
    stats[col] = Number((rawStats as Record<string, number>)[col] ?? 0);
  }

  const predictedSalary = predictSalary(stats);
  const { verdict, percentDifference, ratio } = classify(
    currentSalary,
    predictedSalary,
  );
  const magnitude = Math.min(100, Math.abs(percentDifference));

  res.json({
    predictedSalary,
    currentSalary,
    ratio: predictedSalary > 0 ? currentSalary / predictedSalary : 0,
    percentDifference,
    magnitude,
    verdict,
  });
});

export default router;
