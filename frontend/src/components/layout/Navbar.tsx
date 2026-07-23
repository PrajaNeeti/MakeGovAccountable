"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, PlusCircle, Scale, MessageSquare, ArrowLeft, ChevronUp, ChevronDown, Award, Eye, Users, ShieldCheck } from "lucide-react";
import { OmnibarSearch } from "@/components/OmnibarSearch";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Determine visibility states
  // 1. Landing Page: Hidden at top (scrollY <= 50), visible pill when scrolled down
  // 2. Inner Pages: Visible expanded at top, collapses to left-aligned pill when scrolled down
  const shouldHideLanding = isLandingPage && !isScrolled && !isExpanded;
  const showCollapsedPill = isScrolled && !isExpanded;

  if (shouldHideLanding) {
    return null;
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 pointer-events-auto">
      {/* Left-Aligned Collapsed Compact Pill View */}
      {showCollapsedPill ? (
        <div className="fixed top-3 left-4 md:left-8 z-50">
          <div className="flex items-center gap-2.5 border-2 border-primary bg-background/95 backdrop-blur-md shadow-xl px-3.5 py-1.5 rounded-full transition-all duration-300">
            {/* Back Button (shown on non-landing pages) */}
            {!isLandingPage && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs font-narrow font-bold uppercase tracking-wider text-primary hover:text-muted-foreground transition-colors pr-2 border-r border-primary/30"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-primary" />
                <span>Back</span>
              </button>
            )}

            {/* Emblem Icon Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-1.5 font-bold font-serif text-sm uppercase text-primary hover:opacity-80 transition-opacity"
              title="PrajaNeeti Home"
            >
              <Scale className="w-4 h-4 text-primary" />
              <span className="font-serif font-black tracking-wider text-xs">PRAJA NEETI</span>
            </Link>

            {/* Expand Navigation Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-1 text-xs font-narrow font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 py-1 rounded-full transition-all ml-1"
              title="Expand Menu"
            >
              <Menu className="w-3 h-3" />
              <span className="text-[10px] hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      ) : (
        /* Full Streamlined Navbar */
        <div className="w-full border-b-2 border-primary bg-background/95 backdrop-blur-md shadow-md transition-all duration-300">
          <div className="flex items-center justify-between px-4 md:px-8 py-2.5 max-w-7xl mx-auto">
            {/* Left Section: Back Button + Brand Logo & Primary Nav Links */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Back Button (Inner Pages) */}
              {!isLandingPage && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs font-narrow font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border-r border-primary/30 pr-3"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              {/* Brand Logo */}
              <Link href="/" className="font-bold text-base font-serif uppercase tracking-widest text-primary border-b-2 border-primary pb-0.5 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-primary" />
                PRAJA NEETI.
              </Link>

              {/* Streamlined Desktop Navigation Links organized under 3 Pillars */}
              <nav className="hidden lg:flex items-center gap-6">
                {/* Pillar 1: Drishti */}
                <Link 
                  href="/vision" 
                  className={`text-xs font-narrow uppercase font-bold tracking-widest transition-colors ${
                    pathname?.startsWith('/vision') ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-muted-foreground'
                  }`}
                >
                  Drishti
                </Link>

                {/* Pillar 2: Charcha Dropdown */}
                <div className="relative group">
                  <Link 
                    href="/forums" 
                    className={`text-xs font-narrow uppercase font-bold tracking-widest transition-colors flex items-center gap-1 ${
                      pathname?.startsWith('/forums') || pathname === '/concerns' || pathname === '/submit' ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-muted-foreground'
                    }`}
                  >
                    Charcha <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Link>

                  <div className="absolute top-full left-0 hidden group-hover:flex w-52 border-2 border-primary bg-background shadow-xl rounded p-2 flex-col gap-1 z-50">
                    <Link 
                      href="/forums" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-primary" /> Discussion Forums
                    </Link>
                    <Link 
                      href="/concerns" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Pooled Concerns
                    </Link>
                    <Link 
                      href="/submit" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-primary" /> Raise a Concern
                    </Link>
                  </div>
                </div>

                {/* Pillar 3: Tathya Dropdown */}
                <div className="relative group">
                  <Link 
                    href="/transparency" 
                    className={`text-xs font-narrow uppercase font-bold tracking-widest transition-colors flex items-center gap-1 ${
                      pathname === '/transparency' || pathname?.startsWith('/politicians') || pathname === '/mplads' || pathname === '/milestones' ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-muted-foreground'
                    }`}
                  >
                    Tathya <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Link>

                  <div className="absolute top-full left-0 hidden group-hover:flex w-56 border-2 border-primary bg-background shadow-xl rounded p-2 flex-col gap-1 z-50">
                    <Link 
                      href="/transparency" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <Scale className="w-3.5 h-3.5 text-primary" /> Transparency Overview
                    </Link>
                    <Link 
                      href="/mplads" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <Award className="w-3.5 h-3.5 text-primary" /> MPLADS & MLALAD Funds
                    </Link>
                    <Link 
                      href="/politicians" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-primary" /> MP Affidavits Directory
                    </Link>
                    <Link 
                      href="/milestones" 
                      className="text-xs font-narrow uppercase font-bold tracking-wider text-foreground hover:bg-muted p-2 rounded flex items-center gap-2"
                    >
                      <Award className="w-3.5 h-3.5 text-primary" /> Data Milestones Ledger
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
            
            {/* Right Section: Compact Omnibar & Action CTA */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-40 xl:w-48">
                <OmnibarSearch />
              </div>

              <Link
                href="/submit"
                className="inline-flex items-center gap-1 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Raise Concern
              </Link>

              {/* Collapse Button (if scrolled down and expanded) */}
              {isScrolled && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-muted-foreground hover:text-primary border border-primary/30 rounded"
                  title="Collapse to Icon Bar"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              {isScrolled && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-muted-foreground hover:text-primary border border-primary/30 rounded"
                  title="Collapse"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                className="p-1.5 text-primary"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Toggle Menu"
              >
                {isExpanded ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Expanded Mobile Drawer */}
          {isExpanded && (
            <div className="lg:hidden border-t-2 border-primary p-4 flex flex-col gap-3 bg-background">
              {!isLandingPage && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-xs font-narrow font-bold uppercase tracking-widest text-primary pb-2 border-b border-primary/20"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Previous Page
                </button>
              )}

              {/* Pillar 1: Drishti */}
              <Link href="/vision" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                <Eye className="w-4 h-4 text-primary" /> Drishti (Vision & Governance)
              </Link>
              <div className="w-full h-px bg-primary/20"></div>

              {/* Pillar 2: Charcha */}
              <div className="flex flex-col gap-2">
                <Link href="/forums" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                  <MessageSquare className="w-4 h-4 text-primary" /> Charcha (Discourse)
                </Link>
                <div className="flex flex-col gap-1.5 pl-6">
                  <Link href="/concerns" className="text-xs font-narrow font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Pooled Concerns
                  </Link>
                  <Link href="/submit" className="text-xs font-narrow font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                    <PlusCircle className="w-3.5 h-3.5 text-primary" /> Raise a Concern
                  </Link>
                </div>
              </div>
              <div className="w-full h-px bg-primary/20"></div>

              {/* Pillar 3: Tathya */}
              <div className="flex flex-col gap-2">
                <Link href="/transparency" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                  <Scale className="w-4 h-4 text-primary" /> Tathya (Scraped Ledgers)
                </Link>
                <div className="flex flex-col gap-1.5 pl-6">
                  <Link href="/mplads" className="text-xs font-narrow font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                    <Award className="w-3.5 h-3.5 text-primary" /> MPLADS & State Funds
                  </Link>
                  <Link href="/politicians" className="text-xs font-narrow font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                    <Users className="w-3.5 h-3.5 text-primary" /> MP Affidavits Directory
                  </Link>
                  <Link href="/milestones" className="text-xs font-narrow font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2" onClick={() => setIsExpanded(false)}>
                    <Award className="w-3.5 h-3.5 text-primary" /> Data Milestones Ledger
                  </Link>
                </div>
              </div>
              <div className="w-full h-px bg-primary/20"></div>

              <Link 
                href="/submit" 
                className="inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary text-primary-foreground px-4 py-2.5 font-narrow text-xs font-bold uppercase tracking-widest"
                onClick={() => setIsExpanded(false)}
              >
                <PlusCircle className="w-4 h-4" /> Raise a Concern
              </Link>

              <div className="mt-2">
                <OmnibarSearch />
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
