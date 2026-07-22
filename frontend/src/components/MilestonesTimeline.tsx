'use client';

import React, { useState } from 'react';
import { Layers, Database, Calendar, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export interface MilestoneItem {
  id: string;
  title: string;
  category: 'engineering' | 'data';
  date: string;
  badge: string;
  description: string;
  metrics?: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PLANNED';
  link?: string;
}

export function MilestonesTimeline() {
  const [filter, setFilter] = useState<'all' | 'engineering' | 'data'>('all');

  const milestones: MilestoneItem[] = [
    {
      id: 'ENG-01',
      title: 'Phase 1: Foundation & Auth Middleware',
      category: 'engineering',
      date: 'July 2026',
      badge: 'Architecture',
      description: 'Initialized Next.js project with custom token & Supabase authentication middleware, baseline Postgres schemas (politicians, departments, courts, roles).',
      status: 'COMPLETED'
    },
    {
      id: 'DATA-01',
      title: 'MPLADS Parliamentary Oversight Ledger Ingestion',
      category: 'data',
      date: 'July 2026',
      badge: 'e-SAKSHI / MoSPI Audit',
      description: 'Extracted and structured ₹11,538+ Crores in MP Local Area Development fund allocations across 36 Indian States/UTs, 543 MPs, and ground projects.',
      metrics: '₹11,538+ Cr Audited • 2,500+ Local Projects',
      status: 'ACTIVE',
      link: '/mplads'
    },
    {
      id: 'ENG-02',
      title: 'Phase 2: Citizen Dashboards & Global Omnibar Search',
      category: 'engineering',
      date: 'July 2026',
      badge: 'UI & Analytics',
      description: 'Built multi-branch dashboards for Executive, Legislative, and Judicial pillars with instant Omnibar search indexing.',
      status: 'COMPLETED',
      link: '/dashboards'
    },
    {
      id: 'DATA-02',
      title: 'MyNeta / ADR Candidate Affidavits Ingestion',
      category: 'data',
      date: 'July 2026',
      badge: 'Lok Sabha 2024 Winners',
      description: 'Scraped and parsed 483 Lok Sabha winner affidavits including declared assets, liabilities, education, and criminal IPC charges.',
      metrics: '483 MPs Ingested • Assets & Criminal Case Badges',
      status: 'ACTIVE',
      link: '/politicians'
    },
    {
      id: 'ENG-03',
      title: 'Phase 3: AI Concern Pooling & Semantic Matcher',
      category: 'engineering',
      date: 'July 2026',
      badge: 'AI & NLP',
      description: 'Built user petition submission flow (`/submit`) with OpenAI/Gemini semantic embedding de-duplication and admin moderation dashboard (`/moderation`).',
      status: 'COMPLETED',
      link: '/concerns'
    },
    {
      id: 'DATA-03',
      title: 'PRS Legislative Track Record Ingestion',
      category: 'data',
      date: 'July 2026',
      badge: 'PRS India',
      description: 'Gathered MP parliamentary activity indicators—attendance percentage, questions asked, debates participated, and private member bills.',
      metrics: 'MP Attendance & Question Counts Ingested',
      status: 'ACTIVE',
      link: '/politicians'
    },
    {
      id: 'DATA-04',
      title: 'Cabinet Allocation of Business (AoB) Rules Ingestion',
      category: 'data',
      date: 'July 2026',
      badge: 'Cabinet Secretariat',
      description: 'Parsed Second Schedule statutory subject-matter jurisdiction rules for Union Ministries (MHA, Finance/DEA, Cooperation, MoEFCC).',
      metrics: 'Executive Subject Mandates Mapped',
      status: 'ACTIVE',
      link: '/dashboards'
    },
    {
      id: 'DATA-05',
      title: 'DoPT IAS e-Civil List Senior Officer Ingestion',
      category: 'data',
      date: 'July 2026',
      badge: 'Civil List Authority',
      description: 'Scraped senior IAS civil servant rosters with allotment batch years, state cadres, current postings, pay levels, and qualifications.',
      metrics: 'IAS Senior Officer Rosters Active',
      status: 'ACTIVE',
      link: '/dashboards'
    },
    {
      id: 'DATA-06',
      title: 'Entity Resolution & Fuzzy Alias Matcher',
      category: 'data',
      date: 'July 2026',
      badge: 'Entity Matching',
      description: 'Mapped raw department posting titles and acronyms (e.g. "DPIIT", "MHA") to canonical database IDs using string distance matching.',
      metrics: 'Automated Posting-to-Department Resolution',
      status: 'ACTIVE'
    },
    {
      id: 'DATA-07',
      title: 'State MLA Local Area Development (MLALAD) Pilot',
      category: 'data',
      date: 'July 2026',
      badge: 'Gujarat State Pilot',
      description: 'Scraped state assembly constituency allocations, expenditure, unspent balances, and completed works count for state MLAs.',
      metrics: 'State Assembly Fund Tracking Live',
      status: 'ACTIVE',
      link: '/mplads'
    },
    {
      id: 'DATA-08',
      title: 'National Judicial Data Grid (NJDG) Case Backlog',
      category: 'data',
      date: 'July 2026',
      badge: 'e-Courts NJDG',
      description: 'Extracted High Court aggregate case pendency, disposed cases, civil vs. criminal splits, and 10+ year delayed case backlogs.',
      metrics: '6.18M+ High Court Cases Audited',
      status: 'ACTIVE',
      link: '/dashboards'
    },
    {
      id: 'ENG-04',
      title: 'Phase 5: Automated Scraper Suite CLI & Open Data',
      category: 'engineering',
      date: 'July 2026',
      badge: 'Automation CLI',
      description: 'Built unified CLI runner (`python -m app.scrapers.cli`) with manifest metadata updates (`data/sourcing/metadata.json`) and error logging.',
      status: 'COMPLETED'
    }
  ];

  const filtered = milestones.filter(m => filter === 'all' || m.category === filter);

  return (
    <div className="space-y-8">
      {/* Category Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`font-narrow text-xs font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              filter === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            All Milestones ({milestones.length})
          </button>
          <button
            onClick={() => setFilter('data')}
            className={`font-narrow text-xs font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              filter === 'data'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Data Ingestion Milestones ({milestones.filter(m => m.category === 'data').length})
            </span>
          </button>
          <button
            onClick={() => setFilter('engineering')}
            className={`font-narrow text-xs font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              filter === 'engineering'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Platform Engineering ({milestones.filter(m => m.category === 'engineering').length})
            </span>
          </button>
        </div>
        <span className="font-mono text-xs text-muted-foreground font-bold">
          Showing {filtered.length} Milestones
        </span>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-primary ml-4 pl-6 space-y-8">
        {filtered.map((m) => (
          <div key={m.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-background" />
            </div>

            <div className="border-2 border-primary/20 bg-card p-6 rounded-lg space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground uppercase">{m.id}</span>
                  <span className="inline-block border border-primary px-2 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-wider text-primary">
                    {m.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> {m.date}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {m.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold uppercase tracking-tight text-primary">{m.title}</h3>
                <p className="text-sm text-foreground mt-1 leading-relaxed">{m.description}</p>
              </div>

              {m.metrics && (
                <div className="p-3 bg-muted/40 rounded border border-border text-xs font-mono font-bold text-primary">
                  📊 {m.metrics}
                </div>
              )}

              {m.link && (
                <div className="pt-1 text-right">
                  <a href={m.link} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
                    View Live Integration <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
