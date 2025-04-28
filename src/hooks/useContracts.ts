
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Contract } from '@/types';
import { useToast } from './use-toast';

export function useContracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMyContracts = async (): Promise<Contract[]> => {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id || '';
    
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        job:job_id(*),
        bid:bid_id(*)
      `)
      .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Contract[];
  };

  const createContract = async (contract: Partial<Contract>): Promise<Contract> => {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contract])
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Update job status to in_progress
    await supabase
      .from('jobs')
      .update({ status: 'in_progress' })
      .eq('id', contract.job_id);
    
    // Update bid status to accepted
    await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', contract.bid_id);
    
    // Reject other bids
    await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('job_id', contract.job_id)
      .neq('id', contract.bid_id);
    
    return data as Contract;
  };

  const updateContract = async ({ id, ...updates }: Partial<Contract> & { id: string }): Promise<Contract> => {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // If contract is completed, update job status
    if (updates.status === 'completed') {
      const { data: contractData } = await supabase
        .from('contracts')
        .select('job_id')
        .eq('id', id)
        .single();
      
      if (contractData) {
        await supabase
          .from('jobs')
          .update({ status: 'completed' })
          .eq('id', contractData.job_id);
      }
    }
    
    return data as Contract;
  };

  // Queries
  const useMyContracts = () => {
    return useQuery({
      queryKey: ['myContracts'],
      queryFn: getMyContracts,
    });
  };

  // Mutations
  const useCreateContract = () => {
    return useMutation({
      mutationFn: createContract,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myContracts'] });
        queryClient.invalidateQueries({ queryKey: ['myJobs'] });
        queryClient.invalidateQueries({ queryKey: ['job'] });
        toast({ title: 'Contract created successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to create contract', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  const useUpdateContract = () => {
    return useMutation({
      mutationFn: updateContract,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myContracts'] });
        queryClient.invalidateQueries({ queryKey: ['myJobs'] });
        queryClient.invalidateQueries({ queryKey: ['job'] });
        toast({ title: 'Contract updated successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to update contract', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useMyContracts,
    useCreateContract,
    useUpdateContract,
  };
}
