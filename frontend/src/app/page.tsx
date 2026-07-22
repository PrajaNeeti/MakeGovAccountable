import { getUnifiedFeed } from "./actions/feed";
import { UnifiedFeed } from "@/components/UnifiedFeed";
import Image from "next/image";
import Link from "next/link";
import { Scale, MessageSquare, Database, PlusCircle, ArrowRight, ShieldCheck, Landmark, UserCheck, Layers, FileSpreadsheet } from "lucide-react";
import { getMpladsData } from "@/lib/mplads-data";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialItems = await getUnifiedFeed(1, 10);
  const { overview } = getMpladsData();

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-20 space-y-16">
      {/* Editorial Hero Masthead */}
      <header className="py-14 md:py-20 border-b-2 border-t-2 border-primary my-6 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          An Open Source Civic Accountability Platform
        </span>
        <h1 className="text-5xl md:text-8xl font-black font-serif tracking-tight text-primary uppercase mt-4">
          PrajaNeeti
        </h1>
        <p className="text-muted-foreground mt-4 font-sans text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Quiet Accountability Over Political Noise • Documenting What is Promised, Delivered, and Pending
        </p>

        {/* Featured Philosophical Quote */}
        <div className="max-w-3xl mx-auto my-8 p-6 border-y border-primary/40 bg-secondary/30">
          <blockquote className="font-serif italic text-lg md:text-xl text-primary">
            "As FORCE is always on the side of the governed, the governors have nothing to support them but opinion. 'Tis therefore on opinion only that government is founded."
          </blockquote>
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2 block">
            — David Hume, <em>Of the First Principles of Government</em> (1742)
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-6 py-3 font-narrow text-sm font-bold uppercase tracking-widest transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Raise a Concern
          </Link>

          <Link
            href="/transparency"
            className="inline-flex items-center gap-2 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 font-narrow text-sm font-bold uppercase tracking-widest transition-all"
          >
            Explore Data Hub <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Live Data Accountability Stats Counter Bar */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border-2 border-primary bg-card p-6 text-center">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Audited MPLADS Funds</span>
          <p className="font-serif text-3xl md:text-4xl font-bold text-primary mt-2">
            ₹{(overview?.totalAllocated ? overview.totalAllocated / 1e7 : 11538).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr
          </p>
          <span className="font-narrow text-xs text-muted-foreground uppercase mt-1 block">MoSPI / e-SAKSHI Records</span>
        </div>

        <div className="border-2 border-primary bg-card p-6 text-center">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">MP Affidavits Tracked</span>
          <p className="font-serif text-3xl md:text-4xl font-bold text-primary mt-2">
            483 MPs
          </p>
          <span className="font-narrow text-xs text-muted-foreground uppercase mt-1 block">ADR / MyNeta Disclosures</span>
        </div>

        <div className="border-2 border-primary bg-card p-6 text-center">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Executive Mandates</span>
          <p className="font-serif text-3xl md:text-4xl font-bold text-primary mt-2">
            AoB Rules & IAS
          </p>
          <span className="font-narrow text-xs text-muted-foreground uppercase mt-1 block">Cabinet Sec & DoPT Lists</span>
        </div>

        <div className="border-2 border-primary bg-card p-6 text-center">
          <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">Judicial Pendency</span>
          <p className="font-serif text-3xl md:text-4xl font-bold text-primary mt-2">
            6.18M Cases
          </p>
          <span className="font-narrow text-xs text-muted-foreground uppercase mt-1 block">NJDG High Court Backlogs</span>
        </div>
      </section>

      {/* The 3 Pillars Interactive Gateways */}
      <section className="space-y-6">
        <div className="border-b-2 border-primary pb-3">
          <h2 className="font-serif text-3xl font-bold uppercase text-primary">The 3 Pillars of PrajaNeeti</h2>
          <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
            Navigating information, discourse, and open accountability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="border-2 border-primary bg-card p-8 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 1</span>
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Philosophy & Vision</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Articles on proper governance, David Hume's 1742 principles of political legitimacy, Chanakya Neeti, and performing your <em>Swadharma</em> quietly without partisan noise.
              </p>
            </div>
            <Link
              href="/vision"
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-4 py-2.5 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              Read Vision & Essays <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="border-2 border-primary bg-card p-8 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 2</span>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Discourse & Concerns</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Thoughtful editorial forums and citizen concern portal equipped with AI semantic de-duplication to consolidate public willpower.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href="/forums"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                Forums
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-3 py-2 transition-all"
              >
                + Raise Concern
              </Link>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="border-2 border-primary bg-card p-8 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 3</span>
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Data & Accountability</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Multi-branch scraped ledgers auditing ₹11,538+ Cr in MPLADS funds, candidate affidavits, PRS attendance, IAS rosters, and NJDG court backlogs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href="/transparency"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                Data Hub
              </Link>
              <Link
                href="/dashboards"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-3 py-2 transition-all"
              >
                Dashboards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Branch Governance Intelligence Grid */}
      <section className="space-y-6">
        <div className="border-b-2 border-primary pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-3xl font-bold uppercase text-primary">Multi-Branch Governance Intelligence</h2>
            <p className="font-narrow text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
              Direct pathways to newly integrated data pipelines across Executive, Legislative, and Judicial pillars
            </p>
          </div>
          <Link
            href="/milestones"
            className="text-xs font-narrow font-bold uppercase tracking-wider text-primary hover:underline"
          >
            View Data Milestones Ledger &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-primary bg-card p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Legislative Pillar</span>
              <h3 className="font-serif text-xl font-bold uppercase text-primary">Candidate Affidavits & PRS Performance</h3>
              <p className="text-xs text-muted-foreground">483 Lok Sabha winner affidavits (wealth, criminal cases, education) + PRS attendance & questions.</p>
            </div>
            <Link
              href="/politicians"
              className="mt-4 inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              Track MP Affidavits &rarr;
            </Link>
          </div>

          <div className="border border-primary bg-card p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Executive Pillar</span>
              <h3 className="font-serif text-xl font-bold uppercase text-primary">AoB Mandates & Senior IAS Rosters</h3>
              <p className="text-xs text-muted-foreground">Cabinet Secretariat Allocation of Business rules + DoPT e-Civil List senior civil servant postings.</p>
            </div>
            <Link
              href="/dashboards"
              className="mt-4 inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              View Executive Dashboards &rarr;
            </Link>
          </div>

          <div className="border border-primary bg-card p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Judicial & State Funds</span>
              <h3 className="font-serif text-xl font-bold uppercase text-primary">NJDG Backlog & State MLALAD Pilot</h3>
              <p className="text-xs text-muted-foreground">High Court case pendency & 10+ year delays + Gujarat state Assembly constituency fund spending.</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                href="/dashboards"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                NJDG Pendency
              </Link>
              <Link
                href="/mplads"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-3 py-2 transition-all"
              >
                MLALAD Pilot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Hero Article & Unified Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
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
              Audit of Union Expenditures & Parliamentary Allocations
            </h2>
            <p className="font-sans text-xl text-muted-foreground mb-6">
              Examine the latest public records on government spending, compare state utilization rates, and participate in constructive civic discourse.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/mplads"
                className="inline-flex items-center justify-center font-narrow font-bold transition-all uppercase tracking-wider text-xs border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-5 py-2.5"
              >
                MPLADS Oversight
              </Link>
              <Link 
                href="/politicians"
                className="inline-flex items-center justify-center font-narrow font-bold transition-all uppercase tracking-wider text-xs border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-5 py-2.5"
              >
                Track Politicians
              </Link>
              <Link 
                href="/dashboards"
                className="inline-flex items-center justify-center font-narrow font-bold transition-all uppercase tracking-wider text-xs border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-5 py-2.5"
              >
                View Dashboards
              </Link>
            </div>
          </article>

          <UnifiedFeed initialItems={initialItems} initialFilters={{}} />
        </div>
        
        <aside className="lg:col-span-3 border-l border-primary pl-8 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <h2 className="font-serif text-2xl font-bold border-b border-primary pb-2 uppercase">Public Audit Summary</h2>
            <div className="flex flex-col gap-6">
              <div>
                <p className="font-narrow text-sm font-bold text-muted-foreground uppercase tracking-wider">Audited MPLADS Funds</p>
                <p className="font-serif text-3xl font-bold">₹11,538 Cr</p>
              </div>
              <div className="w-full h-px bg-primary/20"></div>
              <div>
                <p className="font-narrow text-sm font-bold text-muted-foreground uppercase tracking-wider">Candidate Affidavits</p>
                <p className="font-serif text-3xl font-bold">483 MPs</p>
              </div>
              <div className="w-full h-px bg-primary/20"></div>
              <div>
                <p className="font-narrow text-sm font-bold text-muted-foreground uppercase tracking-wider">Judicial Backlog</p>
                <p className="font-serif text-3xl font-bold">6.18M Cases</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
