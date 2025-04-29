
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
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return data as JobWithBids;
  };

  const getMyJobs = async (): Promise<Job[]> => {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*, category:service_categories(*), bids_count:bids(count)')
      .eq('customer_id', userId || '')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(job => ({
      ...job,
      bids_count: job.bids_count[0].count
    })) as Job[];
  };

  const getOpenJobs = async (): Promise<Job[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, category:service_categories(*), bids_count:bids(count)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(job => ({
      ...job,
      bids_count: job.bids_count[0].count
    })) as Job[];
  };

  const createJob = async (job: Partial<Job>): Promise<Job> => {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select('*')
      .single();
    
    if (error) throw error;
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
    });
  };

  const useOpenJobs = () => {
    return useQuery({
      queryKey: ['openJobs'],
      queryFn: getOpenJobs,
    });
  };

  // Mutations
  const useCreateJob = () => {
    return useMutation({
      mutationFn: createJob,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
        queryClient.invalidateQueries({ queryKey: ['myJobs'] });
        queryClient.invalidateQueries({ queryKey: ['openJobs'] });
        toast({ title: 'Job created successfully!' });
      },
      onError: (error: any) => {
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
