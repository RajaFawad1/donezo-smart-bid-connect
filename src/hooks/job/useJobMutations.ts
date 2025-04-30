
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useCreateJob() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (job: Partial<Job>): Promise<Job> => {
      console.log("Creating job with data:", job);
      
      // Ensure the job has proper customer_id and status values
      if (!job.customer_id) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) {
          throw new Error("User must be logged in to create a job");
        }
        job.customer_id = userData.user.id;
      }
      
      // Ensure status is set correctly
      if (!job.status) {
        job.status = "open";
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([job])
        .select('*')
        .single();
      
      if (error) {
        console.error("Error creating job:", error);
        throw error;
      }
      
      console.log("Job created successfully:", data);
      return data as Job;
    },
    onSuccess: (data) => {
      // Invalidate all job-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['openJobs'] });
      toast({ title: 'Job created successfully!' });
    },
    onError: (error: any) => {
      console.error("Error creating job:", error);
      toast({ 
        title: 'Failed to create job', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateJob() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }): Promise<Job> => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['openJobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.id] });
      toast({ title: 'Job updated successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update job', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}
