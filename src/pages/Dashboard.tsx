import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import ProviderDashboard from '@/components/dashboard/ProviderDashboard';
import { useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading) {
      if (!user) {
        navigate('/');
      } else {
        // When user is authenticated, make sure to invalidate queries to fetch fresh data
        console.log("Dashboard: Invalidating queries for fresh data");
        // Force invalidate and refetch all data
        queryClient.invalidateQueries();
        
        // Specifically refetch important data
        queryClient.refetchQueries({ queryKey: ['myJobs'] });
        queryClient.refetchQueries({ queryKey: ['openJobs'] });
        queryClient.refetchQueries({ queryKey: ['myBids'] });
        queryClient.refetchQueries({ queryKey: ['myContracts'] });
        
        setTimeout(() => {
          // Set initialized after a small delay to ensure data has been fetched
          setIsInitialized(true);
        }, 300);
      }
    }
  }, [user, loading, navigate, queryClient]);

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
      </div>
    );
  }

  const userType = user?.user_metadata?.user_type || 'customer';
  
  console.log("Dashboard rendering with user type:", userType);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {userType === 'customer' ? (
          <CustomerDashboard />
        ) : (
          <ProviderDashboard />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
