
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) {
      navigate('/');
    } else if (user) {
      // Set initial values from user data
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
      setUserType(user.user_metadata?.user_type || 'customer');
    }
  }, [user, loading, navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          user_type: userType
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              
              <div className="space-y-2">
                <Label>User Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-3 cursor-pointer text-center transition-colors ${
                      userType === 'customer'
                        ? 'bg-donezo-blue text-white border-donezo-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-donezo-blue'
                    }`}
                    onClick={() => !isUpdating && setUserType('customer')}
                  >
                    Customer
                  </div>
                  <div
                    className={`border rounded-lg p-3 cursor-pointer text-center transition-colors ${
                      userType === 'provider'
                        ? 'bg-donezo-teal text-white border-donezo-teal'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-donezo-teal'
                    }`}
                    onClick={() => !isUpdating && setUserType('provider')}
                  >
                    Service Provider
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating}
                className="bg-donezo-blue hover:bg-donezo-blue/90"
              >
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-gray-500 text-sm">Change your password</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Notification Settings</h3>
                  <p className="text-gray-500 text-sm">Manage how we contact you</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
