import { getPoliticianDetails } from "../../actions/politicians";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AffidavitCard } from "@/components/politicians/AffidavitCard";
import { LegislativeStatsCard } from "@/components/politicians/LegislativeStatsCard";
import Link from "next/link";

export default async function PoliticianProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { politician, roles, statements, affidavit, legislativeStats } = await getPoliticianDetails(params.id);

  if (!politician) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-16 pt-8 space-y-8">
      <Link href="/politicians" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary mb-2 inline-block">
        &larr; Back to Politician Directory
      </Link>
      
      <div className="border-b-2 border-primary pb-6">
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-primary uppercase mb-3">
          {politician.first_name} {politician.last_name}
        </h1>
        <p className="text-xl text-muted-foreground">{politician.bio}</p>
      </div>

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
            <p className="text-muted-foreground italic">No official roles recorded.</p>
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
