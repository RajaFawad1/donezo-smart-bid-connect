
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ServiceProvider, CustomerProfile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useProfiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getProviderProfile = async (userId: string): Promise<ServiceProvider | null> => {
    const { data, error } = await supabase
      .from('service_provider_profiles')
      .select('*, user:id(id, email, user_metadata)')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return data as ServiceProvider;
  };

  const getCustomerProfile = async (userId: string): Promise<CustomerProfile | null> => {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return data as CustomerProfile;
  };

  const updateProviderProfile = async (profile: Partial<ServiceProvider>): Promise<ServiceProvider> => {
    const { data, error } = await supabase
      .from('service_provider_profiles')
      .update(profile)
      .eq('id', user?.id || '')
      .select('*')
      .single();
    
    if (error) throw error;
    return data as ServiceProvider;
  };

  const updateCustomerProfile = async (profile: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(profile)
      .eq('id', user?.id || '')
      .select('*')
      .single();
    
    if (error) throw error;
    return data as CustomerProfile;
  };

  // Queries
  const useProviderProfile = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['providerProfile', userId],
      queryFn: () => userId ? getProviderProfile(userId) : Promise.resolve(null),
      enabled: !!userId,
    });
  };

  const useCustomerProfile = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['customerProfile', userId],
      queryFn: () => userId ? getCustomerProfile(userId) : Promise.resolve(null),
      enabled: !!userId,
    });
  };

  const useMyProfile = () => {
    const userType = user?.user_metadata?.user_type;
    const userId = user?.id;

    if (userType === 'provider') {
      return useQuery({
        queryKey: ['myProfile', userId],
        queryFn: () => userId ? getProviderProfile(userId) : Promise.resolve(null),
        enabled: !!userId,
      });
    } else {
      return useQuery({
        queryKey: ['myProfile', userId],
        queryFn: () => userId ? getCustomerProfile(userId) : Promise.resolve(null),
        enabled: !!userId,
      });
    }
  };

  // Mutations
  const useUpdateProviderProfile = () => {
    return useMutation({
      mutationFn: updateProviderProfile,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['providerProfile', user?.id] });
        toast({ title: 'Profile updated successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to update profile', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  const useUpdateCustomerProfile = () => {
    return useMutation({
      mutationFn: updateCustomerProfile,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['customerProfile', user?.id] });
        toast({ title: 'Profile updated successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to update profile', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useProviderProfile,
    useCustomerProfile,
    useMyProfile,
    useUpdateProviderProfile,
    useUpdateCustomerProfile,
  };
}
