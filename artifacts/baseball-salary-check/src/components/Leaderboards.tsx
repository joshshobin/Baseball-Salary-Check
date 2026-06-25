import { useState } from "react";
import { useGetLeaders } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, cn, getVerdictBadgeColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Player } from "@workspace/api-client-react";

export function LeaderboardsSection() {
  const { data: leaders, isLoading } = useGetLeaders();

  if (isLoading || !leaders) {
    return (
      <section className="py-12">
        <Skeleton className="w-48 h-8 mb-6 bg-white/5" />
        <Skeleton className="w-full h-[400px] bg-white/5 rounded-xl border border-white/10" />
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Leaderboards</h2>
      
      <Tabs defaultValue="overpaid" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="overpaid" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-white">Most Overpaid</TabsTrigger>
          <TabsTrigger value="underpaid" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white">Most Underpaid</TabsTrigger>
          <TabsTrigger value="highest" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Highest Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="overpaid" className="mt-4 focus-visible:outline-none">
          <PlayerGrid players={leaders.mostOverpaid} />
        </TabsContent>
        <TabsContent value="underpaid" className="mt-4 focus-visible:outline-none">
          <PlayerGrid players={leaders.mostUnderpaid} />
        </TabsContent>
        <TabsContent value="highest" className="mt-4 focus-visible:outline-none">
          <PlayerGrid players={leaders.highestPaid} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function PlayerGrid({ players }: { players: Player[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player, idx) => (
        <Card key={player.id} className="bg-card/40 backdrop-blur-md border-white/10 overflow-hidden hover:bg-card/60 transition-all relative">
          <div className="absolute top-4 right-4 opacity-10 font-bold text-6xl italic">
            #{idx + 1}
          </div>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-white capitalize tracking-tight">{player.playerID}</h3>
                <div className="text-sm text-muted-foreground flex gap-2 items-center">
                  <span>{player.team}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span>{player.year}</span>
                </div>
              </div>
              <Badge variant="outline" className={cn("capitalize", getVerdictBadgeColor(player.verdict))}>
                {player.verdict}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-sm text-muted-foreground">Actual Salary</span>
                <span className="font-mono text-white">{formatCurrency(player.salary)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-sm text-muted-foreground">Fair Value</span>
                <span className="font-mono text-white/80">{formatCurrency(player.predictedSalary)}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-sm text-muted-foreground">Diff</span>
                <span className={cn(
                  "font-mono font-medium",
                  player.percentDifference > 0 ? "text-destructive" : "text-primary"
                )}>
                  {formatPercent(player.percentDifference)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
