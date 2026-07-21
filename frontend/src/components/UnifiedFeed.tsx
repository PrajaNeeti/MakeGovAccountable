"use client";

import React, { useState, useEffect } from 'react';
import { getUnifiedFeed } from '../app/actions/feed';

export function UnifiedFeed({ initialItems, initialFilters }: { initialItems: any[], initialFilters: any }) {
  const [items, setItems] = useState(initialItems);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Basic IntersectionObserver for infinite scroll simulation
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        setLoading(true);
        getUnifiedFeed(filters).then(newItems => {
          setItems(prev => [...prev, ...newItems.map(item => ({...item, id: Math.random().toString()}))]);
          setLoading(false);
        });
      }
    });

    const target = document.querySelector('#feed-bottom');
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [filters, loading]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, department: e.target.value };
    setFilters(newFilters);
    // Fetch new initial items for new filters
    getUnifiedFeed(newFilters).then(setItems);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-4 p-4 border rounded-lg bg-card">
        <select onChange={handleFilterChange} className="border p-2 rounded-md">
          <option value="">All Departments</option>
          <option value="Executive">Executive</option>
          <option value="Legislative">Legislative</option>
        </select>
        {/* Additional filters like branch, politician can be added here */}
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">Department: {item.department}</p>
          </div>
        ))}
      </div>

      <div id="feed-bottom" className="h-10 flex items-center justify-center">
        {loading && <p>Loading more...</p>}
      </div>
    </div>
  );
}
