
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ServiceCategory } from '@/types';

export function useCategories() {
  const getCategories = async (): Promise<ServiceCategory[]> => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as ServiceCategory[];
  };

  const getCategoryById = async (id: string): Promise<ServiceCategory | null> => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data as ServiceCategory;
  };

  // Queries
  const useAllCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: getCategories,
    });
  };

  const useCategoryById = (id: string | undefined) => {
    return useQuery({
      queryKey: ['category', id],
      queryFn: () => id ? getCategoryById(id) : Promise.resolve(null),
      enabled: !!id,
    });
  };

  return {
    useAllCategories,
    useCategoryById,
  };
}
