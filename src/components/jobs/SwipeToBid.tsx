
import React, { useState, useRef } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useJobs } from '@/hooks/useJobs';
import { useBids } from '@/hooks/useBids';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Container } from '@/components/ui/container';

// Prepare the cards data
const to = (i: number) => ({
  x: 0,
  y: i * -10,
  scale: 1,
  rot: 0,
  delay: i * 100,
});

// When a card is gone, it flys out
const from = (_i: number) => ({ 
  x: 0, 
  rot: 0, 
  scale: 1.5, 
  y: -1000 
});

// Interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `rotateX(5deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const SwipeToBid: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useOpenJobs } = useJobs();
  const { useCreateBid } = useBids();
  
  const { data: jobs = [], isLoading } = useOpenJobs();
  const { mutate: createBid } = useCreateBid();
  
  const [activeJobIndex, setActiveJobIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<Record<string, number>>({});
  const [estimatedHours, setEstimatedHours] = useState<Record<string, number>>({});
  const [gone] = useState<Set<number>>(new Set());
  const [currentJob, setCurrentJob] = useState(jobs[0]);

  // Create a ref for accessing our data in gesture callbacks
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  // Create springs for each job card
  const [props, api] = useSprings(jobs.length, i => ({
    ...to(i),
    from: from(i),
  }));

  // Create drag gesture for the jobs
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    // Direction should either be -1 or 1 depending on swipe direction
    const dir = xDir < 0 ? -1 : 1;
    
    // If the gesture is active and the card is being dragged far enough
    if (active && Math.abs(mx) > 50) {
      gone.add(index);
    }
    
    api.start(i => {
      // Skip rendering the card if it's already gone
      if (index !== i) return;
      
      const isGone = gone.has(index);
      
      // When a card is gone, fly it out
      const x = isGone ? (200 + window.innerWidth) * dir : active ? mx : 0;
      const rot = mx / 100 + (isGone ? dir * 10 * vx : 0);
      const scale = active ? 1.1 : 1;
      
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: isGone ? 200 : active ? 800 : 500 },
      };
    });
    
    // If all cards are gone, reset
    if (!active && gone.size === jobs.length) {
      setTimeout(() => {
        gone.clear();
        api.start(i => to(i));
      }, 600);
    }
    
    // Handle bid decision based on direction
    if (!active && gone.has(index)) {
      const job = jobsRef.current[index];
      
      // Swipe right means place bid
      if (dir === 1) {
        handlePlaceBid(job);
      } 
      // Swipe left means skip
      else {
        toast({
          title: 'Job skipped',
          description: 'You can always come back to it later',
        });
      }
      
      // Move to next job in the list if available
      if (index < jobsRef.current.length - 1) {
        setActiveJobIndex(index + 1);
        setCurrentJob(jobsRef.current[index + 1]);
      }
    }
  });

  // Handle placing a bid
  const handlePlaceBid = (job: any) => {
    // Check if we have an amount and hours for this job
    const amount = bidAmount[job.id] || (job.budget_min || 50);
    const hours = estimatedHours[job.id] || 2;
    
    if (!amount || !hours) {
      toast({
        title: 'Missing information',
        description: 'Please set an amount and estimated hours',
        variant: 'destructive',
      });
      return;
    }
    
    // Create the bid
    createBid({
      job_id: job.id,
      provider_id: user?.id,
      amount,
      estimated_hours: hours,
      status: 'pending',
      description: `I can complete this job in approximately ${hours} hours for $${amount}.`
    });
    
    toast({
      title: 'Bid placed successfully!',
      description: 'The customer will be notified of your bid.',
    });
  };

  // Update bid amount for a job
  const updateBidAmount = (jobId: string, value: number) => {
    setBidAmount(prev => ({
      ...prev,
      [jobId]: value
    }));
  };
  
  // Update estimated hours for a job
  const updateEstimatedHours = (jobId: string, hours: number) => {
    setEstimatedHours(prev => ({
      ...prev,
      [jobId]: hours
    }));
  };
  
  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
        </div>
      </Container>
    );
  }
  
  if (!jobs.length) {
    return (
      <Container className="py-8">
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No open jobs available</h3>
          <p className="text-gray-500">Check back soon for new jobs in your area.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Swipe Jobs to Bid
        </h2>
        
        <div className="relative h-[500px] w-full max-w-md">
          {props.map(({ x, y, rot, scale }, i) => (
            <animated.div 
              key={i} 
              className="absolute w-full"
              style={{ x, y }}
            >
              <animated.div
                {...bind(i)}
                style={{
                  transform: interpolate([rot, scale], trans),
                  touchAction: 'none',
                }}
                className="w-full cursor-grab"
              >
                <Card className="overflow-hidden shadow-lg border-2 border-gray-100 mb-2">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl mb-2">
                        {jobs[i].title}
                      </CardTitle>
                      <div className="flex space-x-2">
                        {jobs[i].is_emergency && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                        {jobs[i].is_fix_now && (
                          <Badge variant="default">Fix Now</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <div>Budget: ${jobs[i].budget_min} - ${jobs[i].budget_max}</div>
                      <div>{jobs[i].location}</div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <p className="text-gray-600 mb-4 line-clamp-4">
                      {jobs[i].description}
                    </p>
                    
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Your Bid Amount ($)
                        </label>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            type="button"
                            className="px-2"
                            onClick={() => updateBidAmount(
                              jobs[i].id, 
                              Math.max(20, (bidAmount[jobs[i].id] || jobs[i].budget_min || 50) - 5)
                            )}
                          >
                            -
                          </Button>
                          <div className="px-4 text-lg font-medium">
                            ${bidAmount[jobs[i].id] || jobs[i].budget_min || 50}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            type="button"
                            className="px-2"
                            onClick={() => updateBidAmount(
                              jobs[i].id, 
                              (bidAmount[jobs[i].id] || jobs[i].budget_min || 50) + 5
                            )}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Estimated Hours
                        </label>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            type="button"
                            className="px-2"
                            onClick={() => updateEstimatedHours(
                              jobs[i].id, 
                              Math.max(1, (estimatedHours[jobs[i].id] || 2) - 1)
                            )}
                          >
                            -
                          </Button>
                          <div className="px-4 text-lg font-medium">
                            {estimatedHours[jobs[i].id] || 2}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            type="button"
                            className="px-2"
                            onClick={() => updateEstimatedHours(
                              jobs[i].id, 
                              (estimatedHours[jobs[i].id] || 2) + 1
                            )}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-4">
                    <div className="w-full text-center text-sm text-gray-500">
                      Swipe left to skip or right to bid
                    </div>
                  </CardFooter>
                </Card>
              </animated.div>
            </animated.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8 space-x-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              if (activeJobIndex < jobs.length) {
                gone.add(activeJobIndex);
                api.start(i => {
                  if (i !== activeJobIndex) return;
                  return {
                    x: -200 - window.innerWidth,
                    rot: -10,
                    scale: 0.5,
                    delay: undefined,
                    config: { friction: 50, tension: 200 },
                  };
                });
                
                // Move to next card
                if (activeJobIndex < jobs.length - 1) {
                  setActiveJobIndex(activeJobIndex + 1);
                  setCurrentJob(jobs[activeJobIndex + 1]);
                }
              }
            }}
            className="min-w-[100px]"
          >
            Skip
          </Button>
          
          <Button 
            variant="default" 
            size="lg"
            onClick={() => {
              if (activeJobIndex < jobs.length) {
                const job = jobs[activeJobIndex];
                handlePlaceBid(job);
                
                gone.add(activeJobIndex);
                api.start(i => {
                  if (i !== activeJobIndex) return;
                  return {
                    x: 200 + window.innerWidth,
                    rot: 10,
                    scale: 0.5,
                    delay: undefined,
                    config: { friction: 50, tension: 200 },
                  };
                });
                
                // Move to next card
                if (activeJobIndex < jobs.length - 1) {
                  setActiveJobIndex(activeJobIndex + 1);
                  setCurrentJob(jobs[activeJobIndex + 1]);
                }
              }
            }}
            className="min-w-[100px]"
          >
            Bid
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default SwipeToBid;
