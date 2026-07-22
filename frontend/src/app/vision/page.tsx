import Link from 'next/link';
import { BookOpen, Compass, ShieldCheck, Flag, Scale, CheckCircle, Scroll, ArrowRight } from 'lucide-react';

export default function VisionPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 max-w-5xl py-12 space-y-16">
      {/* Masthead Header */}
      <header className="border-b-2 border-t-2 border-primary py-12 text-center bg-card">
        <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary pb-1">
          Pillar 1 • Governance Essays & Philosophy
        </span>
        <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight text-primary mt-4">
          Philosophy & Vision
        </h1>
        <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto mt-4">
          What proper governance means, historical principles of political legitimacy, and why PrajaNeeti exists to quiet the noise and keep an honest public record.
        </p>
      </header>

      {/* Article 1: The Thought Behind Proper Governance */}
      <article className="border-2 border-primary bg-card p-8 md:p-12 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-3">
            <Scale className="w-4 h-4 text-primary" /> Essay I • Principles of Governance
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary leading-tight">
            What Proper Governance Means: Quiet Accountability Over Political Noise
          </h2>

          <p className="font-sans text-base md:text-lg leading-relaxed text-muted-foreground">
            The pattern we see every day is simple. Citizens ask for change, but before long, the conversation stops being about the problem and starts being about politics. True accountability is not micromanagement—it is transparency that helps public servants do their duty better.
          </p>

          <blockquote className="border-l-4 border-primary pl-6 py-2 italic font-serif text-lg bg-secondary/30 my-4">
            "Accountability does not have to mean constantly getting in the way. It can simply mean keeping an honest, public record that anyone can verify."
          </blockquote>
        </div>

        <Link
          href="/vision/principles-of-governance"
          className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-6 py-3 font-narrow text-xs font-bold uppercase tracking-widest transition-all w-fit mt-4"
        >
          Read Full Essay <ArrowRight className="w-4 h-4" />
        </Link>
      </article>

      {/* Article 2: David Hume - Of the First Principles of Government */}
      <article className="border-2 border-primary bg-card p-8 md:p-12 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-3">
            <Scroll className="w-4 h-4 text-primary" /> Essay II • Philosophical Foundation (David Hume, 1742)
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary leading-tight">
            On the First Principles of Government
          </h2>

          <p className="font-sans text-base md:text-lg leading-relaxed text-muted-foreground">
            David Hume observed that physical force ultimately resides with the public. Therefore, no authority can govern purely by coercion; it relies entirely on the opinion and belief of the governed regarding the legitimacy and utility of their institutions.
          </p>

          <blockquote className="border-l-4 border-primary pl-6 py-2 italic font-serif text-lg bg-secondary/30 my-4">
            "As FORCE is always on the side of the governed, the governors have nothing to support them but opinion. 'Tis therefore on opinion only that government is founded."
          </blockquote>
        </div>

        <Link
          href="/vision/david-hume-first-principles"
          className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-6 py-3 font-narrow text-xs font-bold uppercase tracking-widest transition-all w-fit mt-4"
        >
          Read Full Essay <ArrowRight className="w-4 h-4" />
        </Link>
      </article>

      {/* Article 3: Ancient Wisdom & Modern Duty */}
      <article className="border-2 border-primary bg-card p-8 md:p-12 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-3">
            <Compass className="w-4 h-4 text-primary" /> Essay III • Institutional Duty (Chanakya & The Gita)
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary leading-tight">
            Duty Without Noise: Doing Your Swadharma
          </h2>

          <p className="font-sans text-base md:text-lg leading-relaxed text-muted-foreground">
            Applying Chanakya Neeti and the Bhagavad Gita principle of Swadharma to modern open-source civic engineering. Rather than engaging in political outrage, citizens and developers perform their duty by building and maintaining open public ledgers.
          </p>

          <blockquote className="border-l-4 border-primary pl-6 py-2 italic font-serif text-lg bg-secondary/30 my-4">
            "It is better to perform your own duty (swadharma) imperfectly than to attempt another's duty well."
          </blockquote>
        </div>

        <Link
          href="/vision/swadharma-and-duty"
          className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-6 py-3 font-narrow text-xs font-bold uppercase tracking-widest transition-all w-fit mt-4"
        >
          Read Full Essay <ArrowRight className="w-4 h-4" />
        </Link>
      </article>

      {/* Explore the 3 Pillars Footer Callout */}
      <section className="border-2 border-primary bg-secondary/40 p-8 text-center space-y-6">
        <h3 className="font-serif text-2xl md:text-3xl font-bold uppercase">Explore the 3 Pillars of PrajaNeeti</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          <div className="border border-primary bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 1</span>
              <h4 className="font-serif text-xl font-bold mt-1">Philosophy & Vision</h4>
              <p className="font-sans text-xs text-muted-foreground mt-2">David Hume, Chanakya & principles of governance.</p>
            </div>
            <Link href="/vision" className="mt-4 font-narrow text-xs font-bold uppercase text-primary underline">You Are Here</Link>
          </div>

          <div className="border border-primary bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 2</span>
              <h4 className="font-serif text-xl font-bold mt-1">Discourse & Concerns</h4>
              <p className="font-sans text-xs text-muted-foreground mt-2">Public forums & civic concern portal.</p>
            </div>
            <Link href="/forums" className="mt-4 font-narrow text-xs font-bold uppercase text-primary underline">Join Discourse →</Link>
          </div>

          <div className="border border-primary bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-narrow text-xs font-bold uppercase text-muted-foreground">Pillar 3</span>
              <h4 className="font-serif text-xl font-bold mt-1">Data & Accountability</h4>
              <p className="font-sans text-xs text-muted-foreground mt-2">MPLADS ledgers, official records & MP directory.</p>
            </div>
            <Link href="/transparency" className="mt-4 font-narrow text-xs font-bold uppercase text-primary underline">Explore Data →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
