import { getUnifiedFeed } from "./actions/feed";
import { getDepartmentMandatesAndOfficers } from "./actions/departments";
import { getJudicialAggregates } from "./actions/judicial";
import { UnifiedFeed } from "@/components/UnifiedFeed";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DepartmentMandateCard } from "@/components/executive/DepartmentMandateCard";
import { IASRosterCard } from "@/components/executive/IASRosterCard";
import { NJDGStatCard } from "@/components/judicial/NJDGStatCard";
import Image from "next/image";
import Link from "next/link";
import { Scale, MessageSquare, Database, PlusCircle, ArrowRight, ShieldCheck, Landmark, UserCheck, Layers, FileSpreadsheet, LayoutDashboard } from "lucide-react";
import { getMpladsData } from "@/lib/mplads-data";

export const dynamic = 'force-dynamic';

export default async function Home(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const initialFilters = searchParams || {};

  const [initialItems, { mandates, officers }, judicialStats] = await Promise.all([
    getUnifiedFeed(1, 20, initialFilters),
    getDepartmentMandatesAndOfficers(),
    getJudicialAggregates()
  ]);

  const { overview } = getMpladsData();

  const chartData = [
    { name: "Lok Sabha 2024", amount: 543 },
    { name: "High Courts", amount: 25 },
    { name: "Union Depts", amount: 91 },
    { name: "IAS Cadres", amount: 26 }
  ];

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

          <a
            href="#governance-dashboard"
            className="inline-flex items-center gap-2 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 font-narrow text-sm font-bold uppercase tracking-widest transition-all"
          >
            <LayoutDashboard className="w-4 h-4" /> View Oversight Dashboard
          </a>

          <Link
            href="/politicians"
            className="inline-flex items-center gap-2 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 font-narrow text-sm font-bold uppercase tracking-widest transition-all"
          >
            Track MPs <ArrowRight className="w-4 h-4" />
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

      {/* Main Integrated Governance Oversight Dashboard Section */}
      <section id="governance-dashboard" className="space-y-12 scroll-mt-20">
        <div className="border-b-2 border-primary pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-0.5">
              Live Governance Oversight Center
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-tight text-primary mt-2">
              Governance Oversight Dashboard
            </h2>
            <p className="text-muted-foreground text-sm max-w-3xl mt-1">
              Real-time multi-branch feeds across Executive Mandates, Senior IAS Civil Servants, Judicial Backlog Metrics, and Public Feed Activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transparency"
              className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-4 py-2 hover:bg-transparent hover:text-primary transition-all whitespace-nowrap"
            >
              Tathya &rarr;
            </Link>
          </div>
        </div>

        {/* Executive Mandates & IAS Civil Servants Cards */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black font-serif uppercase tracking-tight border-b border-primary/40 pb-2">
            Executive Pillar — Mandates & Senior IAS Roster
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DepartmentMandateCard mandates={mandates} />
            <IASRosterCard officers={officers} />
          </div>
        </div>

        {/* Judicial Backlog Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black font-serif uppercase tracking-tight border-b border-primary/40 pb-2">
            Judicial Pillar — NJDG Court Pendency & Backlog
          </h3>
          <NJDGStatCard stats={judicialStats} />
        </div>

        {/* Unified Activity Feed & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <div>
            <h3 className="text-2xl font-black font-serif uppercase tracking-tight mb-4">Unified Governance Activity Feed</h3>
            <UnifiedFeed initialItems={initialItems} initialFilters={initialFilters} />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-black font-serif uppercase tracking-tight mb-4">Branch Data Coverage Index</h3>
            <DashboardCharts data={chartData} />
            
            <div className="border border-primary bg-card p-6 space-y-4">
              <h4 className="font-serif font-bold text-lg uppercase text-primary">Parliamentary & Electoral Data Sourcing</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aggregating election disclosures from <strong>MyNeta / ADR</strong> (assets, liabilities, criminal cases), legislative metrics from <strong>PRS Legislative Research</strong>, and public works spending under <strong>MPLADS / e-SAKSHI</strong>.
              </p>
              <Link
                href="/politicians"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                View Politician Profiles &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Pillars Interactive Gateways */}
      <section className="space-y-6 pt-6">
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
              <h3 className="font-serif text-2xl font-bold uppercase">Drishti</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Articles on proper governance, David Hume's 1742 principles of political legitimacy, Chanakya Neeti, and performing your <em>Swadharma</em> quietly without partisan noise.
              </p>
            </div>
            <Link
              href="/vision"
              className="mt-6 inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-4 py-2.5 hover:bg-transparent hover:text-primary transition-all w-fit"
            >
              Read Drishti & Essays <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="border-2 border-primary bg-card p-8 flex flex-col justify-between hover:bg-secondary/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 2</span>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase">Charcha</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Thoughtful editorial forums and citizen concern portal equipped with AI semantic de-duplication to consolidate public willpower.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href="/forums"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                Charcha
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
              <h3 className="font-serif text-2xl font-bold uppercase">Tathya</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Multi-branch scraped ledgers auditing ₹11,538+ Cr in MPLADS funds, candidate affidavits, PRS attendance, IAS rosters, and NJDG court backlogs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href="/transparency"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-primary text-primary-foreground px-3 py-2 hover:bg-transparent hover:text-primary transition-all"
              >
                Tathya
              </Link>
              <Link
                href="/politicians"
                className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-widest border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-3 py-2 transition-all"
              >
                Politicians
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
