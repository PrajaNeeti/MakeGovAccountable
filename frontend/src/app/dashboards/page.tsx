import { getUnifiedFeed } from '@/app/actions/feed';
import { DashboardCharts } from '@/components/DashboardCharts';
import { UnifiedFeed } from '@/components/UnifiedFeed';

export default async function DashboardsPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const initialFilters = searchParams || {};
  
  const initialItems = await getUnifiedFeed(initialFilters);
  const chartData = [
    { name: "Jan", amount: 400 },
    { name: "Feb", amount: 300 },
    { name: "Mar", amount: 550 },
    { name: "Apr", amount: 450 }
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Unified Feed</h2>
          <UnifiedFeed initialItems={initialItems} initialFilters={initialFilters} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Visualizations</h2>
          <DashboardCharts data={chartData} />
        </div>
      </div>
    </div>
  );
}
