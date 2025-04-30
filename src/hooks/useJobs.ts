
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Job, JobWithBids } from '@/types';
import { useToast } from './use-toast';

export function useJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getJobs = async (): Promise<Job[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, category:service_categories(*)');
    
    if (error) throw error;
    return data as Job[];
  };

  const getJobWithBids = async (id: string): Promise<JobWithBids | null> => {
    try {
      console.log(`Fetching job details for job ID: ${id}`);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          category:service_categories(*),
          bids(*, provider:provider_id(*, user:id(id, email, user_metadata)))
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching job with bids:", error);
        if (error.code === 'PGRST116') {
          console.log("No job found with ID:", id);
          return null; // No rows returned
        }
        throw error;
      }
      
      console.log("Job details fetched successfully:", data?.id);
      return data as JobWithBids;
    } catch (error) {
      console.error("Exception in getJobWithBids:", error);
      throw error;
    }
  };

  const getMyJobs = async (): Promise<Job[]> => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.log("No user ID found for getMyJobs");
      return [];
    }
    
    console.log("Fetching jobs for user:", userId);
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*, category:service_categories(*)')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching my jobs:", error);
      throw error;
    }
    
    console.log("Jobs fetched:", data?.length || 0);
    return data as Job[] || [];
  };

  const getOpenJobs = async (): Promise<Job[]> => {
    try {
      console.log("Fetching open jobs for providers");
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*, category:service_categories(*), bids_count:bids(count)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching open jobs:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} open jobs`);
      
      return data.map(job => ({
        ...job,
        bids_count: job.bids_count?.[0]?.count || 0
      })) as Job[];
    } catch (error) {
      console.error("Exception in getOpenJobs:", error);
      throw error;
    }
  };

  const createJob = async (job: Partial<Job>): Promise<Job> => {
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
  };

  const updateJob = async ({ id, ...updates }: Partial<Job> & { id: string }): Promise<Job> => {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return data as Job;
  };

  // Queries
  const useAllJobs = () => {
    return useQuery({
      queryKey: ['jobs'],
      queryFn: getJobs,
    });
  };

  const useJobById = (id: string | undefined) => {
    return useQuery({
      queryKey: ['job', id],
      queryFn: () => id ? getJobWithBids(id) : Promise.resolve(null),
      enabled: !!id,
    });
  };

  const useMyJobs = () => {
    return useQuery({
      queryKey: ['myJobs'],
      queryFn: getMyJobs,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60, // 1 minute
    });
  };

  const useOpenJobs = () => {
    return useQuery({
      queryKey: ['openJobs'],
      queryFn: getOpenJobs,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60, // 1 minute
    });
  };

  // Mutations
  const useCreateJob = () => {
    return useMutation({
      mutationFn: createJob,
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
  };

  const useUpdateJob = () => {
    return useMutation({
      mutationFn: updateJob,
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
  };

  return {
    useAllJobs,
    useJobById,
    useMyJobs,
    useOpenJobs,
    useCreateJob,
    useUpdateJob,
  };
}
