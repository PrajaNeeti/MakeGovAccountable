'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { startEntityDiscussion } from '@/app/actions/forumActions';

export default function StartDiscussionButton({ entityId, entityType, entityName }: { entityId?: string; entityType?: string; entityName?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const targetId = entityId || `general-${Date.now()}`;
    const targetType = entityType || 'general';
    const title = entityName ? `Civic Discussion: ${entityName}` : 'General Civic Discussion';

    const res = await startEntityDiscussion(targetId, targetType, title);
    setLoading(false);
    if (res.success && res.discussionId) {
      router.push(`/forums/${res.discussionId}`);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="inline-flex items-center gap-2 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary px-5 py-2.5 font-narrow text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
    >
      <MessageSquare className="w-4 h-4" />
      {loading ? 'Opening Thread...' : entityName ? `💬 Discuss ${entityName}` : '+ Start a Civic Discussion'}
    </button>
  );
}
