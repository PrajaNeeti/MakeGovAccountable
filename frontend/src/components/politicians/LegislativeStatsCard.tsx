import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface LegislativeStatsData {
  mp_name: string;
  house: string;
  attendance_pct: number;
  questions_asked: number;
  debates_participated: number;
  private_bills_introduced: number;
  state?: string;
  constituency?: string;
}

export function LegislativeStatsCard({ stats }: { stats: LegislativeStatsData }) {
  if (!stats) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary">
          Legislative Track Record (PRS India)
        </CardTitle>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          Parliamentary Performance Index &bull; {stats.house}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background border border-border text-center">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block mb-1">Attendance</span>
            <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{stats.attendance_pct}%</span>
          </div>
          <div className="p-4 rounded-lg bg-background border border-border text-center">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block mb-1">Questions Asked</span>
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{stats.questions_asked}</span>
          </div>
          <div className="p-4 rounded-lg bg-background border border-border text-center">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block mb-1">Debates</span>
            <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">{stats.debates_participated}</span>
          </div>
          <div className="p-4 rounded-lg bg-background border border-border text-center">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block mb-1">Private Bills</span>
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{stats.private_bills_introduced}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
