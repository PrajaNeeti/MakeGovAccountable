import { getPoliticians } from "../actions/politicians";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function PoliticiansPage() {
  const politicians = await getPoliticians();

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-16 pt-8">
      <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-primary uppercase mb-8">
        Politician Directory
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Browse the public records, roles, and statements of elected officials and public servants.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {politicians.map((pol: any) => (
          <Link key={pol.id} href={`/politicians/${pol.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  {pol.first_name} {pol.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{pol.bio}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
