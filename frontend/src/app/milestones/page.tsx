import React from 'react';
import { MilestonesTimeline } from '@/components/MilestonesTimeline';
import { ShieldCheck, Database, Layers } from 'lucide-react';

export const metadata = {
  title: 'Platform & Data Milestones — PrajaNeeti',
  description: 'Public verifiable ledger of engineering milestones and data ingestion progress across India\'s Executive, Legislative, and Judicial pillars.'
};

export default function MilestonesPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-10 space-y-10">
      {/* Header Masthead */}
      <header className="border-b-2 border-t-2 border-primary py-10 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          Open-Source Build & Data Acquisition Progress Ledger
        </span>
        <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight text-primary mt-4">
          PrajaNeeti Milestones
        </h1>
        <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto mt-3">
          Verifiable record of platform engineering releases and custom data ingestion milestones acquired across Executive Mandates, Candidate Affidavits, Parliamentary Performance, State MLA Funds, and Judicial Pendencies.
        </p>
      </header>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Engineering Phases</span>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl font-bold text-primary">5 Phases</p>
          </div>
          <p className="font-narrow text-xs text-muted-foreground uppercase mt-4">Auth, Dashboards, AI Matcher & Scrapers</p>
        </div>

        <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Data Ingestion Pillars</span>
              <Database className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl font-bold text-primary">7 Data Pipelines</p>
          </div>
          <p className="font-narrow text-xs text-muted-foreground uppercase mt-4">MyNeta, PRS, AoB, DoPT, MLALAD, NJDG & MPLADS</p>
        </div>

        <div className="border-2 border-primary bg-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Ledger</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400">100% Verifiable</p>
          </div>
          <p className="font-narrow text-xs text-muted-foreground uppercase mt-4">Backed by metadata.json & open datasets</p>
        </div>
      </div>

      {/* Interactive Timeline Component */}
      <MilestonesTimeline />
    </div>
  );
}
