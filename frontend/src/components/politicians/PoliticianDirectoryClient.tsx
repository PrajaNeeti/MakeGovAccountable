'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Search, ArrowRight, User } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b-2 border-primary pb-6">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by candidate name, constituency, state, or party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-primary bg-background text-sm font-sans focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterHouse('ALL')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'ALL'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-background text-primary hover:bg-muted'
            }`}
          >
            All Dossiers ({politicians.length})
          </button>
          <button
            onClick={() => setFilterHouse('LOK_SABHA')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'LOK_SABHA'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-background text-primary hover:bg-muted'
            }`}
          >
            Lok Sabha
          </button>
          <button
            onClick={() => setFilterHouse('RAJYA_SABHA')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'RAJYA_SABHA'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-background text-primary hover:bg-muted'
            }`}
          >
            Rajya Sabha
          </button>
          <button
            onClick={() => setFilterHouse('CRIMINAL')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'CRIMINAL'
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : 'border-primary bg-background text-destructive hover:bg-destructive/10'
            }`}
          >
            With Criminal Cases
          </button>
        </div>
      </div>

      {/* Politicians Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pol) => (
          <div key={pol.id} className="border-2 border-primary bg-card flex flex-col justify-between transition-all hover:bg-muted/10">
            {/* Dossier Header */}
            <div className="p-5 border-b-2 border-primary space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-primary">
                    {pol.first_name} {pol.last_name}
                  </h2>
                  <p className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {pol.party || 'Independent'} &bull; {pol.constituency}, {pol.state}
                  </p>
                </div>
                <div className="w-12 h-14 border border-primary bg-muted flex items-center justify-center text-primary flex-shrink-0">
                  <User className="w-6 h-6 opacity-60" />
                </div>
              </div>
            </div>

            {/* Dossier Content */}
            <div className="p-5 space-y-4 flex-1">
              <p className="font-sans text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {pol.bio || 'Public dossier record scraped from Election Commission of India affidavits and PRS Legislative Research archives.'}
              </p>

              {/* Financial & Disclosure Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-primary/20">
                <div className="space-y-1">
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Net Worth Affidavit
                  </span>
                  <span className="font-serif font-bold text-base text-primary block">
                    {pol.total_assets > 0 ? `₹${(pol.total_assets / 1e7).toFixed(2)} Cr` : 'Declared'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Criminal Disclosure
                  </span>
                  {pol.criminal_cases_count > 0 ? (
                    <span className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 border border-destructive px-1.5 py-0.5">
                      <AlertTriangle className="w-3 h-3" /> {pol.criminal_cases_count} Case{pol.criminal_cases_count > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600 px-1.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Clean Record
                    </span>
                  )}
                </div>
              </div>

              {/* Attendance & Participation Bar */}
              {(pol.attendance_pct > 0 || pol.questions_asked > 0) && (
                <div className="flex items-center justify-between font-narrow text-xs font-bold uppercase tracking-wider p-2.5 border border-primary bg-muted/30">
                  <span>Attendance: <strong className="text-primary">{pol.attendance_pct}%</strong></span>
                  <span>Questions: <strong className="text-primary">{pol.questions_asked}</strong></span>
                </div>
              )}
            </div>

            {/* Dossier Footer Action */}
            <div className="p-4 border-t-2 border-primary bg-muted/10">
              <Link 
                href={`/politicians/${pol.id}`} 
                className="w-full inline-flex items-center justify-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground px-4 py-2.5 hover:bg-transparent hover:text-primary transition-all"
              >
                View Full Dossier <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-primary/50 bg-card">
          <p className="font-serif text-xl font-bold uppercase text-muted-foreground">No parliamentarians found matching criteria.</p>
        </div>
      )}
    </div>
  );
}

