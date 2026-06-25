import { useGetSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SummarySection() {
  const { data: summary, isLoading, isError } = useGetSummary();

  if (isError) return null;

  if (isLoading || !summary) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Dataset Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 bg-white/5 border border-white/10" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Dataset Overview <span className="text-muted-foreground font-normal text-sm ml-2">({summary.minYear} - {summary.maxYear})</span></h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Players Evaluated" value={summary.distinctPlayers.toLocaleString()} />
        <StatCard title="Total Seasons" value={summary.totalSeasons.toLocaleString()} />
        <StatCard title="Median Salary" value={formatCurrency(summary.medianSalary)} />
        <StatCard title="Avg Salary" value={formatCurrency(summary.avgSalary)} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
         <StatCard 
          title="Overpaid" 
          value={summary.overpaidCount.toLocaleString()} 
          subtitle={`${Math.round(summary.overpaidCount / summary.totalSeasons * 100)}%`}
          valueClass="text-destructive"
        />
        <StatCard 
          title="Paid Fairly" 
          value={summary.fairCount.toLocaleString()} 
          subtitle={`${Math.round(summary.fairCount / summary.totalSeasons * 100)}%`}
          valueClass="text-blue-400"
        />
        <StatCard 
          title="Underpaid" 
          value={summary.underpaidCount.toLocaleString()} 
          subtitle={`${Math.round(summary.underpaidCount / summary.totalSeasons * 100)}%`}
          valueClass="text-primary"
        />
      </div>
    </section>
  );
}

function StatCard({ title, value, subtitle, valueClass = "text-white" }: { title: string, value: string | number, subtitle?: string, valueClass?: string }) {
  return (
    <Card className="bg-card/40 backdrop-blur-md border-white/10 overflow-hidden group hover:bg-card/60 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={`text-2xl font-bold tracking-tight ${valueClass}`}>{value}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
