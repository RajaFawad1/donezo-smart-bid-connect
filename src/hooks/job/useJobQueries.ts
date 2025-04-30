
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Job, JobWithBids } from '@/types';

export function useAllJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async (): Promise<Job[]> => {
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
    },
  });
}

export function useJobById(id: string | undefined) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async (): Promise<JobWithBids | null> => {
      if (!id) return null;
      
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
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching job with bids:", error);
          throw error;
        }
        
        if (!data) {
          console.log("No job found with ID:", id);
          return null;
        }
        
        console.log("Job details fetched successfully:", data?.id);
        return data as JobWithBids;
      } catch (error) {
        console.error("Exception in getJobWithBids:", error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

export function useMyJobs() {
  return useQuery({
    queryKey: ['myJobs'],
    queryFn: async (): Promise<Job[]> => {
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
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useOpenJobs() {
  return useQuery({
    queryKey: ['openJobs'],
    queryFn: async (): Promise<Job[]> => {
      try {
        console.log("Fetching open jobs for providers");
        
        // For providers, get ALL jobs (not just open ones) so they can see everything
        const { data, error } = await supabase
          .from('jobs')
          .select('*, category:service_categories(*), bids_count:bids(count)')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching jobs:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} jobs for provider`);
        
        return data.map(job => ({
          ...job,
          bids_count: job.bids_count?.[0]?.count || 0
        })) as Job[];
      } catch (error) {
        console.error("Exception in getOpenJobs:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds
  });
}
