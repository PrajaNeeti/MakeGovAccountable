'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resolveReport, dismissFlag, deletePost } from '@/app/actions/moderateForum';

export function ForumReportsList({
  reports,
  flaggedPosts
}: {
  reports: { id: string; post_id: string; reason: string; forum_posts?: { content: string } }[];
  flaggedPosts: { id: string; content: string }[];
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete') => {
    setLoading(`report-${reportId}`);
    try {
      await resolveReport(reportId, action);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        alert(e.message || 'Action failed');
      } else {
        alert('Action failed');
      }
    }
    setLoading(null);
  };

  const handleDismissFlag = async (postId: string) => {
    setLoading(`flag-${postId}`);
    try {
      await dismissFlag(postId);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        alert(e.message || 'Action failed');
      } else {
        alert('Action failed');
      }
    }
    setLoading(null);
  };

  const handleDeletePost = async (postId: string) => {
    setLoading(`delete-${postId}`);
    try {
      await deletePost(postId);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        alert(e.message || 'Action failed');
      } else {
        alert('Action failed');
      }
    }
    setLoading(null);
  };

  return (
    <div className="space-y-12 mt-16 pt-12 border-t">
      <div>
        <h2 className="text-3xl font-serif font-bold mb-6">User Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No pending reports.</p>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Report on Post ID: {report.post_id?.substring(0, 8)}</CardTitle>
                  <CardDescription>Reason: {report.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold mb-2 text-gray-700">Reported Post Content:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.forum_posts?.content || 'Content unavailable'}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleResolveReport(report.id, 'dismiss')}
                    disabled={loading === `report-${report.id}`}
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleResolveReport(report.id, 'delete')}
                    disabled={loading === `report-${report.id}`}
                  >
                    Delete Post
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-serif font-bold mb-6">AI Flagged Posts</h2>
        {flaggedPosts.length === 0 ? (
          <p className="text-gray-500">No flagged posts.</p>
        ) : (
          <div className="grid gap-6">
            {flaggedPosts.map((post) => (
              <Card key={post.id} className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Flagged Post ID: {post.id?.substring(0, 8)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold mb-2 text-gray-700">Content:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDismissFlag(post.id)}
                    disabled={loading === `flag-${post.id}` || loading === `delete-${post.id}`}
                  >
                    Dismiss Flag
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={loading === `flag-${post.id}` || loading === `delete-${post.id}`}
                  >
                    Delete Post
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
