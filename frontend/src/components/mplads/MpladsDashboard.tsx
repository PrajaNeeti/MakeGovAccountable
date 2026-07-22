"use client";

import { useState, useMemo, useEffect } from 'react';
import { MpladsOverview, StateSummary, MpSummary, SectorSummaryItem, CompletedWorkItem } from '@/lib/mplads-data';
import { 
  Search, Download, ArrowUpDown, ShieldCheck, PieChart, Landmark, 
  CheckCircle2, TrendingUp, RefreshCw, UserCheck, Briefcase, FileSpreadsheet, Layers, Filter
} from 'lucide-react';

interface MpladsDashboardProps {
  overview: MpladsOverview | null;
  states: StateSummary[];
  mps: MpSummary[];
  sectors: SectorSummaryItem[];
  completedWorks: CompletedWorkItem[];
}

export function MpladsDashboard({ 
  overview: initialOverview, 
  states: initialStates, 
  mps: initialMps, 
  sectors: initialSectors,
  completedWorks: initialCompletedWorks
}: MpladsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'mps' | 'sectors' | 'works' | 'downloads'>('overview');
  
  const [overview, setOverview] = useState<MpladsOverview | null>(initialOverview);
  const [states, setStates] = useState<StateSummary[]>(initialStates || []);
  const [mps, setMps] = useState<MpSummary[]>(initialMps || []);
  const [sectors, setSectors] = useState<SectorSummaryItem[]>(initialSectors || []);
  const [completedWorks, setCompletedWorks] = useState<CompletedWorkItem[]>(initialCompletedWorks || []);
  const [loading, setLoading] = useState<boolean>(false);

  // Search & Filter States
  const [stateSearch, setStateSearch] = useState('');
  const [stateSortField, setStateSortField] = useState<'state' | 'totalAllocated' | 'totalExpenditure' | 'utilizationPercentage'>('utilizationPercentage');
  const [stateSortOrder, setStateSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search & Filter MPs
  const [mpSearch, setMpSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState<'all' | 'Lok Sabha' | 'Rajya Sabha'>('all');

  // Search & Filter Works
  const [workSearch, setWorkSearch] = useState('');

  // Independent client-side fetch for any missing dataset
  useEffect(() => {
    if (!overview) {
      fetch('/data/mplads/json/summary_overview.json')
        .then(res => res.json())
        .then(ovRes => setOverview(ovRes.data || ovRes))
        .catch(() => null);
    }
    if (!states || states.length === 0) {
      fetch('/data/mplads/json/summary_states.json')
        .then(res => res.json())
        .then(stRes => setStates(Array.isArray(stRes) ? stRes : (stRes.data || [])))
        .catch(() => null);
    }
    if (!mps || mps.length === 0) {
      fetch('/data/mplads/json/summary_mps.json')
        .then(res => res.json())
        .then(mpRes => setMps(Array.isArray(mpRes) ? mpRes : (mpRes.data || [])))
        .catch(() => null);
    }
    if (!sectors || sectors.length === 0) {
      fetch('/data/mplads/json/mplads_sectors.json')
        .then(res => res.json())
        .then(secRes => setSectors(secRes.data?.sectors || (Array.isArray(secRes) ? secRes : [])))
        .catch(() => null);
    }
    if (!completedWorks || completedWorks.length === 0) {
      fetch('/data/mplads/json/works_completed.json')
        .then(res => res.json())
        .then(workRes => setCompletedWorks(workRes.data?.completedWorks || (Array.isArray(workRes) ? workRes : [])))
        .catch(() => null);
    }
  }, []);

  // Format Currency (INR)
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    if (val >= 1e10) {
      return `₹${(val / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
    }
    if (val >= 1e7) {
      return `₹${(val / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
    }
    if (val >= 1e5) {
      return `₹${(val / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Filtered States
  const filteredStates = useMemo(() => {
    return states
      .filter((s) => s.state?.toLowerCase().includes(stateSearch.toLowerCase()))
      .sort((a, b) => {
        let valA = a[stateSortField] ?? 0;
        let valB = b[stateSortField] ?? 0;
        if (typeof valA === 'string') valA = (valA as string).toLowerCase();
        if (typeof valB === 'string') valB = (valB as string).toLowerCase();

        if (valA < valB) return stateSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return stateSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [states, stateSearch, stateSortField, stateSortOrder]);

  // Filtered MPs
  const filteredMps = useMemo(() => {
    return mps.filter((m) => {
      const matchSearch = 
        (m.mpName || m.name || '').toLowerCase().includes(mpSearch.toLowerCase()) ||
        (m.constituency || '').toLowerCase().includes(mpSearch.toLowerCase()) ||
        (m.state || '').toLowerCase().includes(mpSearch.toLowerCase());
      
      const matchHouse = houseFilter === 'all' || (m.house && m.house.includes(houseFilter));

      return matchSearch && matchHouse;
    });
  }, [mps, mpSearch, houseFilter]);

  // Filtered Works
  const filteredWorks = useMemo(() => {
    return completedWorks.filter((w) => {
      return (
        (w.work_description || '').toLowerCase().includes(workSearch.toLowerCase()) ||
        (w.district || '').toLowerCase().includes(workSearch.toLowerCase()) ||
        (w.state || '').toLowerCase().includes(workSearch.toLowerCase()) ||
        (w.mp_details?.name || '').toLowerCase().includes(workSearch.toLowerCase()) ||
        (w.category || '').toLowerCase().includes(workSearch.toLowerCase())
      );
    });
  }, [completedWorks, workSearch]);

  const toggleStateSort = (field: typeof stateSortField) => {
    if (stateSortField === field) {
      setStateSortOrder(stateSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStateSortField(field);
      setStateSortOrder('desc');
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Masthead */}
      <header className="border-b-2 border-t-2 border-primary py-10 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          Ministry of Statistics & Programme Implementation • e-SAKSHI & MoSPI Audit
        </span>
        <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight text-primary mt-4">
          MPLADS Parliamentary Oversight Ledger
        </h1>
        <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto mt-3">
          Deep public accountability platform for the Member of Parliament Local Area Development Scheme.
          Auditing ₹11,500+ Crores in development funds across Parliamentarians, States, Sectors, and Ground Projects.
        </p>
      </header>

      {/* Multi-Tab Navigation Bar */}
      <div className="border-b-2 border-primary bg-background sticky top-16 z-40">
        <nav className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`font-narrow text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              activeTab === 'overview'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Landmark className="w-4 h-4" /> 1. Executive Summary
            </span>
          </button>

          <button
            onClick={() => setActiveTab('states')}
            className={`font-narrow text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              activeTab === 'states'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <PieChart className="w-4 h-4" /> 2. States Audit ({states.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mps')}
            className={`font-narrow text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              activeTab === 'mps'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> 3. MP Directory ({mps.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sectors')}
            className={`font-narrow text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              activeTab === 'sectors'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> 4. Sectors ({sectors.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('works')}
            className={`font-narrow text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              activeTab === 'works'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> 5. Ground Works Ledger ({completedWorks.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`font-narrow text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 border-2 transition-all ${
              activeTab === 'downloads'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> 6. Open Data Downloads
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
                  <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Funds Allocated</span>
                  <Landmark className="w-4 h-4 text-primary" />
                </div>
                <p className="font-serif text-3xl font-bold text-primary">{formatCurrency(overview.totalAllocated)}</p>
              </div>
              <p className="font-narrow text-xs text-muted-foreground uppercase mt-4">Average per MP: {formatCurrency(overview.avgAllocation)}</p>
            </div>

            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
                  <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Expenditure</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="font-serif text-3xl font-bold text-primary">{formatCurrency(overview.totalExpenditure)}</p>
              </div>
              <p className="font-narrow text-xs text-muted-foreground uppercase mt-4">Pending Payments: {formatCurrency(overview.inProgressPayments)}</p>
            </div>

            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
                  <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">National Utilization</span>
                  <PieChart className="w-4 h-4 text-primary" />
                </div>
                <p className="font-serif text-3xl font-bold text-primary">{overview.utilizationPercentage?.toFixed(2)}%</p>
              </div>
              <div className="w-full bg-secondary h-2 border border-primary mt-4">
                <div className="bg-primary h-full" style={{ width: `${Math.min(100, overview.utilizationPercentage || 0)}%` }} />
              </div>
            </div>

            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-3">
                  <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Works Completed / Rec.</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="font-serif text-3xl font-bold text-primary">
                  {overview.totalWorksCompleted?.toLocaleString('en-IN')} <span className="text-lg text-muted-foreground font-normal">/ {overview.totalWorksRecommended?.toLocaleString('en-IN')}</span>
                </p>
              </div>
              <p className="font-narrow text-xs text-muted-foreground uppercase mt-4">Completion Rate: {overview.completionRate?.toFixed(1)}% ({overview.totalMPs} MPs)</p>
            </div>
          </section>

          {/* Secondary Financial Audit Callouts */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-primary bg-secondary/30 p-6">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Completed Works Value</span>
              <p className="font-serif text-2xl font-bold text-primary mt-2">{formatCurrency(overview.completedWorksValue)}</p>
              <p className="font-sans text-xs text-muted-foreground mt-2">Monetary value of verified completed local works.</p>
            </div>

            <div className="border border-primary bg-secondary/30 p-6">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment Gap Ratio</span>
              <p className="font-serif text-2xl font-bold text-primary mt-2">{overview.paymentGap?.toFixed(1)}%</p>
              <p className="font-sans text-xs text-muted-foreground mt-2">Gap between sanctioned project work and actual fund disbursement.</p>
            </div>

            <div className="border border-primary bg-secondary/30 p-6">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Pending Local Projects</span>
              <p className="font-serif text-2xl font-bold text-primary mt-2">{overview.pendingWorks?.toLocaleString('en-IN')}</p>
              <p className="font-sans text-xs text-muted-foreground mt-2">Recommended projects currently awaiting execution or sanction.</p>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: STATE & TERRITORY AUDIT */}
      {activeTab === 'states' && (
        <section className="border border-primary bg-card p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold uppercase">State & Union Territory Fund Audit</h2>
              <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                Comparative utilization metrics across 36 Indian States and Union Territories
              </p>
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search state..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-primary bg-background font-sans focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-secondary/50 font-narrow uppercase tracking-widest text-xs">
                  <th onClick={() => toggleStateSort('state')} className="py-3 px-4 cursor-pointer hover:bg-secondary">
                    <div className="flex items-center gap-2">State / UT <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => toggleStateSort('totalAllocated')} className="py-3 px-4 cursor-pointer text-right hover:bg-secondary">
                    <div className="flex items-center justify-end gap-2">Allocated <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => toggleStateSort('totalExpenditure')} className="py-3 px-4 cursor-pointer text-right hover:bg-secondary">
                    <div className="flex items-center justify-end gap-2">Spent <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => toggleStateSort('utilizationPercentage')} className="py-3 px-4 cursor-pointer text-right hover:bg-secondary">
                    <div className="flex items-center justify-end gap-2">Utilization % <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3 px-4 text-right">Progress</th>
                  <th className="py-3 px-4 text-right">Works (Done / Rec)</th>
                </tr>
              </thead>
              <tbody>
                {filteredStates.map((st, i) => (
                  <tr key={st.state || i} className="border-b border-primary/20 hover:bg-secondary/30 font-sans">
                    <td className="py-3 px-4 font-serif font-bold text-primary">{st.state}</td>
                    <td className="py-3 px-4 text-right font-narrow font-bold">{formatCurrency(st.totalAllocated)}</td>
                    <td className="py-3 px-4 text-right font-narrow font-bold">{formatCurrency(st.totalExpenditure)}</td>
                    <td className="py-3 px-4 text-right font-narrow font-bold text-primary">{st.utilizationPercentage?.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right w-40">
                      <div className="w-full bg-secondary h-2 border border-primary/40">
                        <div className="bg-primary h-full" style={{ width: `${Math.min(100, st.utilizationPercentage || 0)}%` }} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-narrow text-xs font-bold text-muted-foreground">
                      {st.totalWorksCompleted || st.completedWorksCount || 0} / {st.recommendedWorksCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: MEMBER OF PARLIAMENT DIRECTORY */}
      {activeTab === 'mps' && (
        <section className="border border-primary bg-card p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold uppercase">Member of Parliament Performance Ledger</h2>
              <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                Individual utilization performance, unspent balances, and project completion tracking
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 border border-primary p-1 bg-background">
                <button
                  onClick={() => setHouseFilter('all')}
                  className={`font-narrow text-xs font-bold uppercase px-3 py-1 ${houseFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setHouseFilter('Lok Sabha')}
                  className={`font-narrow text-xs font-bold uppercase px-3 py-1 ${houseFilter === 'Lok Sabha' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Lok Sabha
                </button>
                <button
                  onClick={() => setHouseFilter('Rajya Sabha')}
                  className={`font-narrow text-xs font-bold uppercase px-3 py-1 ${houseFilter === 'Rajya Sabha' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Rajya Sabha
                </button>
              </div>

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search MP, constituency..."
                  value={mpSearch}
                  onChange={(e) => setMpSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-primary bg-background font-sans focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-secondary/50 font-narrow uppercase tracking-widest text-xs">
                  <th className="py-3 px-4">Member of Parliament</th>
                  <th className="py-3 px-4">House & Constituency</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Allocated</th>
                  <th className="py-3 px-4 text-right">Spent</th>
                  <th className="py-3 px-4 text-right">Unspent</th>
                  <th className="py-3 px-4 text-right">Utilization %</th>
                  <th className="py-3 px-4 text-right">Works Done</th>
                </tr>
              </thead>
              <tbody>
                {filteredMps.map((m, i) => (
                  <tr key={m.id || i} className="border-b border-primary/20 hover:bg-secondary/30 font-sans">
                    <td className="py-3 px-4 font-serif font-bold text-primary">
                      {m.mpName || m.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block border border-primary px-2 py-0.5 font-narrow text-xs font-bold uppercase mr-2">
                        {m.house || 'Lok Sabha'}
                      </span>
                      <span className="text-muted-foreground text-xs">{m.constituency || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 font-narrow text-xs font-bold">{m.state}</td>
                    <td className="py-3 px-4 text-right font-narrow font-bold">{formatCurrency(m.allocatedAmount || m.allocated)}</td>
                    <td className="py-3 px-4 text-right font-narrow font-bold">{formatCurrency(m.totalExpenditure || m.expenditure)}</td>
                    <td className="py-3 px-4 text-right font-narrow text-xs font-bold text-muted-foreground">
                      {formatCurrency(m.unspentAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-narrow font-bold text-primary">
                      {(m.utilizationPercentage || 0).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-narrow text-xs font-bold">
                      {m.completedWorksCount || m.worksCompleted || 0}
                    </td>
                  </tr>
                ))}
                {filteredMps.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground font-serif">
                      No parliamentarians found matching "{mpSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: SECTORAL ALLOCATIONS */}
      {activeTab === 'sectors' && (
        <section className="border border-primary bg-card p-6 space-y-6">
          <div className="border-b border-primary pb-4">
            <h2 className="font-serif text-2xl font-bold uppercase">Sectoral Fund Distribution</h2>
            <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
              Public works categorisation across Infrastructure, Repairs, SC/ST Development, and Sanitation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sec, i) => (
              <div key={sec.name || i} className="border-2 border-primary bg-secondary/20 p-6 flex flex-col justify-between">
                <div>
                  <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Category #{i + 1}</span>
                  <h3 className="font-serif text-2xl font-bold uppercase text-primary mt-1">{sec.name}</h3>
                  <div className="w-full h-px bg-primary/20 my-4" />

                  <div className="space-y-2 font-narrow uppercase text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Projects Count:</span>
                      <span className="font-bold text-primary">{sec.works?.count?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost Sanctioned:</span>
                      <span className="font-bold text-primary">{formatCurrency(sec.works?.totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Cost per Work:</span>
                      <span className="font-bold text-primary">{formatCurrency(sec.works?.avgCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 5: ITEMIZED GROUND PUBLIC WORKS LEDGER */}
      {activeTab === 'works' && (
        <section className="border border-primary bg-card p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold uppercase">Itemized Ground Public Works Ledger</h2>
              <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                Verified local infrastructure projects funded by Member of Parliament allocations ({completedWorks.length} entries)
              </p>
            </div>

            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search works (e.g. pipeline, road, district)..."
                value={workSearch}
                onChange={(e) => setWorkSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-primary bg-background font-sans focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-secondary/50 font-narrow uppercase tracking-widest text-xs">
                  <th className="py-3 px-4">Work Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location / District</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Cost (₹)</th>
                  <th className="py-3 px-4 text-right">MP Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorks.map((wk, i) => (
                  <tr key={wk._id || i} className="border-b border-primary/20 hover:bg-secondary/30 font-sans">
                    <td className="py-3 px-4 max-w-md">
                      <p className="font-serif font-bold text-primary leading-tight">{wk.work_description}</p>
                      <span className="font-narrow text-xs text-muted-foreground uppercase">Work ID: #{wk.work_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="border border-primary px-2 py-0.5 font-narrow text-xs font-bold uppercase">
                        {wk.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-xs">
                      <p className="font-bold">{wk.district}</p>
                      <span className="text-muted-foreground text-xs">{wk.location}</span>
                    </td>
                    <td className="py-3 px-4 font-narrow text-xs font-bold">{wk.state}</td>
                    <td className="py-3 px-4 text-right font-narrow font-bold text-primary">
                      {formatCurrency(wk.cost)}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-xs">
                      {wk.mp_details?.name || 'N/A'}
                    </td>
                  </tr>
                ))}
                {filteredWorks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-serif">
                      No ground works found matching "{workSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 6: OPEN DATA DOWNLOADS */}
      {activeTab === 'downloads' && (
        <section className="border-2 border-primary bg-secondary/30 p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-narrow text-xs font-bold uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" /> Open Data Export & API Directory
            </div>
            <h3 className="font-serif text-3xl font-bold uppercase">Download Public Datasets</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
              All raw datasets extracted from MoSPI (<a href="https://mplads.gov.in" target="_blank" rel="noreferrer" className="underline hover:text-primary">mplads.gov.in</a> & <a href="https://esakshi.mospi.gov.in" target="_blank" rel="noreferrer" className="underline hover:text-primary">e-SAKSHI</a>) are freely available for journalists, researchers, and developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-xl font-bold uppercase">State Summaries</h4>
                <p className="font-sans text-xs text-muted-foreground mt-1">36 States & UT allocation & spending statistics.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <a href="/data/mplads/json/summary_states.json" download className="border border-primary px-3 py-1 font-narrow text-xs font-bold uppercase bg-primary text-primary-foreground">JSON</a>
                <a href="/data/mplads/csv/summary_states.csv" download className="border border-primary px-3 py-1 font-narrow text-xs font-bold uppercase hover:bg-primary hover:text-primary-foreground">CSV</a>
              </div>
            </div>

            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-xl font-bold uppercase">Parliamentarians Directory</h4>
                <p className="font-sans text-xs text-muted-foreground mt-1">Individual MP performance and unspent balances.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <a href="/data/mplads/json/summary_mps.json" download className="border border-primary px-3 py-1 font-narrow text-xs font-bold uppercase bg-primary text-primary-foreground">JSON</a>
                <a href="/data/mplads/csv/summary_mps.csv" download className="border border-primary px-3 py-1 font-narrow text-xs font-bold uppercase hover:bg-primary hover:text-primary-foreground">CSV</a>
              </div>
            </div>

            <div className="border border-primary bg-card p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-xl font-bold uppercase">Completed Ground Works</h4>
                <p className="font-sans text-xs text-muted-foreground mt-1">Itemized local public works with cost in ₹.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <a href="/data/mplads/json/works_completed.json" download className="border border-primary px-3 py-1 font-narrow text-xs font-bold uppercase bg-primary text-primary-foreground">JSON</a>
                <a href="/data/mplads/csv/works_completed.csv" download className="border border-primary px-3 py-1 font-narrow text-xs font-bold uppercase hover:bg-primary hover:text-primary-foreground">CSV</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
