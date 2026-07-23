import { getMpladsData } from '@/lib/mplads-data';
import { getMLALADSchemes } from '@/app/actions/mlalad';
import { MpladsDashboard } from '@/components/mplads/MpladsDashboard';

export const dynamic = 'force-dynamic';

export default async function MpladsPage() {
  const { overview, states, mps, sectors, completedWorks } = getMpladsData();
  const mlaladSchemes = await getMLALADSchemes();

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Broadsheet Masthead Header */}
      <header className="border-b-2 border-t-2 border-primary py-10 bg-card">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl space-y-3 text-center">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1 inline-block">
            Pillar 2 • Public Funds & Financial Expenditure Audit
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-primary uppercase mt-2">
            MPLADS & MLALAD Audit
          </h1>
          <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto leading-relaxed">
            Public ledger of parliamentary and state assembly constituency development fund allocations, unspent balance ratios, state breakdowns, and project completion audits.
          </p>
        </div>
      </header>

      {/* Main Audit Dashboard Content */}
      <section className="container mx-auto px-4 md:px-8 max-w-7xl pt-10">
        <MpladsDashboard
          overview={overview}
          states={states}
          mps={mps}
          sectors={sectors}
          completedWorks={completedWorks}
          mlaladSchemes={mlaladSchemes}
        />
      </section>
    </main>
  );
}

