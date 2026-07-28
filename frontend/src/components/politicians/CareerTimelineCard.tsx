import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface TimelineItem {
  period: string;
  position: string;
  source_name: string;
  source_url: string;
}

export function CareerTimelineCard({ timeline }: { timeline: TimelineItem[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
              Career Timeline & Public History
            </CardTitle>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
              Cross-checked with PRS, Sansad profiles, & verified press coverage
            </p>
          </div>
          <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded font-bold">
            {timeline.length} Milestones Recorded
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative border-l-2 border-primary/30 ml-3 space-y-6 pl-6 my-2">
          {timeline.map((item, index) => {
            const isAlleged = item.position.toLowerCase().includes('alleged') || 
                              item.position.toLowerCase().includes('disputed') ||
                              item.position.toLowerCase().includes('self-described');

            return (
              <div key={index} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 ${
                  isAlleged ? 'bg-amber-500 border-amber-600' : 'bg-primary border-background'
                }`} />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                      {item.period}
                    </span>
                    {isAlleged && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Allegedly / Self-Reported
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-foreground leading-relaxed pt-1">
                    {item.position}
                  </p>

                  {item.source_url && (
                    <div className="pt-1">
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider inline-flex items-center gap-1"
                      >
                        Source: {item.source_name || 'Verification Link'} &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
