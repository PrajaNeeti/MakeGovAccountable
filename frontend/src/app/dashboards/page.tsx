import { getUnifiedFeed } from '@/app/actions/feed';
import { getDepartmentMandatesAndOfficers } from '@/app/actions/departments';
import { getJudicialAggregates } from '@/app/actions/judicial';
import { DashboardCharts } from '@/components/DashboardCharts';
import { UnifiedFeed } from '@/components/UnifiedFeed';
import { DepartmentMandateCard } from '@/components/executive/DepartmentMandateCard';
import { IASRosterCard } from '@/components/executive/IASRosterCard';
import { NJDGStatCard } from '@/components/judicial/NJDGStatCard';

export default async function DashboardsPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const initialFilters = searchParams || {};
  
  const [initialItems, { mandates, officers }, judicialStats] = await Promise.all([
    getUnifiedFeed(1, 20, initialFilters),
    getDepartmentMandatesAndOfficers(),
    getJudicialAggregates()
  ]);

  const chartData = [
    { name: "Lok Sabha 2024", amount: 543 },
    { name: "High Courts", amount: 25 },
    { name: "Union Depts", amount: 91 },
    { name: "IAS Cadres", amount: 26 }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8 space-y-10">
      <div>
        <h1 className="text-4xl font-black font-serif uppercase tracking-tight text-primary">
          Governance Oversight Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Multi-branch accountability feeds across Executive Mandates, Senior IAS Cadres, Legislative Activities, and Judicial Pendency.
        </p>
      </div>

      {/* Executive Mandates & IAS Civil Servants Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black font-serif uppercase tracking-tight border-b-2 border-primary pb-2">
          Executive Pillar — Mandates & Senior IAS Roster
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DepartmentMandateCard mandates={mandates} />
          <IASRosterCard officers={officers} />
        </div>
      </div>

      {/* Judicial Backlog Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black font-serif uppercase tracking-tight border-b-2 border-primary pb-2">
          Judicial Pillar — NJDG Court Pendency & Backlog
        </h2>
        <NJDGStatCard stats={judicialStats} />
      </div>

      {/* Unified Activity Feed & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-black font-serif uppercase tracking-tight mb-4">Unified Governance Activity Feed</h2>
          <UnifiedFeed initialItems={initialItems} initialFilters={initialFilters} />
        </div>
        <div>
          <h2 className="text-2xl font-black font-serif uppercase tracking-tight mb-4">Branch Data Coverage Index</h2>
          <DashboardCharts data={chartData} />
        </div>
      </div>
    </div>
  );
}
