import { getPoliticianDetails } from "../../actions/politicians";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AffidavitCard } from "@/components/politicians/AffidavitCard";
import { LegislativeStatsCard } from "@/components/politicians/LegislativeStatsCard";
import { CareerTimelineCard } from "@/components/politicians/CareerTimelineCard";
import { CaseAllegationsCard } from "@/components/politicians/CaseAllegationsCard";
import { TrackedPromisesCard } from "@/components/politicians/TrackedPromisesCard";
import StartDiscussionButton from "@/components/forums/StartDiscussionButton";
import Link from "next/link";
import { ExternalLink, Landmark, Award, ShieldAlert, Target } from "lucide-react";

export default async function PoliticianProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { politician, roles, statements, affidavit, legislativeStats } = await getPoliticianDetails(params.id);

  if (!politician) {
    return notFound();
  }

  const timeline = politician.career_timeline || [];
  const allegations = politician.case_allegations || [];
  const promises = politician.promises || [];

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-16 pt-8 space-y-8">
      <Link href="/politicians" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary mb-2 inline-block">
        &larr; Back to Politician Directory
      </Link>
      
      {/* Header Banner */}
      <div className="border-b-2 border-primary pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-narrow text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded">
              {politician.house || 'Lok Sabha'}
            </span>
            <span className="font-narrow text-xs font-bold uppercase tracking-widest bg-secondary text-secondary-foreground border border-primary/20 px-2.5 py-1 rounded">
              {politician.party || 'Independent'}
            </span>
            <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {politician.constituency ? `${politician.constituency}, ` : ''}{politician.state}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-primary uppercase">
            {politician.first_name} {politician.last_name}
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {politician.bio}
          </p>

          {politician.prs_source_url && (
            <div className="pt-1">
              <a
                href={politician.prs_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider"
              >
                <Landmark className="w-3.5 h-3.5" /> View Official PRS India Legislative Record <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <StartDiscussionButton entityId={politician.id} entityType="politician" entityName={`${politician.first_name} ${politician.last_name}`} />
        </div>
      </div>

      {/* Tracked Promises Section */}
      {promises.length > 0 && <TrackedPromisesCard promises={promises} />}

      {/* Legal Disclosures & Allegations Section */}
      <CaseAllegationsCard allegations={allegations} />

      {/* Career Timeline Section */}
      {timeline.length > 0 && <CareerTimelineCard timeline={timeline} />}

      {/* Affidavit Disclosures Card */}
      {affidavit && <AffidavitCard affidavit={affidavit} />}

      {/* Legislative Track Record Card */}
      {legislativeStats && <LegislativeStatsCard stats={legislativeStats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black font-serif uppercase tracking-tight mb-6">Public Statements & Declarations</h2>
          {statements.length === 0 ? (
            <p className="text-muted-foreground italic">No public statements recorded yet for this representative.</p>
          ) : (
            <div className="space-y-6">
              {statements.map((stmt: any) => (
                <Card key={stmt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          {new Date(stmt.date_made).toLocaleDateString()} &mdash; {stmt.context}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="border-l-4 border-primary pl-4 font-serif text-xl italic mb-4">
                      "{stmt.statement_text}"
                    </blockquote>
                    {stmt.source_url && (
                      <a href={stmt.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline uppercase tracking-wider">
                        Source Link
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <h2 className="text-2xl font-black font-serif uppercase tracking-tight mb-6 border-b border-primary pb-2">Roles & Appointments</h2>
          {roles.length === 0 ? (
            <p className="text-muted-foreground italic font-sans text-sm">No official executive or parliamentary committee roles recorded.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {roles.map((role: any) => (
                <div key={role.id} className="p-4 rounded border border-border bg-background">
                  <p className="font-serif text-xl font-bold">{role.title}</p>
                  <p className="font-narrow text-sm text-muted-foreground uppercase tracking-wider">
                    {role.departments?.name || role.courts?.name || 'Parliament of India'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Since {new Date(role.valid_from).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
