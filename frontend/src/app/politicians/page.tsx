import { getPoliticians } from "../actions/politicians";
import PoliticianDirectoryClient from "@/components/politicians/PoliticianDirectoryClient";

export default async function PoliticiansPage() {
  const politicians = await getPoliticians();

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Broadsheet Masthead Header */}
      <header className="border-b-2 border-t-2 border-primary py-10 bg-card">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl space-y-3 text-center">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1 inline-block">
            Pillar 3 • Scraped Election Affidavits & Parliamentary Track Record
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-primary uppercase mt-2">
            Politician Directory
          </h1>
          <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto leading-relaxed">
            Verifiable public oversight dossiers for parliamentarians: declared net worth affidavits, criminal disclosure records, parliamentary attendance rate, and introduced bills.
          </p>
        </div>
      </header>

      {/* Main Directory & Filter Grid */}
      <section className="container mx-auto px-4 md:px-8 max-w-7xl pt-10">
        <PoliticianDirectoryClient politicians={politicians} />
      </section>
    </main>
  );
}

