import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useBids } from '@/hooks/useBids';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

const DISTANCE_THRESHOLD = 0.25;
const VELOCITY_THRESHOLD = 0.5;

const SwipeToBid: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useOpenJobs } = useJobs();
  const { useCreateBid } = useBids();
  
  const { data: jobs = [], isLoading } = useOpenJobs();
  const createBidMutation = useCreateBid();
  
  const [i, setI] = useState(0);
  const swipeRef = useRef<HTMLDivElement>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const placeBid = (jobId: string, jobTitle: string | undefined) => {
    // Default values for the bid
    const bidData = {
      job_id: jobId,
      provider_id: user?.id || '',
      amount: 0,
      estimated_hours: 1,
      description: 'I am interested in this job.',
      status: 'pending'
    };

    // Place the bid
    createBidMutation.mutate(bidData, {
      onSuccess: () => {
        toast({
          title: 'Bid placed!',
          description: `You've placed a bid on ${jobTitle || 'this job'}.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to place bid',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };

  const handleLike = (jobId: string, jobTitle: string | undefined) => {
    placeBid(jobId, jobTitle);
  };

  const handleDislike = () => {
    // Handle dislike logic here
  };

  const swipeHandlers = useSwipeable({
    onDragStart: () => setIsSwiping(true),
    onDragEnd: ({ movement: [mx], direction: [xDir], velocity }) => {
      setIsSwiping(false);
      const dir = xDir < 0 ? -1 : 1;
      const trigger =
        Math.abs(mx) > swipeRef?.current?.clientWidth * DISTANCE_THRESHOLD ||
        velocity > VELOCITY_THRESHOLD;

      if (trigger) {
        swipeRef.current?.classList.add('swiping');
        swipeRef.current?.classList.add(dir === 1 ? 'swiped-right' : 'swiped-left');

        setTimeout(() => {
          swipeRef.current?.classList.remove('swiping');
          swipeRef.current?.classList.remove('swiped-right');
          swipeRef.current?.classList.remove('swiped-left');

          if (dir === 1) {
            // User swiped right -> place a bid
            handleLike(jobs[i].id, jobs[i].title);
          } else {
            // User swiped left -> dislike
            handleDislike();
          }

          setI((i) => Math.min(jobs.length - 1, Math.max(0, i + 1)));
        }, 300);
      } else {
        swipeRef.current?.classList.add('resetting');
        setTimeout(() => swipeRef.current?.classList.remove('resetting'), 300);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No available jobs to swipe. Check back later!</p>
      </div>
    );
  }

  const job = jobs[i];

  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-md">
        <Card
          {...swipeHandlers}
          ref={swipeRef}
          className={`transition-transform duration-300 relative`}
        >
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>
              {job.category?.name} - {job.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="font-semibold">
                  ${job.budget_min} - ${job.budget_max}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="secondary">{job.status}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{job.description}</p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={handleDislike}>
            <XCircle className="mr-2 h-4 w-4" />
            Dislike
          </Button>
          <Button className="bg-donezo-blue hover:bg-donezo-blue/90" onClick={() => handleLike(job.id, job.title)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Like
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwipeToBid;
