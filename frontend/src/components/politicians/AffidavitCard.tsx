import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface AffidavitData {
  candidate_name: string;
  house: string;
  election_year: number;
  state: string;
  constituency: string;
  party: string;
  winner_flag?: boolean;
  criminal_cases_count: number;
  criminal_ipc_sections?: string;
  education: string;
  total_assets: number;
  total_liabilities: number;
  cash_amount?: number;
  source_url?: string;
}

export function AffidavitCard({ affidavit }: { affidavit: AffidavitData }) {
  if (!affidavit) return null;

  const formattedAssets = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(affidavit.total_assets || 0);
  const formattedLiabilities = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(affidavit.total_liabilities || 0);
  const netWorth = (affidavit.total_assets || 0) - (affidavit.total_liabilities || 0);
  const formattedNetWorth = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(netWorth);

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
              Official Affidavit Disclosures (ADR / MyNeta)
              {(affidavit as any).is_mock && (
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 font-mono px-2 py-0.5 rounded font-bold">
                  [Sample Mock Data]
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
              Election {affidavit.election_year} &bull; {affidavit.house} ({affidavit.constituency}, {affidavit.state})
            </p>
          </div>
          {affidavit.criminal_cases_count > 0 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              ⚠️ {affidavit.criminal_cases_count} Declared Criminal Cases
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              ✓ Clean Criminal Record (0 Cases)
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Financial Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-background border border-border">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block">Total Declared Assets</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{formattedAssets}</span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block">Total Liabilities</span>
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{formattedLiabilities}</span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block">Net Declared Wealth</span>
            <span className="text-xl font-bold font-mono text-primary">{formattedNetWorth}</span>
          </div>
        </div>

        {/* Details & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">Educational Qualification</span>
            <p className="font-medium text-foreground">{affidavit.education || 'Unspecified'}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">Political Party & Status</span>
            <p className="font-medium text-foreground">{affidavit.party} {affidavit.winner_flag ? '(Elected MP)' : ''}</p>
          </div>
        </div>

        {/* Criminal Cases Breakdown */}
        {affidavit.criminal_cases_count > 0 && affidavit.criminal_ipc_sections && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs space-y-1">
            <span className="font-bold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">Declared IPC Charges & Sections:</span>
            <p className="text-muted-foreground font-mono">{affidavit.criminal_ipc_sections}</p>
          </div>
        )}

        {affidavit.source_url && (
          <div className="pt-2 text-right">
            <a href={affidavit.source_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
              Verify Full ECI Affidavit &rarr;
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
