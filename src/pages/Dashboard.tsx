
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-lg text-gray-500">
              Welcome back, {user?.user_metadata?.full_name || 'User'}!
            </p>
          </div>
          
          {userType === 'customer' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DashboardCard 
                title="Post a New Job" 
                description="Create a new job listing for service providers to bid on."
                link="/post-job"
                linkText="Post Job"
              />
              <DashboardCard 
                title="My Active Jobs" 
                description="View and manage your currently active job listings."
                link="/my-jobs"
                linkText="View Jobs"
              />
              <DashboardCard 
                title="Job History" 
                description="Review your completed jobs and service provider ratings."
                link="/job-history"
                linkText="View History"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DashboardCard 
                title="Find Jobs" 
                description="Browse open job listings that match your skills."
                link="/find-jobs"
                linkText="Browse Jobs"
              />
              <DashboardCard 
                title="My Bids" 
                description="View and manage your active bids."
                link="/my-bids"
                linkText="View Bids"
              />
              <DashboardCard 
                title="Job History" 
                description="Review your completed jobs and ratings."
                link="/job-history"
                linkText="View History"
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const DashboardCard = ({ title, description, link, linkText }: DashboardCardProps) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-4">
        <a
          href={link}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-donezo-blue hover:bg-donezo-blue/90"
        >
          {linkText}
        </a>
      </div>
    </div>
  </div>
);

export default Dashboard;
