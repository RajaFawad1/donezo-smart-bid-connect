
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [realtime, setRealtime] = useState<{ subscription: any; connected: boolean }>({
    subscription: null,
    connected: false
  });

  useEffect(() => {
    // Set up real-time subscription to notifications
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        // When a new notification comes in, invalidate notifications query
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        // Show a toast notification
        if (payload.new) {
          toast({ 
            title: payload.new.title,
            description: payload.new.content
          });
        }
      })
      .subscribe();

    setRealtime({
      subscription,
      connected: true
    });

    return () => {
      if (realtime.subscription) {
        supabase.removeChannel(realtime.subscription);
      }
    };
  }, [queryClient, toast, user?.id]);

  const getNotifications = async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id || '')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Notification[];
  };

  const getUnreadCount = async (): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id || '')
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  };

  const markAsRead = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) throw error;
  };

  const markAllAsRead = async (): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id || '')
      .eq('is_read', false);
    
    if (error) throw error;
  };

  // Queries
  const useAllNotifications = () => {
    return useQuery({
      queryKey: ['notifications'],
      queryFn: getNotifications,
    });
  };

  const useUnreadCount = () => {
    return useQuery({
      queryKey: ['notificationsCount'],
      queryFn: getUnreadCount,
      refetchInterval: 30000, // Refetch every 30 seconds as a fallback
    });
  };

  // Mutations
  const useMarkAsRead = () => {
    return useMutation({
      mutationFn: markAsRead,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
      },
    });
  };

  const useMarkAllAsRead = () => {
    return useMutation({
      mutationFn: markAllAsRead,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsCount'] });
        toast({ title: 'All notifications marked as read' });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to mark notifications as read', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useAllNotifications,
    useUnreadCount,
    useMarkAsRead,
    useMarkAllAsRead,
    realtime,
  };
}
