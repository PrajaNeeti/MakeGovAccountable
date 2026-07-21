"use client";

import React, { useState, useEffect } from 'react';
import { getUnifiedFeed } from '../app/actions/feed';
import { useRouter } from 'next/navigation';
import { startDiscussion } from '../app/actions/forumActions';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function UnifiedFeed({ initialItems, initialFilters }: { initialItems: any[], initialFilters: any }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);

  useEffect(() => {
    // Basic IntersectionObserver for infinite scroll simulation
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        setLoading(true);
        getUnifiedFeed(page, 20, filters).then(newItems => {
          setItems(prev => [...prev, ...newItems.map(item => ({...item, id: Math.random().toString()}))]);
          setPage(p => p + 1);
          setLoading(false);
        });
      }
    });

    const target = document.querySelector('#feed-bottom');
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [filters, loading, page]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, department: e.target.value };
    setFilters(newFilters);
    setPage(2);
    // Fetch new initial items for new filters
    getUnifiedFeed(1, 20, newFilters).then(setItems);
  };

  const handleStartDiscussion = async (itemId: string) => {
    const res = await startDiscussion(itemId);
    if (res.success && res.discussionId) {
      router.push('/forums/' + res.discussionId);
    } else {
      alert(res.error || 'Failed to start discussion.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex gap-4 p-4 border-b border-t border-primary bg-background">
        <select onChange={handleFilterChange} className="border border-primary p-2 font-narrow uppercase text-xs font-bold bg-transparent outline-none cursor-pointer">
          <option value="">All Departments</option>
          <option value="Executive">Executive</option>
          <option value="Legislative">Legislative</option>
        </select>
        {/* Additional filters like branch, politician can be added here */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-t border-l border-primary">
        {items.map((item, i) => (
          <article 
            key={i} 
            className={`p-6 border-r border-b border-primary flex flex-col items-start gap-4 hover:bg-primary/5 transition-colors ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
          >
            <div className="flex flex-col gap-2 w-full">
              <span className="font-narrow text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary block"></span>
                {item.department || "General"}
              </span>
              <h3 className={`font-serif font-bold leading-tight ${i === 0 ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
                {item.title}
              </h3>
              <p className="text-sm font-bold text-muted-foreground mt-1 uppercase font-narrow tracking-wider">
                BY PUBLIC RECORD • 2 HOURS AGO
              </p>
            </div>
            
            <p className="font-sans text-muted-foreground mt-2 line-clamp-3 text-base">
              Detailed tracking information and updates regarding this specific {item.department || "government"} activity. 
              The latest developments indicate ongoing reviews and procedural actions that require public oversight and awareness.
            </p>
            
            <div className="mt-auto pt-6 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-narrow uppercase tracking-widest text-xs font-bold transition-colors flex gap-2 items-center"
                onClick={() => handleStartDiscussion(item.id)}
              >
                Discuss <ArrowRight size={14} />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div id="feed-bottom" className="h-20 flex items-center justify-center font-narrow uppercase font-bold text-sm tracking-widest border-t border-b border-primary py-4">
        {loading ? <span>Loading more...</span> : <span>End of feed</span>}
      </div>
    </div>
  );
}
