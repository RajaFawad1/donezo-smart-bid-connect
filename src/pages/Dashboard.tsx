
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import ProviderDashboard from '@/components/dashboard/ProviderDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
      </div>
    );
  }

  const userType = user?.user_metadata?.user_type || 'customer';
  
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
