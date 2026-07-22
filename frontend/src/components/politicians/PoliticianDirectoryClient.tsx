'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Search, Scale, FileText, ArrowRight, UserCheck } from "lucide-react";

export default function PoliticianDirectoryClient({ politicians }: { politicians: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHouse, setFilterHouse] = useState<'ALL' | 'LOK_SABHA' | 'RAJYA_SABHA' | 'CRIMINAL'>('ALL');

  const filtered = politicians.filter((pol) => {
    const nameMatch = `${pol.first_name} ${pol.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pol.constituency || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pol.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pol.party || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!nameMatch) return false;

    if (filterHouse === 'LOK_SABHA') return pol.house === 'Lok Sabha';
    if (filterHouse === 'RAJYA_SABHA') return pol.house === 'Rajya Sabha';
    if (filterHouse === 'CRIMINAL') return (pol.criminal_cases_count || 0) > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-primary pb-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, state, party, or constituency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-primary bg-background text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterHouse('ALL')}
            className={`px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'ALL'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-transparent text-primary hover:bg-primary/10'
            }`}
          >
            All ({politicians.length})
          </button>
          <button
            onClick={() => setFilterHouse('LOK_SABHA')}
            className={`px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'LOK_SABHA'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-transparent text-primary hover:bg-primary/10'
            }`}
          >
            Lok Sabha
          </button>
          <button
            onClick={() => setFilterHouse('RAJYA_SABHA')}
            className={`px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'RAJYA_SABHA'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-transparent text-primary hover:bg-primary/10'
            }`}
          >
            Rajya Sabha
          </button>
          <button
            onClick={() => setFilterHouse('CRIMINAL')}
            className={`px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'CRIMINAL'
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : 'border-destructive text-destructive hover:bg-destructive/10'
            }`}
          >
            With Criminal Cases
          </button>
        </div>
      </div>

      {/* Politicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pol) => (
          <Card key={pol.id} className="hover:border-primary transition-all flex flex-col justify-between border-2 border-primary/80 bg-card">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <CardTitle className="font-serif text-2xl font-bold uppercase tracking-tight text-primary">
                    {pol.first_name} {pol.last_name}
                  </CardTitle>
                  <p className="text-xs font-narrow font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                    {pol.party || 'Independent'} &bull; {pol.constituency}, {pol.state}
                  </p>
                </div>
                {pol.is_mock && (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 font-mono px-1.5 py-0.5 rounded font-bold">
                    [Sample]
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="py-4 space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {pol.bio}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t">
                <div>
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Declared Net Assets</span>
                  <span className="font-serif font-bold text-sm text-primary">
                    {pol.total_assets > 0 ? `₹${(pol.total_assets / 1e7).toFixed(2)} Cr` : 'Declared in Affidavit'}
                  </span>
                </div>
                <div>
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Criminal Records</span>
                  {pol.criminal_cases_count > 0 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-destructive">
                      <AlertTriangle className="w-3 h-3" /> {pol.criminal_cases_count} Cases Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Clean Record
                    </span>
                  )}
                </div>
              </div>

              {(pol.attendance_pct > 0 || pol.questions_asked > 0) && (
                <div className="flex items-center justify-between text-xs bg-muted/20 p-2 border">
                  <span>Attendance: <strong>{pol.attendance_pct}%</strong></span>
                  <span>Questions: <strong>{pol.questions_asked}</strong></span>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-muted/10 border-t pt-3 pb-3">
              <Link 
                href={`/politicians/${pol.id}`} 
                className="w-full inline-flex items-center justify-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                View Full Dossier & Affidavit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-primary/40 bg-card">
          <p className="font-serif text-lg text-muted-foreground">No parliamentarians found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
