import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface DepartmentMandate {
  id: string;
  department_name: string;
  mandate_summary: string;
  subject_rules?: string;
  source_doc?: string;
}

export function DepartmentMandateCard({ mandates }: { mandates: DepartmentMandate[] }) {
  if (!mandates || mandates.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary">
            Cabinet Allocation of Business Rules (AoB)
          </CardTitle>
          {mandates.some((m: any) => m.is_mock) ? (
            <span className="text-[10px] font-narrow font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              Sample / Mock Data
            </span>
          ) : (
            <span className="text-[10px] font-narrow font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              ✓ Live Official Source (Cabinet Secretariat)
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          Second Schedule Statutory Executive Mandates & Policy Jurisdiction
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {mandates.map((m) => (
          <div key={m.id} className="p-4 rounded-lg border border-border bg-background space-y-2">
            <h3 className="font-bold text-base text-primary uppercase tracking-tight">{m.department_name}</h3>
            <p className="text-sm text-foreground">{m.mandate_summary}</p>
            {m.subject_rules && (
              <div className="pt-2 text-xs font-mono text-muted-foreground border-t border-border">
                <span className="font-bold uppercase text-foreground block mb-1">Key Subject Allocations:</span>
                <p>{m.subject_rules}</p>
              </div>
            )}
            <div className="text-right pt-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">{m.source_doc || 'Cabinet Secretariat Notification'}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
