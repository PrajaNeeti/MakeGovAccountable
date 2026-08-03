import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, CheckCircle, ExternalLink, Scale } from "lucide-react";

export interface CaseAllegationItem {
  type: 'declared_affidavit' | 'media_allegation' | string;
  description: string;
  case_summary?: string;
  status?: string;
  source_name?: string;
  source_url?: string;
  date?: string;
}

export function CaseAllegationsCard({ allegations }: { allegations: CaseAllegationItem[] }) {
  if (!allegations || allegations.length === 0) {
    return (
      <Card className="border-2 border-emerald-500/30 bg-emerald-500/5 shadow-md">
        <CardContent className="p-6 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-serif text-lg font-bold text-emerald-900 dark:text-emerald-200 uppercase">
              No Declared Criminal Cases or Known Allegations
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Zero pending criminal charges declared under ECI candidacy affidavits or major verified investigative news archives.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const declared = allegations.filter(a => a.type === 'declared_affidavit');
  const media = allegations.filter(a => a.type === 'media_allegation');

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              Legal Disclosures & Media Allegations ({allegations.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
              Categorized into Sworn Election Affidavits vs. Media Investigative Disclosures
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Declared Affidavits Section */}
        {declared.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Sworn ECI Election Affidavit Declarations
            </h3>
            <div className="space-y-3">
              {declared.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-serif font-bold text-base text-foreground">{item.description}</span>
                    {item.date && (
                      <span className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                        {item.date}
                      </span>
                    )}
                  </div>
                  {item.case_summary && (
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">{item.case_summary}</p>
                  )}
                  {item.status && (
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      <span className="font-bold uppercase tracking-wider">Status: </span>
                      {item.status}
                    </div>
                  )}
                  {item.source_url && (
                    <div className="pt-1 text-right">
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
                        {item.source_name || 'MyNeta / ADR Citation'} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Allegations Section */}
        {media.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" /> Verified Media Allegations & Disputes
            </h3>
            <div className="space-y-3">
              {media.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-background space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-serif font-bold text-base text-foreground">{item.description}</span>
                    {item.date && (
                      <span className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        {item.date}
                      </span>
                    )}
                  </div>
                  {item.case_summary && (
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">{item.case_summary}</p>
                  )}
                  {item.status && (
                    <div className="text-xs font-medium text-foreground bg-muted/30 p-2 rounded border border-border/60">
                      <span className="font-bold uppercase tracking-wider text-muted-foreground">Current Status / Resolution: </span>
                      {item.status}
                    </div>
                  )}
                  {item.source_url && (
                    <div className="pt-1 text-right">
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
                        {item.source_name || 'Press Source'} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
