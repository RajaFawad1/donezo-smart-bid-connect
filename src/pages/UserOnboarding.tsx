
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';

const UserOnboarding = () => {
  const { user, loading } = useAuth();
  const [userType, setUserType] = useState<UserType>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to dashboard if user is already logged in and has a user type
  const currentUserType = user?.user_metadata?.user_type;
  if (!loading && (!user || currentUserType)) {
    navigate('/dashboard');
  }

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update user metadata to include user_type
      const { error } = await supabase.auth.updateUser({
        data: { user_type: userType }
      });
      
      if (error) throw error;
      
      // Depending on user type, create profile in appropriate table
      if (userType === 'provider') {
        // Create service provider record
        const { error: providerError } = await supabase
          .from('service_providers')
          .insert([{
            id: user.id,
            business_name: '',
            years_experience: 0,
            is_verified: false,
            is_available_emergency: false,
            is_premium_partner: false,
          }]);
        
        if (providerError) throw providerError;
      } else {
        // Create customer record
        const { error: customerError } = await supabase
          .from('customer_profiles')
          .insert([{
            id: user.id,
          }]);
        
        if (customerError) throw customerError;
      }
      
      toast({
        title: "User type selected",
        description: `You've been set up as a ${userType}`,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error in user onboarding:', error);
      toast({
        title: "Onboarding failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to Donezo!</CardTitle>
            <CardDescription className="text-center">
              Please tell us how you'll be using the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={userType}
              onValueChange={(value) => setUserType(value as UserType)}
              className="space-y-6"
            >
              <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${userType === 'customer' ? 'border-donezo-blue bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setUserType('customer')}>
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer" className="flex-1 cursor-pointer">
                  <div className="font-medium">I need services</div>
                  <div className="text-sm text-gray-500">
                    Post jobs, hire providers, and get your tasks done
                  </div>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${userType === 'provider' ? 'border-donezo-teal bg-teal-50' : 'border-gray-200'}`}
                onClick={() => setUserType('provider')}>
                <RadioGroupItem value="provider" id="provider" />
                <Label htmlFor="provider" className="flex-1 cursor-pointer">
                  <div className="font-medium">I provide services</div>
                  <div className="text-sm text-gray-500">
                    Find jobs, bid on projects, and grow your business
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-donezo-blue hover:bg-donezo-blue/90"
            >
              {isSubmitting ? "Setting up your account..." : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserOnboarding;
