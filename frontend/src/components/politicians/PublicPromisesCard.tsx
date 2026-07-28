import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface PromiseItem {
  promise_text: string;
  context: string;
  public_belief_vs_fact: string;
  source_name: string;
  source_url: string;
  date?: string;
}

export function PublicPromisesCard({ promises }: { promises: PromiseItem[] }) {
  if (!promises || promises.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
              Public Promises & Campaign Declarations
            </CardTitle>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
              Rally speeches, manifestos, & policy pledges with factual context
            </p>
          </div>
          <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded font-bold">
            {promises.length} Pledges Tracked
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {promises.map((item, index) => (
          <div key={index} className="p-4 rounded-lg border border-border bg-background space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Context: {item.context}
              </span>
              {item.date && (
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {item.date}
                </span>
              )}
            </div>

            <h4 className="font-serif text-lg font-bold text-foreground">
              "{item.promise_text}"
            </h4>

            {/* Public Belief vs Fact Box */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md text-xs space-y-1.5">
              <span className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                Public Perception vs Sourced Clarification / Status:
              </span>
              <p className="text-muted-foreground leading-relaxed font-sans text-sm">
                {item.public_belief_vs_fact}
              </p>
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
                  Verify Source Citation &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
