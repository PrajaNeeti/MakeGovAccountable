import { getUnifiedFeed } from "./actions/feed";
import { UnifiedFeed } from "@/components/UnifiedFeed";
import Image from "next/image";

export default async function Home() {
  const initialItems = await getUnifiedFeed(1, 20);

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-16">
      <header className="py-12 md:py-16 border-b border-t border-primary my-8 text-center">
        <h1 className="text-5xl md:text-7xl font-black font-serif tracking-tight text-primary uppercase">
          PrajaNeeti
        </h1>
        <p className="text-muted-foreground mt-4 font-narrow uppercase tracking-widest text-sm font-bold">
          The Information First • Track Government Activities • Join the Discussion
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 flex flex-col gap-10">
          <article className="border-b-2 border-primary pb-10">
            <div className="w-full relative aspect-[21/9] mb-6 overflow-hidden border border-primary">
              <Image 
                src="/indian_parliament.jpg" 
                alt="Indian Parliament Building - Sansad Bhavan" 
                fill 
                className="object-cover grayscale contrast-125" 
                priority
              />
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-serif tracking-tight leading-tight mb-4">
              Budget Session Begins: Complete Audit of Union Expenditures
            </h2>
            <p className="font-sans text-xl text-muted-foreground mb-6">
              As the legislative session opens, transparency initiatives take center stage. Examine the latest records on public spending and hold officials accountable through open discourse.
            </p>
          </article>

          <UnifiedFeed initialItems={initialItems} initialFilters={{}} />
        </div>
        
        <aside className="lg:col-span-3 border-l border-primary pl-8 hidden lg:block">
          <div className="sticky top-24">
            <h2 className="font-serif text-2xl font-bold mb-6 border-b border-primary pb-2 uppercase">Accountability Tracker</h2>
            <div className="flex flex-col gap-6">
              <div>
                <p className="font-narrow text-sm font-bold text-muted-foreground uppercase tracking-wider">Audited Spending</p>
                <p className="font-serif text-4xl font-bold">₹1.14 Lakh Cr</p>
              </div>
              <div className="w-full h-px bg-primary/20"></div>
              <div>
                <p className="font-narrow text-sm font-bold text-muted-foreground uppercase tracking-wider">Oversight Efficiency</p>
                <p className="font-serif text-4xl font-bold">98.2%</p>
              </div>
              <div className="w-full h-px bg-primary/20"></div>
              <div>
                <p className="font-narrow text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Inquiries</p>
                <p className="font-serif text-4xl font-bold">28</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
