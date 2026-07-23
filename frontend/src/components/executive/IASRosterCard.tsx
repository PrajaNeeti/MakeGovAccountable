import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface IASOfficer {
  id: string;
  officer_name: string;
  allotment_year: number;
  cadre: string;
  current_posting: string;
  pay_level: string;
  qualification?: string;
}

export function IASRosterCard({ officers }: { officers: IASOfficer[] }) {
  if (!officers || officers.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary">
            DoPT Senior IAS Civil Servants Roster
          </CardTitle>
          {officers.some((o: any) => o.is_mock) ? (
            <span className="text-[10px] font-narrow font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              Sample / Mock Data
            </span>
          ) : (
            <span className="text-[10px] font-narrow font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              ✓ Live Official Source (DoPT Civil List)
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          Executive Cadre Postings & Civil List Authority
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {officers.map((officer) => (
            <div key={officer.id} className="p-4 rounded-lg border border-border bg-background space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-foreground font-serif">{officer.officer_name}</h4>
                  <span className="text-xs font-bold uppercase text-primary tracking-wider">
                    IAS {officer.cadre} Cadre &bull; {officer.allotment_year} Batch
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {officer.pay_level}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{officer.current_posting}</p>
              {officer.qualification && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-1">
                  Education: {officer.qualification}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Coming Soon Indicator Banner */}
        <div className="mt-6 p-4 border-2 border-dashed border-sky-500/50 bg-sky-500/10 rounded-lg text-center space-y-1">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300 flex items-center justify-center gap-1.5">
            ⌛ IPS (Police) & IFS (Foreign Service) Civil Lists — Scheduled Sourcing Coming Soon
          </span>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Current roster indexes IAS (Administrative Service) Level 17 apex appointments. Scrapers for Indian Police Service (MHA) and Foreign Service (MEA) rosters are queued for Phase 6.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
