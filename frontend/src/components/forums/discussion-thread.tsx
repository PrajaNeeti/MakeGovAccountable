"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { reportPost } from "@/app/actions/forumActions";

type Post = {
  id: string;
  content: string;
  pseudonym?: string;
  created_at: string;
  users?: { pseudonym?: string };
};

export function DiscussionThread({ posts }: { posts: Post[] }) {
  const handleReport = async (postId: string) => {
    const reason = window.prompt("Report User: Are you sure you want to flag this user's conduct?");
    if (reason) {
      const res = await reportPost(postId, reason);
      if (res.success) {
        alert("Report submitted successfully.");
      } else {
        alert(res.error || "Failed to submit report.");
      }
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 border-t border-b border-primary text-center">
        <h3 className="text-3xl font-serif font-black mb-4">No Letters Yet</h3>
        <p className="text-muted-foreground font-sans text-lg">Be the first to submit a letter for this discussion.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 border-t-2 border-b-2 border-primary">
      {posts.map((post, index) => {
        const displayPseudonym = post.pseudonym || (post.users?.pseudonym) || "Anonymous Citizen";
        return (
          <article key={post.id} className={`p-8 bg-background flex flex-col gap-6 ${index !== posts.length - 1 ? 'border-b border-primary/20' : ''}`}>
            <div className="flex justify-between items-end mb-2 border-b border-primary pb-4">
              <div className="flex flex-col">
                <span className="font-black font-serif text-xl">{displayPseudonym}</span>
                <span className="font-narrow text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleReport(post.id)}
                className="text-primary hover:bg-primary hover:text-primary-foreground font-narrow uppercase tracking-widest text-xs font-bold rounded-none border border-transparent hover:border-primary transition-colors"
              >
                Flag
              </Button>
            </div>
            <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap">
              {post.content}
            </div>
          </article>
        );
      })}
    </div>
  );
}
