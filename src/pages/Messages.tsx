
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, ChevronLeft } from 'lucide-react';

const Messages = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { useConversations, useUserMessages, useSendMessage } = useMessages();
  
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useUserMessages(selectedUserId || undefined);
  const sendMessageMutation = useSendMessage();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set selected user from URL
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Change URL when selecting a conversation without losing the page
  useEffect(() => {
    if (selectedUserId) {
      navigate(`/messages/${selectedUserId}`, { replace: true });
    } else {
      navigate('/messages', { replace: true });
    }
  }, [selectedUserId, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !message.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        receiver_id: selectedUserId,
        content: message.trim()
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (userId: string) => {
    setSelectedUserId(userId);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Conversations list */}
            <aside className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden h-[calc(80vh-120px)]">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-56px)]">
                {conversationsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center p-6 text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUserId === convo.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => selectConversation(convo.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-donezo-blue text-white">
                            {getUserInitials(convo.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{convo.name}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
            
            {/* Messages display */}
            <div className="md:col-span-3 bg-white rounded-lg shadow-sm overflow-hidden h-[calc(80vh-120px)] flex flex-col">
              {selectedUserId ? (
                <>
                  {/* Message header */}
                  <div className="p-4 border-b flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden mr-2" 
                      onClick={() => setSelectedUserId(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-donezo-blue text-white">
                          {getUserInitials(
                            conversations.find(c => c.id === selectedUserId)?.name || 'User'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="font-semibold">
                        {conversations.find(c => c.id === selectedUserId)?.name || 'User'}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-grow p-4 overflow-y-auto">
                    {messagesLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center p-6 text-gray-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender_id === user?.id
                                  ? 'bg-donezo-blue text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Message input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow"
                    />
                    <Button
                      type="submit"
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-donezo-blue hover:bg-donezo-blue/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                    <p className="mt-1 text-gray-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
