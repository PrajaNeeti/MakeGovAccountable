"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/app/actions/forumActions";
import { useRouter } from 'next/navigation';

export function CreatePostForm({ discussionId }: { discussionId: string }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) return;

    setIsSubmitting(true);
    const res = await createPost(discussionId, content);
    setIsSubmitting(false);

    if (res.success) {
      setContent('');
      router.refresh(); // Refresh page to see new post
    } else {
      setError(res.error || 'Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Textarea
        placeholder="Compose your letter..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        className="min-h-[150px] rounded-none border-2 border-primary p-4 font-serif text-lg leading-relaxed placeholder:font-sans placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary"
      />
      {error && <p className="text-destructive font-narrow uppercase text-sm font-bold">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !content.trim()} className="self-end rounded-none font-narrow uppercase tracking-widest font-bold px-8">
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT LETTER'}
      </Button>
    </form>
  );
}
