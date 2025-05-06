
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import DisputeTracker from '@/components/admin/DisputeTracker';
import JobVerification from '@/components/admin/JobVerification';
import UserFlagging from '@/components/admin/UserFlagging';
import { Shield } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("disputes");
  
  // Check if user is admin
  const isAdmin = user?.user_metadata?.is_admin === true;
  
  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !isAdmin) {
      navigate('/dashboard');
    } else if (!user) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);
  
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Admin Panel
            </h1>
            <p className="text-gray-600 mt-1">
              Manage disputes, verify jobs, and review flagged users
            </p>
          </div>
          
          <Tabs defaultValue="disputes" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="disputes">Disputes</TabsTrigger>
              <TabsTrigger value="jobs">Job Verification</TabsTrigger>
              <TabsTrigger value="users">Flagged Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="disputes">
              <DisputeTracker />
            </TabsContent>
            
            <TabsContent value="jobs">
              <JobVerification />
            </TabsContent>
            
            <TabsContent value="users">
              <UserFlagging />
            </TabsContent>
          </Tabs>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
