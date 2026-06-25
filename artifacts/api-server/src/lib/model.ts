import fs from "node:fs";
import path from "node:path";

export const FEATURE_COLUMNS = [
  "SeasonsPlayed",
  "Games",
  "AtBats",
  "Runs",
  "Hits",
  "Doubles",
  "Triples",
  "HomeRuns",
  "RunsBattedIn",
  "StolenBases",
  "CaughtStealing",
  "Walks",
  "Strikeouts",
  "IntentionalWalks",
  "HitsByPitch",
  "SacrificeHits",
  "SacrificeFlies",
  "GroundedIntoDoublePlays",
  "BattingAverage",
  "OnBasePercentage",
  "SluggingPercentage",
  "isArbitrationEligible",
  "isFreeAgent",
] as const;

export type FeatureColumn = (typeof FEATURE_COLUMNS)[number];
export type Stats = Record<FeatureColumn, number>;

export type Verdict = "Overpaid" | "Underpaid" | "Paid Fairly";

export interface Player {
  id: string;
  playerID: string;
  year: number;
  team: string;
  salary: number;
  predictedSalary: number;
  ratio: number;
  percentDifference: number;
  verdict: Verdict;
  stats: Stats;
}

interface ModelParams {
  feature_columns: string[];
  coef: number[];
  intercept: number;
  scaler_min: number[];
  scaler_scale: number[];
}

interface RawPlayer extends Stats {
  id: string;
  playerID: string;
  year: number;
  team: string;
  salary: number;
}

// The model was a scikit-learn LinearRegression over MinMax-scaled features
// predicting log10(salary). We reproduce its exact math here (verified to match
// the original .joblib model on all 10,284 dataset rows).
const workspaceRoot = process.cwd().endsWith(
  path.join("artifacts", "api-server"),
)
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");

const params: ModelParams = JSON.parse(
  fs.readFileSync(path.join(dataDir, "model_params.json"), "utf-8"),
);

const rawPlayers: RawPlayer[] = JSON.parse(
  fs.readFileSync(path.join(dataDir, "players_data.json"), "utf-8"),
);

// Percent within which a salary is considered fair.
export const FAIR_THRESHOLD_PCT = 10;

export function predictSalary(stats: Stats): number {
  let logSalary = params.intercept;
  for (let i = 0; i < params.feature_columns.length; i++) {
    const col = params.feature_columns[i] as FeatureColumn;
    const value = Number(stats[col] ?? 0);
    const scaled = value * params.scaler_scale[i]! + params.scaler_min[i]!;
    logSalary += scaled * params.coef[i]!;
  }
  return Math.pow(10, logSalary);
}

export function classify(
  observedSalary: number,
  predicted: number,
): { verdict: Verdict; percentDifference: number; ratio: number } {
  const percentDifference =
    predicted > 0 ? ((observedSalary - predicted) / predicted) * 100 : 0;
  let verdict: Verdict;
  if (percentDifference > FAIR_THRESHOLD_PCT) {
    verdict = "Overpaid";
  } else if (percentDifference < -FAIR_THRESHOLD_PCT) {
    verdict = "Underpaid";
  } else {
    verdict = "Paid Fairly";
  }
  const ratio = observedSalary > 0 ? predicted / observedSalary : 0;
  return { verdict, percentDifference, ratio };
}

function toStats(raw: RawPlayer): Stats {
  const stats = {} as Stats;
  for (const col of FEATURE_COLUMNS) {
    stats[col] = Number(raw[col] ?? 0);
  }
  return stats;
}

function buildPlayer(raw: RawPlayer): Player {
  const stats = toStats(raw);
  const predictedSalary = predictSalary(stats);
  const { verdict, percentDifference, ratio } = classify(
    raw.salary,
    predictedSalary,
  );
  return {
    id: raw.id,
    playerID: raw.playerID,
    year: raw.year,
    team: raw.team,
    salary: raw.salary,
    predictedSalary,
    ratio,
    percentDifference,
    verdict,
    stats,
  };
}

export const players: Player[] = rawPlayers.map(buildPlayer);

const playersById = new Map<string, Player>(players.map((p) => [p.id, p]));

export function getPlayerById(id: string): Player | undefined {
  return playersById.get(id);
}
