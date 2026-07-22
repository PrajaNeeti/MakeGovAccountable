import { getMpladsData } from '@/lib/mplads-data';
import { getMLALADSchemes } from '@/app/actions/mlalad';
import { MpladsDashboard } from '@/components/mplads/MpladsDashboard';

export const dynamic = 'force-dynamic';

export default async function MpladsPage() {
  const { overview, states, mps, sectors, completedWorks } = getMpladsData();
  const mlaladSchemes = await getMLALADSchemes();

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12">
      <MpladsDashboard
        overview={overview}
        states={states}
        mps={mps}
        sectors={sectors}
        completedWorks={completedWorks}
        mlaladSchemes={mlaladSchemes}
      />
    </div>
  );
}
