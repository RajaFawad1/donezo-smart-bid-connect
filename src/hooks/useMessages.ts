
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [realtime, setRealtime] = useState<{ subscription: any; connected: boolean }>({
    subscription: null,
    connected: false
  });

  useEffect(() => {
    // Set up real-time subscription to messages
    if (!user?.id) return;
    
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`
      }, (payload) => {
        // When a new message comes in, invalidate messages query
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        // Show a toast notification for new messages
        if (payload.new && payload.new.sender_id !== user?.id) {
          toast({ 
            title: 'New Message',
            description: 'You have received a new message'
          });
        }
      })
      .subscribe();

    setRealtime({
      subscription,
      connected: true
    });

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [queryClient, toast, user?.id]);

  const getConversations = async (): Promise<any[]> => {
    const userId = user?.id;
    if (!userId) return [];
    
    try {
      // Get unique conversations (latest message from each conversation)
      const { data: sent, error: sentError } = await supabase
        .from('messages')
        .select('receiver_id, receiver:receiver_id(user_metadata)')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });
        
      if (sentError) throw sentError;
        
      const { data: received, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id, sender:sender_id(user_metadata)')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });
      
      if (receivedError) throw receivedError;
      
      // Combine and deduplicate conversations
      const uniqueUsers = new Map();
      
      if (sent) {
        sent.forEach((msg: any) => {
          if (!uniqueUsers.has(msg.receiver_id)) {
            uniqueUsers.set(msg.receiver_id, {
              id: msg.receiver_id,
              name: msg.receiver?.user_metadata?.full_name || 'Unknown User'
            });
          }
        });
      }
      
      if (received) {
        received.forEach((msg: any) => {
          if (!uniqueUsers.has(msg.sender_id)) {
            uniqueUsers.set(msg.sender_id, {
              id: msg.sender_id,
              name: msg.sender?.user_metadata?.full_name || 'Unknown User'
            });
          }
        });
      }
      
      return Array.from(uniqueUsers.values());
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  };

  const getMessagesByUser = async (otherUserId: string): Promise<Message[]> => {
    const userId = user?.id;
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(user_metadata)')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Mark messages as read
      const unreadMessages = data.filter((msg: any) => 
        msg.receiver_id === userId && !msg.is_read
      ).map((msg: any) => msg.id);
      
      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages);
      }
      
      return data as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  };

  const sendMessage = async (message: { receiver_id: string; content: string; job_id?: string }): Promise<Message> => {
    if (!user?.id) throw new Error("You must be logged in to send messages");
    
    try {
      console.log("Sending message:", {
        sender_id: user.id,
        receiver_id: message.receiver_id,
        job_id: message.job_id,
        content: message.content
      });
      
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: message.receiver_id,
          job_id: message.job_id || null,
          content: message.content,
          is_read: false
        }])
        .select('*')
        .single();
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to send message - no data returned");
      }
      
      return data as Message;
    } catch (err) {
      console.error("Exception in sendMessage:", err);
      throw err;
    }
  };

  // Queries
  const useConversations = () => {
    return useQuery({
      queryKey: ['conversations'],
      queryFn: getConversations,
    });
  };

  const useUserMessages = (otherUserId: string | undefined) => {
    return useQuery({
      queryKey: ['messages', otherUserId],
      queryFn: () => otherUserId ? getMessagesByUser(otherUserId) : Promise.resolve([]),
      enabled: !!otherUserId,
      refetchInterval: 10000, // Refetch every 10 seconds as a fallback
    });
  };

  // Mutations
  const useSendMessage = () => {
    return useMutation({
      mutationFn: sendMessage,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['messages', data.receiver_id] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        toast({ 
          title: 'Message sent',
          description: 'Your message was successfully sent',
        });
      },
      onError: (error: any) => {
        toast({ 
          title: 'Failed to send message', 
          description: error.message,
          variant: 'destructive' 
        });
      },
    });
  };

  return {
    useConversations,
    useUserMessages,
    useSendMessage,
    realtime,
  };
}
