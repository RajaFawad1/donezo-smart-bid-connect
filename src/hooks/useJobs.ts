import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Job, JobWithBids } from '@/types';
import { useToast } from './use-toast';

export function useJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getJobs = async (): Promise<Job[]> => {
    console.log("Fetching all jobs");
    const { data, error } = await supabase
      .from('jobs')
      .select('*, category:service_categories(*)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
    console.log(`Fetched ${data?.length || 0} jobs`);
    return data as Job[];
  };

  const getJobWithBids = async (id: string): Promise<JobWithBids | null> => {
    try {
      console.log(`Fetching job details for job ID: ${id}`);
      
      // First fetch the job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (jobError) {
        console.error("Error fetching job:", jobError);
        throw jobError;
      }
      
      if (!jobData) {
        console.log("No job found with ID:", id);
        return null;
      }
      
      // Then fetch bids separately to avoid the schema relationship issue
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('job_id', id);
      
      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
        throw bidsError;
      }
      
      // For each bid, fetch the provider details
      const bidsWithProvider = await Promise.all(bidsData.map(async (bid) => {
        if (!bid.provider_id) return bid;
        
        const { data: provider, error: providerError } = await supabase
          .from('service_providers')
          .select('*, user:id(*)')
          .eq('id', bid.provider_id)
          .maybeSingle();
        
        if (providerError) {
          console.error("Error fetching provider:", providerError);
          return bid;
        }
        
        return { ...bid, provider };
      }));
      
      // Combine job and bids
      const jobWithBids: JobWithBids = {
        ...jobData,
        bids: bidsWithProvider
      };
      
      console.log("Job with bids fetched successfully:", jobWithBids.id);
      return jobWithBids;
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
      
      // Modified query to prevent the join error
      const { data, error } = await supabase
        .from('jobs')
        .select('*, category:service_categories(*)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} jobs for provider`);
      
      // Get bid counts in a separate query to avoid the join error
      const jobsWithBidCounts = await Promise.all(data.map(async (job) => {
        const { count, error: countError } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);
          
        if (countError) {
          console.error(`Error getting bid count for job ${job.id}:`, countError);
          return { ...job, bids_count: 0 };
        }
        
        return { ...job, bids_count: count || 0 };
      }));
      
      return jobsWithBidCounts as Job[];
    } catch (error) {
      console.error("Exception in getOpenJobs:", error);
      throw error;
    }
  };

  // Get average price for a service category
  const getAveragePricing = async (categoryId: string): Promise<number | null> => {
    try {
      // Get completed contracts in this category to calculate average pricing
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('category_id', categoryId)
        .eq('status', 'completed');
      
      if (jobsError || !jobs || jobs.length === 0) {
        console.log("No completed jobs found for category:", categoryId);
        return null;
      }
      
      const jobIds = jobs.map(job => job.id);
      
      // Get the contracts for these jobs
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('amount')
        .in('job_id', jobIds);
      
      if (contractsError || !contracts || contracts.length === 0) {
        return null;
      }
      
      // Calculate average
      const total = contracts.reduce((sum, contract) => sum + Number(contract.amount), 0);
      return Math.round(total / contracts.length);
    } catch (error) {
      console.error("Error getting average pricing:", error);
      return null;
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
    
    // Calculate price adjustments for emergency and fix now options
    if (job.is_emergency || job.is_fix_now) {
      // If we have budget values, adjust them for premium service
      if (job.budget_min && job.budget_max) {
        // Apply premium of 20% for fix now and 30% for emergency
        const fixNowPremium = job.is_fix_now ? 1.2 : 1;
        const emergencyPremium = job.is_emergency ? 1.3 : 1;
        
        // Apply both premiums if both are selected
        const totalPremium = fixNowPremium * emergencyPremium;
        
        // Round to whole numbers
        job.budget_min = Math.round(job.budget_min * totalPremium);
        job.budget_max = Math.round(job.budget_max * totalPremium);
      }
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
      retry: 2, // Retry failed queries a couple times
      refetchOnWindowFocus: true,
      refetchInterval: 30000, // Refetch every 30 seconds to keep bids updated
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
      staleTime: 1000 * 30, // 30 seconds
    });
  };

  // Query to get average pricing for a service category
  const useAveragePricing = (categoryId: string | undefined) => {
    return useQuery({
      queryKey: ['averagePricing', categoryId],
      queryFn: () => categoryId ? getAveragePricing(categoryId) : Promise.resolve(null),
      enabled: !!categoryId,
      staleTime: 1000 * 60 * 60, // 1 hour
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
    useAveragePricing,
    useCreateJob,
    useUpdateJob,
  };
}
