
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
    try {
      console.log(`Fetching bids for job ID: ${jobId}`);
      
      // First get all bids for this job
      const { data: bids, error } = await supabase
        .from('bids')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching bids:", error);
        throw error;
      }
      
      if (!bids || bids.length === 0) {
        console.log("No bids found for job:", jobId);
        return [];
      }
      
      console.log(`Found ${bids.length} bids for job ${jobId}`);
      
      // Enrich each bid with provider details
      const enrichedBids = await Promise.all(bids.map(async (bid) => {
        if (!bid.provider_id) return bid;
        
        try {
          // Get provider details
          const { data: provider, error: providerError } = await supabase
            .from('service_providers')
            .select('*, user:id(*)')
            .eq('id', bid.provider_id)
            .maybeSingle();
          
          if (providerError) {
            console.error("Error fetching provider for bid:", providerError);
            return bid;
          }
          
          // Add is_premium_partner directly to the provider object if it's from user_metadata
          if (provider && provider.user?.user_metadata) {
            provider.is_premium_partner = provider.user.user_metadata.is_premium_partner || false;
          }
          
          return { ...bid, provider };
        } catch (err) {
          console.error("Error enriching bid with provider data:", err);
          return bid;
        }
      }));
      
      console.log("Enriched bids with provider data:", enrichedBids.length);
      return enrichedBids as Bid[];
    } catch (err) {
      console.error("Error in getBidsByJobId:", err);
      throw err;
    }
  };

  const createBid = async (bid: Partial<Bid>): Promise<Bid> => {
    console.log("Creating bid with data:", bid);
    
    if (!bid.job_id) {
      throw new Error("Job ID is required");
    }
    
    if (!bid.provider_id) {
      throw new Error("Provider ID is required");
    }
    
    const { data, error } = await supabase
      .from('bids')
      .insert([bid])
      .select('*')
      .single();
    
    if (error) {
      console.error("Supabase error creating bid:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("Failed to create bid - no data returned");
    }
    
    console.log("Bid created successfully:", data);
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
      refetchInterval: 30000, // Refetch every 30 seconds to keep bids updated
      refetchOnWindowFocus: true,
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
        console.error("Error in useCreateBid mutation:", error);
        toast({ 
          title: 'Failed to submit bid', 
          description: error.message || "Please try again",
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
