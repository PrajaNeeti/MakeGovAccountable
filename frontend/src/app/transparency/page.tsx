import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SpendingTable, SpendingRecord } from '@/components/transparency/spending-table';
import { Database, Landmark, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

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
          Verifiable open ledgers tracking government spending, Member of Parliament allocations, and official accountability records.
        </p>
      </header>

      {/* 3 Data Hub Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Scraped Government Data</span>
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase">MPLADS Oversight Ledger</h2>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              Auditing ₹11,500+ Crores across 36 Indian States, 748 Parliamentarians, and itemized local ground works.
            </p>
          </div>
          <Link 
            href="/mplads" 
            className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
          >
            Explore MPLADS Data <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Person-by-Person Oversight</span>
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase">Politician Directory</h2>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              Track elected officials (MPs, MLAs), assigned budgets, public statements, and constituency delivery records.
            </p>
          </div>
          <Link 
            href="/politicians" 
            className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
          >
            Track Politicians <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between hover:bg-secondary/20 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Financial Ledger</span>
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase">Transparency Spending Ledger</h2>
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
