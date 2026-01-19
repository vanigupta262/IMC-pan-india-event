'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SubmissionHistory({ 
  submissions = [], 
  activeSubmissionId, 
  onSwap,
  isLoading = false 
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (submission) => {
    if (submission.isActive || submission.id === activeSubmissionId) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      stopped: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
    };

    return (
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        variants[status] || variants.pending
      )}>
        {status}
      </span>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2">
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No submissions yet</p>
            <p className="text-sm">Create your first submission to get started</p>
          </div>
        ) : (
          submissions.map((submission) => {
            const isActive = submission.isActive || submission.id === activeSubmissionId;
            
            return (
              <div
                key={submission.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(submission)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          Submission {submission.id.slice(0, 8)}
                        </p>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(submission.createdAt)}
                      </p>
                      {isActive && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          Currently Active
                        </p>
                      )}
                    </div>
                  </div>
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSwap(submission.id)}
                      disabled={isLoading}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
