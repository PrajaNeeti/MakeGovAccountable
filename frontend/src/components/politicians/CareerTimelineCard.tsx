import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink, Calendar, Award } from "lucide-react";

export interface CareerTimelineItem {
  period: string;
  position: string;
  source_name?: string;
  source_url?: string;
}

export function CareerTimelineCard({ timeline }: { timeline: CareerTimelineItem[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-muted/40 border-b pb-4">
        <CardTitle className="text-xl font-serif font-black uppercase tracking-tight text-primary flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Career & Biography Timeline ({timeline.length} Milestones)
        </CardTitle>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
          Sourced from PRS India, Sansad Records & Verified Independent Press Profiles
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative border-l-2 border-primary/30 ml-3 pl-6 space-y-6">
          {timeline.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary transition-colors" />

              <div className="bg-background border border-border p-4 rounded-lg shadow-sm space-y-2 hover:border-primary/50 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <span className="font-narrow text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.period}
                  </span>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider"
                    >
                      {item.source_name || 'Source'} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-sm font-sans leading-relaxed text-foreground font-medium">
                  {item.position}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
