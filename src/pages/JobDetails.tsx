
<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useContracts } from '@/hooks/useContracts';
import { Job, Bid } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
=======
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useContracts } from '@/hooks/useContracts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BidModal from '@/components/bids/BidModal';
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  MapPin, Calendar, Clock, AlertTriangle, DollarSign, 
  CheckCircle, XCircle, MessageSquare, User, Building 
} from 'lucide-react';
<<<<<<< HEAD
import BidModal from '@/components/bids/BidModal';
=======
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { useJobById } = useJobs();
  const { useCreateContract } = useContracts();
<<<<<<< HEAD
  const { data: job, isLoading: jobLoading } = useJobById(jobId);
  const createContractMutation = useCreateContract();
  
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const isCustomer = user?.id === job?.customer_id;
  const isProvider = user?.user_metadata?.user_type === 'provider';
=======
  
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  
  const { data: job, isLoading, isError } = useJobById(id);
  const createContractMutation = useCreateContract();

  const isCustomer = user?.id === job?.customer_id;
  const isProvider = user?.user_metadata?.user_type === 'provider';
  const hasUserBidded = job?.bids?.some(bid => bid.provider_id === user?.id);
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)

  const handleAcceptBid = async (bid: Bid) => {
    if (!job) return;
    
    try {
      await createContractMutation.mutateAsync({
        job_id: job.id,
        bid_id: bid.id,
        customer_id: job.customer_id,
        provider_id: bid.provider_id,
        amount: bid.amount,
        status: 'in_progress',
        payment_status: 'not_paid',
<<<<<<< HEAD
      });
      // Will refresh job data via invalidation in hook
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  // Loading state
  if (authLoading || jobLoading) {
=======
        start_date: new Date().toISOString(),
      });
      setConfirmDialogOpen(false);
      // Redirect to dashboard after creating contract
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating contract:', error);
      setConfirmDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500 hover:bg-amber-600">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)
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

<<<<<<< HEAD
  // Not found state
  if (!job) {
=======
  if (isError || !job) {
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Job Not Found</h1>
            <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="mt-8 bg-donezo-blue hover:bg-donezo-blue/90"
            >
              Return to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderBidStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Check if current provider has already bid
  const currentUserBid = isProvider ? 
    job.bids?.find(bid => bid.provider_id === user?.id) : 
    null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Job Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <div className="flex space-x-2">
                    {job.is_emergency && (
                      <Badge className="bg-red-500 hover:bg-red-600">Emergency</Badge>
                    )}
                    {job.is_fix_now && (
                      <Badge className="bg-purple-500 hover:bg-purple-600">Fix Now</Badge>
                    )}
                    {getStatusBadge(job.status)}
                  </div>
                </div>
                <p className="mt-1 text-gray-500">
                  Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })} • {job.category?.name}
                </p>
              </div>
              <div>
                {isProvider && job.status === 'open' && (
                  currentUserBid ? (
                    <div className="text-right">
                      <div className="mb-2 inline-block">
                        {renderBidStatus(currentUserBid.status)}
                      </div>
                      <p className="text-sm text-gray-500">Your bid: ${currentUserBid.amount}</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsBidModalOpen(true)}
                      className="bg-donezo-teal hover:bg-donezo-teal/90"
                    >
                      Place Bid
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>

                {(job.is_emergency || job.is_fix_now) && (
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex gap-3 mt-6">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">
                        {job.is_emergency && 'Emergency Service'}
                        {job.is_emergency && job.is_fix_now && ' - '}
                        {job.is_fix_now && 'Fix Now Priority'}
                      </p>
                      <p className="text-amber-700 mt-1">
                        {job.is_emergency && 'This job requires urgent attention.'}
                        {job.is_emergency && job.is_fix_now && ' '}
                        {job.is_fix_now && 'Customer is willing to pay premium for fast service.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Job Details</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{job.location || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-medium">${job.budget_min} - ${job.budget_max}</p>
                    </div>
                  </div>
                  
                  {job.preferred_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Preferred Date</p>
                        <p className="font-medium">
                          {format(new Date(job.preferred_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium capitalize">{job.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bids Section (only for job owner) */}
          {isCustomer && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Bids</h2>
              
<<<<<<< HEAD
              {job.bids?.length ? (
                <div className="space-y-6">
                  {job.bids.map((bid) => (
                    <Card key={bid.id} className={bid.status === 'accepted' ? 'border-green-500' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-donezo-teal text-white">
                                {getUserInitials(bid.provider?.user?.user_metadata?.full_name || 'SP')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{bid.provider?.user?.user_metadata?.full_name}</h3>
                              <p className="text-sm text-gray-500">
                                {bid.provider?.business_name ? (
                                  <>
                                    <Building className="inline-block w-3.5 h-3.5 mr-1" />
                                    {bid.provider.business_name}
                                  </>
                                ) : (
                                  <>
                                    <User className="inline-block w-3.5 h-3.5 mr-1" />
                                    Individual Provider
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">${bid.amount}</div>
                            {renderBidStatus(bid.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Estimated Hours</p>
                            <p className="font-medium">{bid.estimated_hours || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Hourly Rate</p>
                            <p className="font-medium">
                              {bid.estimated_hours ? `$${(bid.amount / bid.estimated_hours).toFixed(2)}/hr` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bid Date</p>
                            <p className="font-medium">{format(new Date(bid.created_at), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Proposal</p>
                          <p className="mt-1">{bid.description}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        {job.status === 'open' && bid.status === 'pending' ? (
                          <div className="flex gap-3 w-full">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate(`/messages/${bid.provider_id}`)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" /> Message
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button className="flex-1 bg-donezo-blue hover:bg-donezo-blue/90">
                                  <CheckCircle className="mr-2 h-4 w-4" /> Accept Bid
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Accept this bid?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will create a contract with {bid.provider?.user?.user_metadata?.full_name} for ${bid.amount}. 
                                    Other bids will be rejected, and this action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleAcceptBid(bid)}
                                    className="bg-donezo-blue hover:bg-donezo-blue/90"
                                  >
                                    Accept Bid
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : bid.status === 'accepted' ? (
                          <div className="w-full">
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => navigate(`/messages/${bid.provider_id}`)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" /> Message Provider
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full text-center text-gray-500 text-sm py-1">
                            This bid has been {bid.status}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">No bids yet</h3>
                  <p className="mt-1 text-gray-500">
                    Your job hasn't received any bids yet. Check back later.
                  </p>
                </div>
              )}
            </div>
          )}
=======
              {/* Bids section (for customers only or when job is completed) */}
              {(isCustomer || job.status === 'completed') && job.bids && job.bids.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Bids</CardTitle>
                    <CardDescription>
                      {job.bids.length} service provider{job.bids.length !== 1 && 's'} bid on this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.bids.map((bid) => (
                      <Card key={bid.id} className="shadow-sm">
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="h-10 w-10 rounded-full bg-donezo-blue text-white flex items-center justify-center font-semibold">
                                {bid.provider?.user?.user_metadata?.full_name?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {bid.provider?.business_name || bid.provider?.user?.user_metadata?.full_name || 'Service Provider'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {bid.provider?.years_experience} years experience
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">${bid.amount}</p>
                              {bid.estimated_hours && (
                                <p className="text-xs text-gray-500">
                                  Est. {bid.estimated_hours} hours (${(bid.amount / bid.estimated_hours).toFixed(2)}/hr)
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {bid.description && (
                          <CardContent className="py-2">
                            <p className="text-sm">{bid.description}</p>
                          </CardContent>
                        )}
                        <CardFooter className="py-3 flex justify-between">
                          <Link to={`/messages/${bid.provider_id}`}>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" /> Message
                            </Button>
                          </Link>
                          
                          {isCustomer && job.status === 'open' && bid.status === 'pending' && (
                            <Button 
                              className="bg-donezo-teal hover:bg-donezo-teal/90" 
                              size="sm"
                              onClick={() => handleAcceptBid(bid)}
                            >
                              <Check className="h-4 w-4 mr-2" /> Accept Bid
                            </Button>
                          )}
                          
                          {bid.status === 'accepted' && (
                            <Badge className="bg-green-500">Accepted</Badge>
                          )}
                          {bid.status === 'rejected' && (
                            <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right column: Status and actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    {job.status === 'open' && <Clock className="h-5 w-5 text-blue-500" />}
                    {job.status === 'in_progress' && <Clock className="h-5 w-5 text-amber-500" />}
                    {job.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {job.status === 'cancelled' && <XCircle className="h-5 w-5 text-red-500" />}
                    <span className="font-medium capitalize">{job.status.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    {job.status === 'open' && (
                      <p>This job is currently accepting bids from service providers.</p>
                    )}
                    {job.status === 'in_progress' && (
                      <p>A service provider has been selected and is working on this job.</p>
                    )}
                    {job.status === 'completed' && (
                      <p>This job has been completed successfully.</p>
                    )}
                    {job.status === 'cancelled' && (
                      <p>This job has been cancelled.</p>
                    )}
                    
                    {job.bids && (
                      <p className="mt-2">
                        <span className="font-medium">{job.bids.length}</span> bid{job.bids.length !== 1 && 's'} received
                      </p>
                    )}
                  </div>
                </CardContent>
                {isCustomer && job.status === 'open' && (
                  <CardFooter className="flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Edit Job
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel Job
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {isCustomer && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Customer Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>As the job owner, you can:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>View all bids on your job</li>
                      <li>Message service providers</li>
                      <li>Accept a bid to create a contract</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {!isCustomer && isProvider && job.status === 'open' && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Provider Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>As a service provider, you can:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Place a bid on this job</li>
                      <li>Message the customer</li>
                      <li>Propose your price and estimated hours</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)
        </div>

        {job && (
          <BidModal 
            isOpen={isBidModalOpen} 
            onClose={() => setIsBidModalOpen(false)} 
            job={job}
          />
        )}
      </main>
      <Footer />
<<<<<<< HEAD
=======
      
      {job && (
        <BidModal 
          isOpen={isBidModalOpen} 
          onClose={() => setIsBidModalOpen(false)}
          job={job}
        />
      )}
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Bid and Create Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this bid from {selectedBid?.provider?.business_name || 'the service provider'} for ${selectedBid?.amount}?
              
              <p className="mt-2">
                This will create a contract and place the payment amount in escrow until the job is completed.
                The amount will be held securely and only released to the provider when you confirm the job is complete.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAcceptBid}
              disabled={createContractMutation.isPending}
            >
              {createContractMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Accept Bid"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
>>>>>>> parent of 64793a0 (feat: Implement job bidding and AI description generation)
    </div>
  );
};

export default JobDetails;
