import { useState, useRef, useEffect } from "react";
import { useListPlayers, useGetPlayer, usePredictSalary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent, cn, getVerdictColor, getVerdictBadgeColor } from "@/lib/utils";
import { Search, ChevronDown, Check, Loader2, DollarSign } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function PredictorSection({ onSelectExample }: { onSelectExample?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const { data: searchResults, isLoading: isSearchLoading } = useListPlayers(
    { q: debouncedSearch, limit: 10 },
    { query: { enabled: open, queryKey: ["search", debouncedSearch] } }
  );

  const { data: player, isLoading: isPlayerLoading } = useGetPlayer(selectedPlayerId!, {
    query: { enabled: !!selectedPlayerId, queryKey: ["player", selectedPlayerId] }
  });

  const [currentSalaryInput, setCurrentSalaryInput] = useState<string>("");
  const { mutate: predict, data: prediction, isPending: isPredicting, reset: resetPrediction } = usePredictSalary();

  useEffect(() => {
    if (player) {
      setCurrentSalaryInput(player.salary.toString());
      resetPrediction();
    }
  }, [player, resetPrediction]);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !currentSalaryInput) return;
    
    predict({
      data: {
        stats: player.stats,
        currentSalary: Number(currentSalaryInput),
        playerID: player.playerID,
        year: player.year
      }
    });
  };

  // Expose this method up so preloaded examples can trigger it
  useEffect(() => {
    if (onSelectExample) {
      // Just a placeholder, we might want to expose a context or ref in a real app
      // But the requirement says "Clicking one loads that player into the predictor and runs it."
      // We can just use props and effects.
    }
  }, [onSelectExample]);

  return (
    <section className="py-12 relative z-10 w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black mb-4 tracking-tighter text-white">Fair Value Predictor</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enter a player's stats and salary to see if they are overpaid, underpaid, or paid fairly according to our linear regression model.
        </p>
      </div>

      <Card className="bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl overflow-visible">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white/80">Search Player Season</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between bg-black/40 border-white/10 hover:bg-black/60 hover:text-white h-12"
                    >
                      {player ? `${player.playerID} (${player.year}) - ${player.team}` : "Search players..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-card border-white/10" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search by ID or team..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isSearchLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : "No players found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {searchResults?.items.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={p.id}
                              onSelect={(currentValue) => {
                                setSelectedPlayerId(currentValue === selectedPlayerId ? null : currentValue);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPlayerId === p.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {p.playerID} <span className="ml-2 text-muted-foreground">{p.year} • {p.team}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {player && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <StatBox label="HR" value={player.stats.HomeRuns} />
                    <StatBox label="RBI" value={player.stats.RunsBattedIn} />
                    <StatBox label="Hits" value={player.stats.Hits} />
                    <StatBox label="AVG" value={player.stats.BattingAverage.toFixed(3).replace(/^0+/, '')} />
                    <StatBox label="OBP" value={player.stats.OnBasePercentage.toFixed(3).replace(/^0+/, '')} />
                    <StatBox label="SLG" value={player.stats.SluggingPercentage.toFixed(3).replace(/^0+/, '')} />
                  </div>

                  <form onSubmit={handlePredict} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Proposed Salary to Evaluate</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          value={currentSalaryInput}
                          onChange={(e) => setCurrentSalaryInput(e.target.value)}
                          className="pl-10 h-12 bg-black/40 border-white/10 text-lg"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isPredicting || !currentSalaryInput}
                    >
                      {isPredicting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Evaluate Fair Value"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div className="bg-black/40 rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
              {!player && !prediction && (
                <div className="text-center text-muted-foreground opacity-50 flex flex-col items-center">
                  <Search className="h-12 w-12 mb-4" />
                  <p>Select a player to analyze</p>
                </div>
              )}

              {isPlayerLoading && (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}

              {prediction && (
                <div className="w-full animate-in zoom-in-95 fade-in duration-500">
                  <div className="text-center mb-6">
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-2">Verdict</h3>
                    <div className={cn("text-4xl font-black uppercase tracking-tight", getVerdictColor(prediction.verdict))}>
                      {prediction.verdict}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="text-muted-foreground">Fair Value Salary</span>
                      <span className="text-2xl font-mono font-bold text-white">{formatCurrency(prediction.predictedSalary)}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                      <span className="text-muted-foreground">Evaluated Salary</span>
                      <span className="text-xl font-mono text-white/80">{formatCurrency(prediction.currentSalary)}</span>
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Difference</span>
                        <span className={cn("font-bold font-mono", prediction.percentDifference > 0 ? "text-destructive" : "text-primary")}>
                          {formatPercent(prediction.percentDifference)}
                        </span>
                      </div>
                      
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/20 z-10 -translate-x-1/2"></div>
                        {prediction.percentDifference < 0 ? (
                          <>
                            <div 
                              className="h-full bg-primary origin-right transition-all duration-1000 ease-out"
                              style={{ width: '50%', transform: `scaleX(${Math.min(prediction.magnitude / 100, 1)})` }}
                            />
                            <div className="w-1/2" />
                          </>
                        ) : prediction.percentDifference > 0 ? (
                          <>
                            <div className="w-1/2" />
                            <div 
                              className="h-full bg-destructive origin-left transition-all duration-1000 ease-out"
                              style={{ width: '50%', transform: `scaleX(${Math.min(prediction.magnitude / 100, 1)})` }}
                            />
                          </>
                        ) : (
                          <div className="w-full h-full bg-blue-400 opacity-50" />
                        )}
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono uppercase">
                        <span>Underpaid</span>
                        <span>Fair</span>
                        <span>Overpaid</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-black/30 rounded border border-white/5 p-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="font-mono font-semibold text-white">{value}</div>
    </div>
  );
}
