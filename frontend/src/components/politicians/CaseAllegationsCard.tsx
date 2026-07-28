'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface CaseAllegation {
  type: 'declared_affidavit' | 'media_allegation';
  description: string;
  case_summary: string;
  status: string;
  source_name: string;
  source_url: string;
  date?: string;
}

export function CaseAllegationsCard({ allegations }: { allegations: CaseAllegation[] }) {
  const [filter, setFilter] = useState<'all' | 'declared_affidavit' | 'media_allegation'>('all');

  if (!allegations || allegations.length === 0) return null;

  const filtered = allegations.filter(item => filter === 'all' || item.type === filter);
  const declaredCount = allegations.filter(a => a.type === 'declared_affidavit').length;
  const mediaCount = allegations.filter(a => a.type === 'media_allegation').length;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
              Legal Record & Case Allegations
            </CardTitle>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
              Two-Tier Transparency: Sworn ECI Affidavits & Verified Media Allegations
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-background p-1 rounded-md border border-border">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded tracking-wider transition-colors ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              All ({allegations.length})
            </button>
            <button
              onClick={() => setFilter('declared_affidavit')}
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded tracking-wider transition-colors ${
                filter === 'declared_affidavit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              ECI Affidavit ({declaredCount})
            </button>
            <button
              onClick={() => setFilter('media_allegation')}
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded tracking-wider transition-colors ${
                filter === 'media_allegation' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Media Allegations ({mediaCount})
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {filtered.map((item, index) => {
          const isCleared = item.status.toLowerCase().includes('cleared') || item.status.toLowerCase().includes('discharged');
          const isNoCases = item.status === 'no_cases_declared';

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border space-y-3 transition-all ${
                item.type === 'declared_affidavit'
                  ? isNoCases
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-background border-border shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-border/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      item.type === 'declared_affidavit'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                        : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {item.type === 'declared_affidavit' ? 'Sworn ECI Affidavit' : 'Reported News Allegation'}
                  </span>
                  {item.date && (
                    <span className="text-xs font-mono text-muted-foreground font-bold">
                      {item.date}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isNoCases || isCleared
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h4 className="font-bold text-base text-foreground leading-snug">
                {item.description}
              </h4>

              <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
                  Case Summary & Background:
                </span>
                {item.case_summary}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-muted-foreground font-medium">
                  Source: <strong className="text-foreground">{item.source_name}</strong>
                </span>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:underline uppercase tracking-wider"
                  >
                    Read Full Source &rarr;
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
