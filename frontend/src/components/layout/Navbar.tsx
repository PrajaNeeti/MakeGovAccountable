"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, PlusCircle, Scale, MessageSquare, Database } from "lucide-react";
import { OmnibarSearch } from "@/components/OmnibarSearch";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHeaderVisible = isScrolled || isOpen;

  return (
    <header 
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b-2 border-primary bg-background/95 backdrop-blur-md shadow-md ${
        isHeaderVisible 
          ? "translate-y-0 opacity-100 pointer-events-auto" 
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-7xl mx-auto">
        {/* Brand Logo & 3 Main Pillars */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg font-serif uppercase tracking-widest text-primary border-b-2 border-primary pb-0.5">
            PRAJA NEETI.
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/vision" 
              className="text-xs font-narrow uppercase font-bold tracking-widest text-foreground hover:text-muted-foreground transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              1. Vision
            </Link>

            <Link 
              href="/forums" 
              className="text-xs font-narrow uppercase font-bold tracking-widest text-foreground hover:text-muted-foreground transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              2. Concerns
            </Link>

            <Link 
              href="/transparency" 
              className="text-xs font-narrow uppercase font-bold tracking-widest text-foreground hover:text-muted-foreground transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-primary" />
              3. Data
            </Link>

            <Link 
              href="/milestones" 
              className="text-xs font-narrow uppercase font-bold tracking-widest text-foreground hover:text-muted-foreground transition-colors flex items-center gap-1.5 border-l border-primary/30 pl-4"
            >
              Milestones
            </Link>
          </nav>
        </div>
        
        {/* Search Omnibar & Raise Concern Action CTA */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-48 lg:w-64">
            <OmnibarSearch />
          </div>

          <Link
            href="/submit"
            className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-4 py-2 font-narrow text-xs font-bold uppercase tracking-widest transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Raise Concern
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t-2 border-primary p-4 flex flex-col gap-4 bg-background">
          <Link href="/vision" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Scale className="w-4 h-4 text-primary" /> 1. Philosophy & Vision
          </Link>
          <div className="w-full h-px bg-primary/20"></div>
          
          <Link href="/forums" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <MessageSquare className="w-4 h-4 text-primary" /> 2. Discourse & Concerns
          </Link>
          <div className="w-full h-px bg-primary/20"></div>

          <Link href="/transparency" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Database className="w-4 h-4 text-primary" /> 3. Data & Accountability
          </Link>
          <div className="w-full h-px bg-primary/20"></div>

          <Link href="/milestones" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground flex items-center gap-2" onClick={() => setIsOpen(false)}>
            Milestones Ledger
          </Link>
          <div className="w-full h-px bg-primary/20"></div>

          <Link 
            href="/submit" 
            className="inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary text-primary-foreground px-4 py-2.5 font-narrow text-xs font-bold uppercase tracking-widest"
            onClick={() => setIsOpen(false)}
          >
            <PlusCircle className="w-4 h-4" /> Raise a Concern
          </Link>

          <div className="mt-2">
            <OmnibarSearch />
          </div>
        </div>
      )}
    </header>
  );
}
