
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Bid } from '@/types';
import { useToast } from './use-toast';

export function useBids() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMyBids = async (): Promise<Bid[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('bids')
      .select('*, job:job_id(*)')
      .eq('provider_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Bid[];
  };

  const getBidsByJobId = async (jobId: string): Promise<Bid[]> => {
    const { data, error } = await supabase
      .from('bids')
      .select('*, provider:provider_id(*)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Bid[];
  };

  const createBid = async (bid: Partial<Bid>): Promise<Bid> => {
    const { data, error } = await supabase
      .from('bids')
      .insert([bid])
      .select('*')
      .single();
    
    if (error) throw error;
    return data as Bid;
  };

  const updateBid = async ({ id, ...updates }: Partial<Bid> & { id: string }): Promise<Bid> => {
    const { data, error } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return data as Bid;
  };

  // Queries
  const useMyBids = () => {
    return useQuery({
      queryKey: ['myBids'],
      queryFn: getMyBids,
    });
  };

  const useBidsByJobId = (jobId: string | undefined) => {
    return useQuery({
      queryKey: ['bids', jobId],
      queryFn: () => jobId ? getBidsByJobId(jobId) : Promise.resolve([]),
      enabled: !!jobId,
    });
  };

  // Mutations
  const useCreateBid = () => {
    return useMutation({
      mutationFn: createBid,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['myBids'] });
        queryClient.invalidateQueries({ queryKey: ['bids', data.job_id] });
        queryClient.invalidateQueries({ queryKey: ['job', data.job_id] });
        toast({ title: 'Bid submitted successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to submit bid', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  const useUpdateBid = () => {
    return useMutation({
      mutationFn: updateBid,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['myBids'] });
        queryClient.invalidateQueries({ queryKey: ['bids', data.job_id] });
        queryClient.invalidateQueries({ queryKey: ['job', data.job_id] });
        toast({ title: 'Bid updated successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to update bid', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useMyBids,
    useBidsByJobId,
    useCreateBid,
    useUpdateBid,
  };
}
