import { createClient } from '@/lib/supabase/server';
import { SpendingTable, SpendingRecord } from '@/components/transparency/spending-table';

export const dynamic = 'force-dynamic';

export default async function TransparencyPage() {
  const supabase = await createClient();
  
  const { data: spendingRecords, error } = await supabase
    .from('spending')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching spending records:', error);
  }

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12">
      <header className="border-b border-t border-primary py-8 mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight uppercase">
          Transparency Ledger
        </h1>
        <p className="text-muted-foreground mt-4 font-narrow uppercase tracking-widest text-sm font-bold">
          Data & Oversight • Official Records • Financial Allocations
        </p>
      </header>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="w-full">
          <SpendingTable data={(spendingRecords as SpendingRecord[]) || []} />
        </div>
      </div>
    </div>
  );
}
