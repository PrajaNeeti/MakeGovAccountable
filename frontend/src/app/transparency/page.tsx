import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SpendingTable, SpendingRecord } from '@/components/transparency/spending-table';
import { Database, Landmark, UserCheck, ArrowRight, Layers, ShieldCheck, Scale, FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransparencyPage() {
  const supabase = await createClient();
  
  const { data: spendingRecords, error } = await supabase
    .from('spending')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching spending records:', error);
  }

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12 space-y-12">
      {/* Masthead Header */}
      <header className="border-b-2 border-t-2 border-primary py-10 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          Pillar 3 • Scraped Government Ledgers & Official Accountability
        </span>
        <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight text-primary mt-4">
          Data & Accountability Hub
        </h1>
        <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto mt-3">
          Verifiable open ledgers tracking government spending, Member of Parliament allocations, candidate affidavits, civil servant rosters, state assembly funds, and judicial backlogs.
        </p>
      </header>

      {/* 6-Pillar Data Directory Grid */}
      <section className="space-y-6">
        <div className="border-b-2 border-primary pb-3 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold uppercase text-primary">Open Data Directory Grid</h2>
            <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
              Direct access pathways to all audited public ledgers and data pipelines
            </p>
          </div>
          <Link href="/milestones" className="text-xs font-narrow font-bold uppercase tracking-wider text-primary hover:underline">
            View Data Milestones &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: MPLADS & MLALAD */}
          <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Scraped Public Funds</span>
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">MPLADS & State MLALAD Oversight</h3>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Auditing ₹11,538+ Crores across 36 Indian States/UTs, 543 MPs, ground local works, and Gujarat MLA fund pilot.
              </p>
            </div>
            <Link 
              href="/mplads" 
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              Explore Fund Ledgers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Politician Directory & Affidavits */}
          <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Representative Accountability</span>
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Candidate Affidavits & PRS Performance</h3>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                483 Lok Sabha winner affidavits (wealth, criminal cases, education) + PRS parliamentary attendance & question counts.
              </p>
            </div>
            <Link 
              href="/politicians" 
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              Track MP Affidavits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Executive AoB & IAS Rosters */}
          <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Executive Branch</span>
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">AoB Mandates & Senior IAS Rosters</h3>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Cabinet Secretariat Allocation of Business (AoB) rules + DoPT e-Civil List senior civil servant postings.
              </p>
            </div>
            <Link 
              href="/dashboards" 
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              View Executive Dashboards <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Judicial Pendency */}
          <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Judicial Branch</span>
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">NJDG Judicial Pendency & Backlog</h3>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                High Court & National aggregate case pendency, disposed cases, civil/criminal split, and 10+ year delayed cases.
              </p>
            </div>
            <Link 
              href="/dashboards" 
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              View Court Pendency <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Department Spending Table */}
          <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Financial Ledger</span>
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Transparency Spending Ledger</h3>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Granular record of departmental spending, operational budgets, and audited financial line items.
              </p>
            </div>
            <a 
              href="#spending-ledger" 
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-transparent text-primary px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all w-fit"
            >
              View Spending Table <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 6: Data Acquisition Milestones */}
          <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Progress Ledger</span>
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Platform & Data Milestones</h3>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Verifiable record of engineering phases and acquired data milestones across all 3 pillars of governance.
              </p>
            </div>
            <Link 
              href="/milestones" 
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              View Milestones Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Spending Table Section */}
      <section id="spending-ledger" className="border border-primary bg-card p-6 space-y-4">
        <div className="border-b border-primary pb-3">
          <h2 className="font-serif text-2xl font-bold uppercase">Audited Spending Ledger</h2>
          <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
            Departmental expense line items and budget allocations
          </p>
        </div>
        <SpendingTable data={(spendingRecords as SpendingRecord[]) || []} />
      </section>
    </div>
  );
}
