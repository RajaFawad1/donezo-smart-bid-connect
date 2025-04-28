
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBids } from '@/hooks/useBids';
import { useJobs } from '@/hooks/useJobs';
import { useContracts } from '@/hooks/useContracts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import BidsList from '@/components/bids/BidsList';
import ContractsList from '@/components/contracts/ContractsList';
import JobsList from '@/components/jobs/JobsList';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { useOpenJobs } = useJobs();
  const { useMyBids } = useBids();
  const { useMyContracts } = useContracts();

  const { data: openJobs = [], isLoading: openJobsLoading } = useOpenJobs();
  const { data: myBids = [], isLoading: bidsLoading } = useMyBids();
  const { data: contracts = [], isLoading: contractsLoading } = useMyContracts();

  // Count bids by status
  const pendingBidsCount = myBids.filter(bid => bid.status === 'pending').length;
  const acceptedBidsCount = myBids.filter(bid => bid.status === 'accepted').length;
  const rejectedBidsCount = myBids.filter(bid => bid.status === 'rejected').length;

  // Count active contracts
  const activeContractsCount = contracts.filter(contract => contract.status === 'in_progress').length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
        <p className="mt-1 text-lg text-gray-500">
          Welcome back, {user?.user_metadata?.full_name || 'Provider'}!
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Bids</p>
                <p className="text-3xl font-bold">{pendingBidsCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Accepted Bids</p>
                <p className="text-3xl font-bold">{acceptedBidsCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Rejected Bids</p>
                <p className="text-3xl font-bold">{rejectedBidsCount}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                <p className="text-3xl font-bold">{activeContractsCount}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Find New Jobs</CardTitle>
            <CardDescription>Browse open job listings that match your skills</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => window.location.href = "#open-jobs"} 
              className="w-full bg-donezo-teal hover:bg-donezo-teal/90"
            >
              <Search className="mr-2 h-4 w-4" /> Find Jobs
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your profile to attract more clients</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/profile" className="w-full">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Messages</CardTitle>
            <CardDescription>Communicate with customers</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/messages" className="w-full">
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" /> View Messages
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" className="w-full" id="open-jobs">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="jobs">Open Jobs</TabsTrigger>
          <TabsTrigger value="bids">My Bids</TabsTrigger>
          <TabsTrigger value="contracts">My Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs">
          {openJobsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
            </div>
          ) : (
            <JobsList jobs={openJobs} showBidButton />
          )}
        </TabsContent>
        
        <TabsContent value="bids">
          {bidsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
            </div>
          ) : (
            <BidsList bids={myBids} />
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
    </div>
  );
};

export default ProviderDashboard;
