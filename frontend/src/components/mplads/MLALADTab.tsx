import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface MLALADScheme {
  id: string;
  state: string;
  district: string;
  constituency: string;
  mla_name: string;
  allocated_amount: number;
  total_expenditure: number;
  unspent_amount: number;
  completed_works_count: number;
}

export function MLALADTab({ schemes }: { schemes: MLALADScheme[] }) {
  if (!schemes || schemes.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary">
          State MLA Local Area Development (MLALAD) Fund Oversight
        </CardTitle>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          State Assembly Constituency Allocation, Expenditure & Works Completed (Gujarat Pilot)
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schemes.map((scheme) => {
            const formatInr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
            const utilPct = scheme.allocated_amount > 0 ? Math.round((scheme.total_expenditure / scheme.allocated_amount) * 100) : 0;
            return (
              <div key={scheme.id} className="p-4 rounded-lg border border-border bg-background space-y-3">
                <div className="border-b border-border pb-2">
                  <h4 className="font-bold font-serif text-lg text-primary">{scheme.mla_name}</h4>
                  <span className="text-xs uppercase font-bold text-muted-foreground">
                    MLA &bull; {scheme.constituency} ({scheme.district}, {scheme.state})
                  </span>
                </div>
                <div className="space-y-1 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs uppercase">Allocation:</span>
                    <span className="font-bold">{formatInr(scheme.allocated_amount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="text-xs uppercase">Spent:</span>
                    <span className="font-bold">{formatInr(scheme.total_expenditure)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span className="text-xs uppercase">Unspent:</span>
                    <span className="font-bold">{formatInr(scheme.unspent_amount)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-bold">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{utilPct}% Utilized</span>
                  <span className="text-muted-foreground">{scheme.completed_works_count} Works Completed</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Pipeline Banner */}
        <div className="mt-6 p-4 border-2 border-dashed border-amber-500/50 bg-amber-500/10 rounded-lg text-center space-y-1">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
            ⌛ 27 State Assembly Portals Ingesting — Pipeline Sourcing Coming Soon
          </span>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Current pilot covers Gujarat Vidhan Sabha. MLALAD data pipelines for Maharashtra, Uttar Pradesh, Bihar, Tamil Nadu, Rajasthan, and 22 other State Assembly portals are scheduled for Phase 6 ingestion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
