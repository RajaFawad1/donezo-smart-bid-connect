
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Contract } from '@/types';
import { useToast } from './use-toast';

export function useContracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMyContracts = async (): Promise<Contract[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) return [];
    
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

  const releasePayment = async (contractId: string): Promise<Contract> => {
    // Get contract info
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();
    
    if (contractError) throw contractError;
    
    // Calculate platform fee (10%)
    const platformFee = Math.round(contract.amount * 0.1);
    const providerAmount = contract.amount - platformFee;
    
    // In a real app, we would process the payment transfer here
    // But for this simulation, we just update the payment status
    
    const { data, error } = await supabase
      .from('contracts')
      .update({ 
        payment_status: 'paid',
        status: 'completed'
      })
      .eq('id', contractId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Mark the job as completed
    await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', contract.job_id);
    
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

  const useReleasePayment = () => {
    return useMutation({
      mutationFn: releasePayment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myContracts'] });
        queryClient.invalidateQueries({ queryKey: ['myJobs'] });
        queryClient.invalidateQueries({ queryKey: ['job'] });
        toast({ 
          title: 'Payment released successfully!',
          description: 'The payment has been sent to the service provider minus the 10% platform fee.'
        });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to release payment', 
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
    useReleasePayment,
  };
}
