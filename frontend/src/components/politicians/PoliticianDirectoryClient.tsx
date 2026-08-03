'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Search, ArrowRight, User, Award, Target, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PoliticianDirectoryClient({ politicians }: { politicians: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHouse, setFilterHouse] = useState<'ALL' | 'LOK_SABHA' | 'RAJYA_SABHA' | 'CRIMINAL' | 'PROMISES'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const filtered = useMemo(() => {
    return politicians.filter((pol) => {
      const nameMatch = `${pol.first_name} ${pol.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pol.constituency || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pol.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pol.party || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!nameMatch) return false;

      if (filterHouse === 'LOK_SABHA') return pol.house === 'Lok Sabha';
      if (filterHouse === 'RAJYA_SABHA') return pol.house === 'Rajya Sabha';
      if (filterHouse === 'CRIMINAL') return (pol.criminal_cases_count || 0) > 0 || (pol.case_allegations || []).length > 0;
      if (filterHouse === 'PROMISES') return (pol.promises || []).length > 0;
      return true;
    });
  }, [politicians, searchTerm, filterHouse]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handleFilterChange = (val: typeof filterHouse) => {
    setFilterHouse(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-primary bg-background text-sm font-sans focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'ALL'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-background text-primary hover:bg-muted'
            }`}
          >
            All Dossiers ({politicians.length})
          </button>
          <button
            onClick={() => handleFilterChange('LOK_SABHA')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'LOK_SABHA'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-background text-primary hover:bg-muted'
            }`}
          >
            Lok Sabha
          </button>
          <button
            onClick={() => handleFilterChange('RAJYA_SABHA')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'RAJYA_SABHA'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary bg-background text-primary hover:bg-muted'
            }`}
          >
            Rajya Sabha
          </button>
          <button
            onClick={() => handleFilterChange('CRIMINAL')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'CRIMINAL'
                ? 'border-amber-600 bg-amber-600 text-white'
                : 'border-primary bg-background text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            With Cases & Allegations
          </button>
          <button
            onClick={() => handleFilterChange('PROMISES')}
            className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              filterHouse === 'PROMISES'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-primary bg-background text-blue-600 hover:bg-blue-500/10'
            }`}
          >
            With Tracked Promises
          </button>
        </div>
      </div>

      {/* Pagination & Count Header */}
      <div className="flex items-center justify-between text-xs font-narrow font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
        <span>Showing {filtered.length} Parliamentarians (Page {currentPage} of {totalPages})</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-primary disabled:opacity-30 hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-primary disabled:opacity-30 hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Politicians Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedItems.map((pol) => (
          <div key={pol.id} className="border-2 border-primary bg-card flex flex-col justify-between transition-all hover:bg-muted/10">
            {/* Dossier Header */}
            <div className="p-5 border-b-2 border-primary space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-primary">
                    {pol.first_name} {pol.last_name}
                  </h2>
                  <p className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {pol.party || 'Independent'} &bull; {pol.constituency || pol.state}, {pol.state}
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
                {pol.bio || `${pol.first_name} ${pol.last_name} is a sitting Member of Parliament representing ${pol.constituency}, ${pol.state} in ${pol.house}.`}
              </p>

              {/* Badges for Timeline, Cases, and Promises */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(pol.career_timeline || []).length > 0 && (
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <Award className="w-3 h-3" /> {(pol.career_timeline || []).length} Milestones
                  </span>
                )}
                {(pol.promises || []).length > 0 && (
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <Target className="w-3 h-3" /> {(pol.promises || []).length} Promises
                  </span>
                )}
              </div>

              {/* Financial & Disclosure Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-primary/20">
                <div className="space-y-1">
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    House Representation
                  </span>
                  <span className="font-serif font-bold text-sm text-primary block">
                    {pol.house || 'Lok Sabha'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-narrow text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Legal Disclosures
                  </span>
                  {pol.criminal_cases_count > 0 || (pol.case_allegations || []).length > 0 ? (
                    <span className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5">
                      <AlertTriangle className="w-3 h-3" /> {pol.criminal_cases_count || (pol.case_allegations || []).length} Record(s)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600 px-1.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Clean Record
                    </span>
                  )}
                </div>
              </div>
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-primary">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-primary font-narrow text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-muted"
          >
            &larr; Previous Page
          </button>
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-primary font-narrow text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-muted"
          >
            Next Page &rarr;
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-primary/50 bg-card">
          <p className="font-serif text-xl font-bold uppercase text-muted-foreground">No parliamentarians found matching criteria.</p>
        </div>
      )}
    </div>
  );
}
