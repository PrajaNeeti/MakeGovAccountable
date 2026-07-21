'use client';

import { useTransition } from 'react';
import { approveGroup, rejectGroup } from '../actions/moderationActions';
import { Button } from '@/components/ui/button';

export function GroupActionButtons({ groupId }: { groupId: string }) {
  const [isPendingApprove, startApprove] = useTransition();
  const [isPendingReject, startReject] = useTransition();

  const handleApprove = () => {
    startApprove(async () => {
      await approveGroup(groupId);
    });
  };

  const handleReject = () => {
    startReject(async () => {
      await rejectGroup(groupId);
    });
  };

  return (
    <div className="flex gap-4">
      <Button 
        variant="outline" 
        onClick={handleReject} 
        disabled={isPendingApprove || isPendingReject}
        className="bg-[oklch(0.577_0.245_27.325)] hover:bg-red-700 text-white border-transparent"
      >
        {isPendingReject ? 'Rejecting...' : 'Reject'}
      </Button>
      <Button 
        onClick={handleApprove} 
        disabled={isPendingApprove || isPendingReject}
        className="bg-[oklch(0.205_0_0)] hover:bg-black text-white"
      >
        {isPendingApprove ? 'Approving...' : 'Approve (Merge)'}
      </Button>
    </div>
  );
}
