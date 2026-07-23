import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface JudicialStat {
  id: string;
  state: string;
  court_name: string;
  pending_cases: number;
  disposed_cases: number;
  civil_pending: number;
  criminal_pending: number;
  cases_over_10yrs: number;
  period_year: number;
}

export function NJDGStatCard({ stats }: { stats: JudicialStat[] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary">
            National Judicial Data Grid (NJDG) Case Backlog & Disposal
          </CardTitle>
          {stats.some((s: any) => s.is_mock) ? (
            <span className="text-[10px] font-narrow font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              Sample / Mock Data
            </span>
          ) : (
            <span className="text-[10px] font-narrow font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              ✓ Live Official Source (NJDG eCourts)
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          High Court Pendency Metrics & 10+ Year Case Backlog Summary
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((item) => {
            const formatNum = (n: number) => new Intl.NumberFormat('en-IN').format(n || 0);
            return (
              <div key={item.id} className="p-4 rounded-lg border border-border bg-background space-y-3">
                <div className="flex justify-between items-start border-b border-border pb-2">
                  <div>
                    <h4 className="font-bold font-serif text-base text-foreground">{item.court_name}</h4>
                    <span className="text-xs uppercase font-bold text-muted-foreground">{item.state}</span>
                  </div>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Year {item.period_year}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    <span className="text-muted-foreground uppercase font-bold block">Pending Cases</span>
                    <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-400">{formatNum(item.pending_cases)}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                    <span className="text-muted-foreground uppercase font-bold block">Disposed Cases</span>
                    <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatNum(item.disposed_cases)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border">
                  <span>Civil: {formatNum(item.civil_pending)}</span>
                  <span>Crim: {formatNum(item.criminal_pending)}</span>
                  <span className="text-rose-600 font-bold">&gt;10y: {formatNum(item.cases_over_10yrs)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Indicator Banner */}
        <div className="mt-6 p-4 border-2 border-dashed border-purple-500/50 bg-purple-500/10 rounded-lg text-center space-y-1">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1.5">
            ⌛ eCourts Individual Case-Level Search & Litigant Lookups — Phase 6 High-Caution Pipeline
          </span>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Currently aggregates High Court and National court pendency metrics. Case-level search (CNR number & party name lookup) is undergoing CAPTCHA rate-limit verification before deployment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
