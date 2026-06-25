import { useState } from "react";
import { useListPlayers, getListPlayersQueryKey } from "@workspace/api-client-react";
import { keepPreviousData } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn, getVerdictBadgeColor } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { ListPlayersSort, ListPlayersOrder, ListPlayersVerdict } from "@workspace/api-client-react";

export function PlayerTableSection() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sort, setSort] = useState<ListPlayersSort | "default">("default");
  const [order, setOrder] = useState<ListPlayersOrder>("desc");
  const [verdict, setVerdict] = useState<ListPlayersVerdict | "all">("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  const params = {
    q: debouncedSearch || undefined,
    sort: sort === "default" ? undefined : sort,
    order: order,
    verdict: verdict === "all" ? undefined : verdict,
    limit,
    offset: page * limit
  };

  const { data, isLoading, isFetching } = useListPlayers(params, {
    query: {
      placeholderData: keepPreviousData,
      queryKey: getListPlayersQueryKey(params)
    }
  });

  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Players & Salaries</h2>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search ID or team..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 bg-card/40 border-white/10 text-white"
            />
          </div>
          
          <Select value={sort} onValueChange={(val: any) => { setSort(val); setPage(0); }}>
            <SelectTrigger className="w-[140px] bg-card/40 border-white/10 text-white">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="predictedSalary">Predicted Salary</SelectItem>
              <SelectItem value="percentDifference">Percent Difference</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={(val: any) => { setOrder(val); setPage(0); }}>
            <SelectTrigger className="w-[110px] bg-card/40 border-white/10 text-white">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verdict} onValueChange={(val: any) => { setVerdict(val); setPage(0); }}>
            <SelectTrigger className="w-[140px] bg-card/40 border-white/10 text-white">
              <SelectValue placeholder="All Verdicts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verdicts</SelectItem>
              <SelectItem value="Overpaid">Overpaid</SelectItem>
              <SelectItem value="Underpaid">Underpaid</SelectItem>
              <SelectItem value="Paid Fairly">Paid Fairly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60 font-semibold">Player</TableHead>
                <TableHead className="text-white/60 font-semibold">Team</TableHead>
                <TableHead className="text-white/60 font-semibold text-right">Actual Salary</TableHead>
                <TableHead className="text-white/60 font-semibold text-right">Fair Value</TableHead>
                <TableHead className="text-white/60 font-semibold text-right">Verdict</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    No players found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((player) => (
                  <TableRow key={player.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="font-medium text-white">{player.playerID}</div>
                      <div className="text-xs text-muted-foreground">{player.year}</div>
                    </TableCell>
                    <TableCell className="text-white/80">{player.team}</TableCell>
                    <TableCell className="text-right font-mono text-white">{formatCurrency(player.salary)}</TableCell>
                    <TableCell className="text-right font-mono text-white/60">{formatCurrency(player.predictedSalary)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn("capitalize font-semibold", getVerdictBadgeColor(player.verdict))}>
                        {player.verdict}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
          <div className="text-sm text-muted-foreground">
            {data ? `Showing ${page * limit + 1} to ${Math.min((page + 1) * limit, data.total)} of ${data.total}` : "Loading..."}
            {isFetching && !isLoading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="bg-black/40 border-white/10 hover:bg-black/60 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data || (page + 1) * limit >= data.total || isLoading}
              className="bg-black/40 border-white/10 hover:bg-black/60 hover:text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
