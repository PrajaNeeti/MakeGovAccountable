"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { OmnibarSearch } from "@/components/OmnibarSearch";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full border-b border-primary bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg font-serif uppercase tracking-widest text-primary">
            PRAJA NEETI.
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/forums" className="text-xs font-narrow uppercase font-bold tracking-widest hover:text-muted-foreground transition-colors">
              Letters & Discourse
            </Link>
            <Link href="/transparency" className="text-xs font-narrow uppercase font-bold tracking-widest hover:text-muted-foreground transition-colors">
              Data & Oversight
            </Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center gap-4 flex-1 justify-end max-w-sm">
          <OmnibarSearch />
        </div>

        <button 
          className="md:hidden p-2 text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-primary p-4 flex flex-col gap-4 bg-background">
          <Link href="/forums" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground" onClick={() => setIsOpen(false)}>
            Letters & Discourse
          </Link>
          <div className="w-full h-px bg-primary/20"></div>
          <Link href="/transparency" className="text-sm font-narrow font-bold uppercase tracking-widest hover:text-muted-foreground" onClick={() => setIsOpen(false)}>
            Data & Oversight
          </Link>
          <div className="w-full h-px bg-primary/20"></div>
          <div className="mt-2">
            <OmnibarSearch />
          </div>
        </div>
      )}
    </header>
  );
}
