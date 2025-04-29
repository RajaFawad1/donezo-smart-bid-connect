
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Bid } from '@/types';
import { useToast } from './use-toast';

export function useBids() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMyBids = async (): Promise<Bid[]> => {
    const { data, error } = await supabase
      .from('bids')
      .select('*, job:job_id(*)')
<<<<<<< HEAD
      .eq('provider_id', supabase.auth.getUser()?.id || '')
=======
      .eq('provider_id', userId)
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)
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

  // Mutations
  const useCreateBid = () => {
    return useMutation({
      mutationFn: createBid,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['myBids'] });
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
    useCreateBid,
    useUpdateBid,
  };
}
