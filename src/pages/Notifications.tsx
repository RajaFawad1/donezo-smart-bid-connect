
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, AlertTriangle, MessageSquare, Info, Loader2 } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { useAllNotifications, useMarkAsRead, useMarkAllAsRead } = useNotifications();
  
  const { data: notifications = [], isLoading: notificationsLoading } = useAllNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'contract':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Loading state
  if (authLoading || notificationsLoading) {
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
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            
            <Button 
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some(n => !n.is_read) || markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                'Mark all as read'
              )}
            </Button>
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center">
                        <span className="mr-2">
                          {getNotificationIcon(notification.type)}
                        </span>
                        {notification.title}
                      </CardTitle>
                      {!notification.is_read && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.content}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between w-full">
                      {notification.reference_id && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            const path = notification.type === 'message' 
                              ? `/messages/${notification.reference_id}` 
                              : `/jobs/${notification.reference_id}`;
                            navigate(path);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                      
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          disabled={markAsReadMutation.isPending}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
