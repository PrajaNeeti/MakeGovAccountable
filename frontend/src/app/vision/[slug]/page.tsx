import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Scale, Scroll, Compass, BookOpen, Share2 } from 'lucide-react';

interface EssayData {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  author: string;
  icon: any;
  quote?: string;
  content: string[];
}

const essays: Record<string, EssayData> = {
  'principles-of-governance': {
    slug: 'principles-of-governance',
    title: 'What Proper Governance Means: Quiet Accountability Over Political Noise',
    subtitle: 'Moving beyond partisan blame games to build a transparent, verifiable record of public administration.',
    category: 'Essay I • Principles of Governance',
    author: 'PrajaNeeti Editorial',
    icon: Scale,
    quote: 'Accountability does not have to mean constantly getting in the way. It can simply mean keeping an honest, public record that anyone can verify.',
    content: [
      'The pattern we see every day in modern public life is simple and predictable. Citizens ask for change because they genuinely want better roads, functional hospitals, clean drinking water, and honest public institutions.',
      'Before long, however, the conversation stops being about the actual problem and starts being about politics. The opposition turns the issue into a political weapon against the government. The government defends itself or deflects. Everyone argues over who should get blamed or who should get credit, and the original issue slowly fades into the background.',
      'Governments must be allowed to govern. At the same time, they should be answerable for what they promised and what they actually delivered. True accountability is not micromanagement—it is transparency that helps public servants do their duty better.',
      'PrajaNeeti exists to provide that quiet, unspinable record. Not to campaign for a political party, and not to attack one either, but to ensure that the facts are preserved for every citizen to inspect and draw their own conclusions.'
    ]
  },
  'david-hume-first-principles': {
    slug: 'david-hume-first-principles',
    title: 'David Hume: Of the First Principles of Government (1742)',
    subtitle: 'Why political authority rests entirely on public opinion, and how open data preserves democratic legitimacy.',
    category: 'Essay II • Philosophical Foundations',
    author: 'David Hume (1742) / PrajaNeeti Analysis',
    icon: Scroll,
    quote: "As FORCE is always on the side of the governed, the governors have nothing to support them but opinion. 'Tis therefore on opinion only that government is founded.",
    content: [
      'In 1742, Scottish Enlightenment philosopher David Hume published his landmark essay, "Of the First Principles of Government", posing a fundamental paradox of political power: why do the many allow themselves to be governed by the few?',
      'Hume observed that physical force ultimately resides in the hands of the public, not the rulers. Therefore, no government—whether a monarchy, republic, or democracy—can sustain itself purely by coercion. It relies entirely on the opinion and belief of the governed regarding the legitimacy, fairness, and utility of their institutions.',
      'Hume identified two primary drivers of public opinion: the Opinion of Interest (the belief that the state provides essential public goods like security and justice) and the Opinion of Right (the belief in the government’s rightful authority).',
      'When public opinion is manipulated through partisan spin, manufactured outrage, or secrecy, governance breaks down. But when public opinion is grounded in verifiable facts, open spending data, and unspinable ledgers, citizens can hold representatives accountable constructively.'
    ]
  },
  'swadharma-and-duty': {
    slug: 'swadharma-and-duty',
    title: 'Duty Without Noise: Doing Your Swadharma (Chanakya & The Gita)',
    subtitle: 'Applying ancient philosophical principles to modern open-source civic engineering.',
    category: 'Essay III • Philosophy & Action',
    author: 'Chanakya & The Bhagavad Gita',
    icon: Compass,
    quote: "It is better to perform your own duty (swadharma) imperfectly than to attempt another's duty well.",
    content: [
      'In the Chanakya Neeti, Chanakya famously observed that the strength of a state does not come from its ruler—it comes from the security, prosperity, and active participation of its citizens.',
      'Similarly, in the Bhagavad Gita, Krishna reminds Arjuna that every individual has a unique duty (swadharma) to fulfill. We do not need more political outrage or endless debate. Some citizens investigate, some organize, some write, and some build open-source datasets.',
      'PrajaNeeti is built on this exact principle: open-source civic engineering. It does not depend on a single founder, political group, or algorithm. It provides an open infrastructure where any developer, researcher, or citizen can contribute data and verify public records quietly and objectively.'
    ]
  }
};

export default async function DynamicEssayPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const essay = essays[params.slug];

  if (!essay) {
    notFound();
  }

  const IconComponent = essay.icon;

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-4xl py-12 space-y-10">
      {/* Back Link */}
      <Link 
        href="/vision" 
        className="inline-flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Drishti
      </Link>

      {/* Article Header */}
      <header className="border-b-2 border-primary pb-8 space-y-4">
        <div className="flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <IconComponent className="w-4 h-4 text-primary" /> {essay.category}
        </div>

        <h1 className="text-3xl md:text-5xl font-black font-serif text-primary leading-tight">
          {essay.title}
        </h1>

        <p className="font-sans text-lg text-muted-foreground leading-relaxed">
          {essay.subtitle}
        </p>

        <div className="flex items-center justify-between pt-4 font-narrow text-xs uppercase font-bold text-muted-foreground border-t border-primary/20">
          <span>By {essay.author}</span>
          <span>PrajaNeeti Public Ledger</span>
        </div>
      </header>

      {/* Featured Quote */}
      {essay.quote && (
        <blockquote className="border-l-4 border-primary pl-6 py-4 italic font-serif text-xl md:text-2xl bg-secondary/30 my-6 text-primary">
          "{essay.quote}"
        </blockquote>
      )}

      {/* Article Body */}
      <div className="space-y-6 font-sans text-base md:text-lg leading-relaxed text-foreground">
        {essay.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Footer Actions */}
      <footer className="border-t-2 border-primary pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link 
          href="/vision" 
          className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-5 py-2.5 font-narrow text-xs font-bold uppercase tracking-widest transition-all"
        >
          Read Other Essays
        </Link>

        <Link 
          href="/transparency" 
          className="inline-flex items-center gap-2 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground px-5 py-2.5 font-narrow text-xs font-bold uppercase tracking-widest transition-all"
        >
            Explore Tathya →
        </Link>
      </footer>
    </div>
  );
}
