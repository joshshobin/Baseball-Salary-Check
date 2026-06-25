import { PredictorSection } from "@/components/Predictor";
import { SummarySection } from "@/components/Summary";
import { LeaderboardsSection } from "@/components/Leaderboards";
import { PlayerTableSection } from "@/components/PlayerTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: `url('/stadium-bg.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')` }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8">
        <header className="flex justify-between items-center py-6 border-b border-white/10 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(25,165,85,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Baseball<span className="text-primary">SalaryCheck</span></span>
          </div>
          <nav>
            <a href="#table" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Browse Dataset</a>
          </nav>
        </header>

        <main className="space-y-24">
          <PredictorSection />
          <SummarySection />
          <LeaderboardsSection />
          <div id="table">
            <PlayerTableSection />
          </div>
        </main>

        <footer className="mt-24 py-12 border-t border-white/10 text-center text-muted-foreground text-sm">
          <p>Powered by Linear Regression on MLB Batting Stats</p>
        </footer>
      </div>
    </div>
  );
}
