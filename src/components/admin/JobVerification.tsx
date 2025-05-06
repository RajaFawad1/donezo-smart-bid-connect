
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/types';

interface JobWithFlags extends Job {
  is_verified: boolean;
  flags_count: number;
  customer: {
    user_metadata: {
      full_name: string;
    }
  };
}

const JobVerification: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<JobWithFlags | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const fetchJobs = async () => {
    // Get jobs that need verification (recently posted or flagged)
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        customer:customer_id (user_metadata),
        category:service_categories(*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // For each job, get the count of flags
    const jobsWithFlags = await Promise.all((data as any[]).map(async (job) => {
      const { count, error: flagError } = await supabase
        .from('job_flags')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', job.id);
        
      if (flagError) {
        console.error(`Error getting flag count for job ${job.id}:`, flagError);
        return { ...job, flags_count: 0 };
      }
      
      return { ...job, flags_count: count || 0 };
    }));
    
    return jobsWithFlags as JobWithFlags[];
  };
  
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin', 'jobs_verification'],
    queryFn: fetchJobs,
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string, updates: any }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs_verification'] });
      toast({
        title: 'Job updated',
        description: 'The job has been successfully verified.',
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: `${error}`,
        variant: 'destructive',
      });
    }
  });

  const handleVerifyJob = (job: JobWithFlags) => {
    updateJobMutation.mutate({
      jobId: job.id,
      updates: {
        is_verified: true
      }
    });
  };

  const handleFlagJob = (job: JobWithFlags) => {
    updateJobMutation.mutate({
      jobId: job.id,
      updates: {
        is_verified: false,
        status: 'flagged'
      }
    });
  };

  const handleViewJob = (job: JobWithFlags) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
      </div>
    );
  }

  // Filter jobs that require verification (either new jobs or flagged jobs)
  const jobsNeedingVerification = jobs?.filter(
    job => !job.is_verified || job.flags_count > 0
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Jobs Verification Queue</h2>
          
          {jobsNeedingVerification && jobsNeedingVerification.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobsNeedingVerification.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>
                      {job.customer?.user_metadata?.full_name || "Unknown User"}
                    </TableCell>
                    <TableCell>{job.category?.name}</TableCell>
                    <TableCell>
                      {job.is_verified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.flags_count > 0 ? (
                        <Badge variant="destructive">{job.flags_count}</Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewJob(job)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleVerifyJob(job)}
                      >
                        Verify
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleFlagJob(job)}
                      >
                        Flag
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No jobs requiring verification found</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Review the job details for verification.
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Title</p>
                <p className="text-sm">{selectedJob.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-sm text-gray-600">
                    ${selectedJob.budget_min} - ${selectedJob.budget_max}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-gray-600">{selectedJob.location}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Emergency</p>
                  <p className="text-sm text-gray-600">
                    {selectedJob.is_emergency ? "Yes" : "No"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fix Now</p>
                  <p className="text-sm text-gray-600">
                    {selectedJob.is_fix_now ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <div className="flex gap-2">
              <Button 
                variant="destructive"
                onClick={() => selectedJob && handleFlagJob(selectedJob)}
              >
                Flag as Inappropriate
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button 
                variant="default"
                onClick={() => selectedJob && handleVerifyJob(selectedJob)}
              >
                Verify Job
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobVerification;
