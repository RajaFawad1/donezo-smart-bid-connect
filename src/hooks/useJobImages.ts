
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { JobImage } from '@/types';
import { useToast } from './use-toast';

export function useJobImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const getJobImagesByContract = async (contractId: string): Promise<JobImage[]> => {
    const { data, error } = await supabase
      .from('job_images')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching job images:", error);
      throw error;
    }
    
    return data as JobImage[];
  };
  
  const getContractBeforeImages = async (contractId: string): Promise<JobImage[]> => {
    const { data, error } = await supabase
      .from('job_images')
      .select('*')
      .eq('contract_id', contractId)
      .eq('image_type', 'before')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching before images:", error);
      throw error;
    }
    
    return data as JobImage[];
  };
  
  const getContractAfterImages = async (contractId: string): Promise<JobImage[]> => {
    const { data, error } = await supabase
      .from('job_images')
      .select('*')
      .eq('contract_id', contractId)
      .eq('image_type', 'after')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching after images:", error);
      throw error;
    }
    
    return data as JobImage[];
  };
  
  const deleteJobImage = async (imageId: string): Promise<void> => {
    // First, get the image record to get the URL
    const { data: imageData, error: fetchError } = await supabase
      .from('job_images')
      .select('image_url')
      .eq('id', imageId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching image to delete:", fetchError);
      throw fetchError;
    }
    
    if (!imageData) {
      throw new Error('Image not found');
    }
    
    // Extract the file path from the URL
    const url = new URL(imageData.image_url);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const filePath = `job-images/${fileName}`;
    
    // Delete from storage
    try {
      const { error: storageError } = await supabase
        .storage
        .from('job-images')
        .remove([filePath]);
      
      if (storageError) {
        console.warn("Error removing file from storage:", storageError);
        // Continue anyway to delete the database record
      }
    } catch (e) {
      console.warn("Error during storage deletion:", e);
      // Continue anyway to delete the database record
    }
    
    // Delete the database record
    const { error: deleteError } = await supabase
      .from('job_images')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) {
      console.error("Error deleting job image record:", deleteError);
      throw deleteError;
    }
  };
  
  // Queries
  const useJobImagesByContract = (contractId: string | undefined) => {
    return useQuery({
      queryKey: ['jobImages', contractId],
      queryFn: () => contractId ? getJobImagesByContract(contractId) : Promise.resolve([]),
      enabled: !!contractId,
    });
  };
  
  const useContractBeforeImages = (contractId: string | undefined) => {
    return useQuery({
      queryKey: ['beforeImages', contractId],
      queryFn: () => contractId ? getContractBeforeImages(contractId) : Promise.resolve([]),
      enabled: !!contractId,
    });
  };
  
  const useContractAfterImages = (contractId: string | undefined) => {
    return useQuery({
      queryKey: ['afterImages', contractId],
      queryFn: () => contractId ? getContractAfterImages(contractId) : Promise.resolve([]),
      enabled: !!contractId,
    });
  };
  
  // Mutations
  const useDeleteJobImage = () => {
    return useMutation({
      mutationFn: deleteJobImage,
      onSuccess: (_, imageId) => {
        queryClient.invalidateQueries({ queryKey: ['jobImages'] });
        queryClient.invalidateQueries({ queryKey: ['beforeImages'] });
        queryClient.invalidateQueries({ queryKey: ['afterImages'] });
        toast({ title: 'Image deleted successfully' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to delete image', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useJobImagesByContract,
    useContractBeforeImages,
    useContractAfterImages,
    useDeleteJobImage,
  };
}
