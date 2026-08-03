import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, ExternalLink, HelpCircle, Target } from "lucide-react";

export interface PromiseItem {
  promise_text: string;
  context?: string;
  public_belief_vs_fact?: string;
  source_name?: string;
  source_url?: string;
  date?: string;
}

export function TrackedPromisesCard({ promises }: { promises: PromiseItem[] }) {
  if (!promises || promises.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Tracked Campaign Promises & Manifesto Commitments ({promises.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          Pillar 1 Sourced Promises: Speeches, Manifestos, Slogans & Verified Fact-Checks
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {promises.map((item, index) => (
          <div key={index} className="p-5 rounded-lg border-2 border-border bg-card space-y-3 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded inline-block w-fit">
                Context: {item.context || 'Campaign Statement'}
              </span>
              {item.date && (
                <span className="text-xs text-muted-foreground font-mono">
                  {item.date}
                </span>
              )}
            </div>

            <blockquote className="font-serif text-lg font-bold italic text-foreground border-l-4 border-blue-600 pl-3 py-1">
              "{item.promise_text}"
            </blockquote>

            {item.public_belief_vs_fact && (
              <div className="p-3 bg-muted/40 rounded border border-border/80 space-y-1">
                <span className="font-narrow text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Public Belief vs. Sourced Fact Analysis:
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                  {item.public_belief_vs_fact}
                </p>
              </div>
            )}

            {item.source_url && (
              <div className="pt-1 text-right">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider"
                >
                  {item.source_name || 'View News Citation'} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
