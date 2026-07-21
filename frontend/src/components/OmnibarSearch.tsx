"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { globalSearch } from '../app/actions/search';
import Link from 'next/link';

export function OmnibarSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const res = await globalSearch(query);
          setResults(res || []);
        } catch (error) {
          console.error(error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      {query.trim() && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 p-2">
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : results.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {results.map((r, i) => (
                <li key={i}>
                  <Link href={r.url || '#'} className="block p-2 hover:bg-accent rounded-sm text-sm">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              We couldn't find any activities matching your search criteria. Try adjusting your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
