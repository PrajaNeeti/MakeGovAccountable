import { getPoliticians } from "../actions/politicians";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Search, Scale, FileText, ArrowRight, UserCheck } from "lucide-react";
import PoliticianDirectoryClient from "@/components/politicians/PoliticianDirectoryClient";

export default async function PoliticiansPage() {
  const politicians = await getPoliticians();

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-16 pt-8 space-y-8">
      {/* Masthead Header */}
      <header className="border-b-2 border-t-2 border-primary py-8 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          Pillar 3 • Scraped Election Affidavits & PRS Track Record
        </span>
        <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-primary uppercase mt-3">
          Politician & Candidate Directory
        </h1>
        <p className="text-muted-foreground font-sans text-base max-w-3xl mx-auto mt-2">
          Verifiable records of 483+ Lok Sabha parliamentarians, declared net worth affidavits, criminal case disclosures, parliamentary attendance, and introduced questions.
        </p>
      </header>

      {/* Interactive Client Search & Filter Grid */}
      <PoliticianDirectoryClient politicians={politicians} />
    </div>
  );
}
