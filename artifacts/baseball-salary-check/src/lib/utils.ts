import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero"
  }).format(value / 100)
}

export function getVerdictColor(verdict: string) {
  if (verdict === "Overpaid") return "text-destructive";
  if (verdict === "Underpaid") return "text-primary";
  return "text-blue-400";
}

export function getVerdictBadgeColor(verdict: string) {
  if (verdict === "Overpaid") return "bg-destructive/20 text-destructive border-destructive/30";
  if (verdict === "Underpaid") return "bg-primary/20 text-primary border-primary/30";
  return "bg-blue-500/20 text-blue-400 border-blue-500/30";
}
