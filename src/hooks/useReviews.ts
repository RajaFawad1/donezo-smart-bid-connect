
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Review } from '@/types';
import { useToast } from './use-toast';

export function useReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(user_metadata)')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Review[];
  };

  const createReview = async (review: Partial<Review>): Promise<Review> => {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select('*')
      .single();
    
    if (error) throw error;
    return data as Review;
  };

  // Queries
  const useUserReviews = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['reviews', userId],
      queryFn: () => userId ? getReviewsByUserId(userId) : Promise.resolve([]),
      enabled: !!userId,
    });
  };

  // Mutations
  const useCreateReview = () => {
    return useMutation({
      mutationFn: createReview,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['reviews', data.reviewee_id] });
        toast({ title: 'Review submitted successfully!' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to submit review', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useUserReviews,
    useCreateReview,
  };
}
