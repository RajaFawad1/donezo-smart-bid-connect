
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useContracts } from '@/hooks/useContracts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Clock, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PostJobModal from '@/components/jobs/PostJobModal';
import JobsList from '@/components/jobs/JobsList';
import ContractsList from '@/components/contracts/ContractsList';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { useMyJobs } = useJobs();
  const { useMyContracts } = useContracts();
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useMyJobs();
  const { data: contracts = [], isLoading: contractsLoading } = useMyContracts();

  // Refetch jobs when component mounts and when modal closes
  useEffect(() => {
    console.log("Fetching jobs for customer dashboard");
    refetchJobs();
  }, [refetchJobs]);

  const handleRefresh = () => {
    console.log("Manually refreshing dashboard data");
    queryClient.invalidateQueries({ queryKey: ['myJobs'] });
    queryClient.invalidateQueries({ queryKey: ['myContracts'] });
    refetchJobs();
  };

  // Count jobs by status
  const openJobsCount = jobs.filter(job => job.status === 'open').length;
  const inProgressJobsCount = jobs.filter(job => job.status === 'in_progress').length;
  const completedJobsCount = jobs.filter(job => job.status === 'completed').length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-lg text-gray-500">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Jobs</p>
                <p className="text-3xl font-bold">{openJobsCount}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{inProgressJobsCount}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedJobsCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{jobs.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Post a New Job</CardTitle>
            <CardDescription>Create a new job for service providers to bid on</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => setIsPostJobModalOpen(true)} 
              className="w-full bg-donezo-blue hover:bg-donezo-blue/90"
              id="post-job-button"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Job
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Active Jobs</CardTitle>
            <CardDescription>View and manage your current job listings</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => window.location.href = "#active-jobs"} 
              variant="outline" 
              className="w-full"
            >
              View Jobs
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Messages</CardTitle>
            <CardDescription>Communicate with service providers</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/messages" className="w-full">
              <Button variant="outline" className="w-full">
                View Messages
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" className="w-full" id="active-jobs">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="contracts">My Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs">
          {jobsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
            </div>
          ) : (
            <>
              {jobs.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">You haven't posted any jobs yet.</p>
                </div>
              )}
              <JobsList jobs={jobs} />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="contracts">
          {contractsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
            </div>
          ) : (
            <ContractsList contracts={contracts} />
          )}
        </TabsContent>
      </Tabs>

      <PostJobModal 
        isOpen={isPostJobModalOpen} 
        onClose={() => {
          setIsPostJobModalOpen(false);
          // Refresh jobs list when modal closes
          console.log("Job modal closed, refreshing jobs");
          setTimeout(() => {
            refetchJobs();
            queryClient.invalidateQueries({ queryKey: ['myJobs'] });
          }, 300);
        }} 
      />
    </div>
  );
};

export default CustomerDashboard;
