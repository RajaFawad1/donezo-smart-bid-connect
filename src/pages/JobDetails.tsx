
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useContracts } from '@/hooks/useContracts';
import { useBids } from '@/hooks/useBids';
import { useJobImages } from '@/hooks/useJobImages';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BidModal from '@/components/bids/BidModal';
import BidsList from '@/components/bids/BidsList';
import JobImageUploader from '@/components/jobs/JobImageUploader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow, format } from 'date-fns';
import { Bid, JobImage } from '@/types';
import { 
  ChevronLeft,
  Info, 
  Check, 
  X, 
  MessageSquare, 
  Loader2,
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useJobById } = useJobs();
  const { useCreateContract } = useContracts();
  const { useBidsByJobId } = useBids();
  
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showJobImageUploaders, setShowJobImageUploaders] = useState(false);
  
  const { data: job, isLoading: jobLoading } = useJobById(jobId);
  // Use the useBidsByJobId hook to directly fetch bids for more reliable data
  const { data: bidsList = [], isLoading: bidsLoading } = useBidsByJobId(jobId);
  const createContractMutation = useCreateContract();

  // Make sure we're using the bids from the hook, not from the job object
  const bids = bidsList.length > 0 ? bidsList : (job?.bids || []);
  console.log("Job bids:", bids);

  const isCustomer = user?.id === job?.customer_id;
  const isProvider = user?.user_metadata?.user_type === 'provider';
  const hasUserBidded = bids?.some(bid => bid.provider_id === user?.id);
  const isPremiumPartner = isProvider && user?.user_metadata?.is_premium_partner;
  
  // Get contract ID if job is in progress or completed
  const activeContract = job?.status === 'in_progress' || job?.status === 'completed' 
    ? bids.find(bid => bid.status === 'accepted')?.id 
    : null;

  // Fetch job images if there's an active contract
  const { useContractBeforeImages, useContractAfterImages } = useJobImages();
  const { data: beforeImages = [] } = useContractBeforeImages(activeContract);
  const { data: afterImages = [] } = useContractAfterImages(activeContract);
  
  const handleAcceptBid = (bid: Bid) => {
    setSelectedBid(bid);
    setConfirmDialogOpen(true);
  };

  const confirmAcceptBid = async () => {
    if (!selectedBid || !job) return;
    
    try {
      setPaymentProcessing(true);
      
      // Here we would integrate with a payment provider to place funds in escrow
      // For now, we'll simulate the escrow by just creating the contract
      
      await createContractMutation.mutateAsync({
        job_id: job.id,
        bid_id: selectedBid.id,
        customer_id: job.customer_id,
        provider_id: selectedBid.provider_id,
        amount: selectedBid.amount,
        status: 'in_progress',
        payment_status: 'in_escrow', // This indicates funds are in escrow
        start_date: new Date().toISOString(),
      });
      
      // Update the job status to in_progress
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', job.id);
        
      // Update the bid status to accepted
      await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', selectedBid.id);
      
      // Update any other pending bids to rejected
      await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('job_id', job.id)
        .neq('id', selectedBid.id)
        .eq('status', 'pending');
        
      setConfirmDialogOpen(false);
      setPaymentProcessing(false);
      
      // Redirect to dashboard after creating contract
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating contract:', error);
      setConfirmDialogOpen(false);
      setPaymentProcessing(false);
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

  // Calculate time remaining for emergency response (24h from posting)
  const getEmergencyTimeRemaining = () => {
    if (!job) return null;
    
    const emergencyWindow = 24 * 60 * 60 * 1000; // 24 hours in ms
    const jobCreated = new Date(job.created_at).getTime();
    const current = new Date().getTime();
    const elapsed = current - jobCreated;
    
    if (elapsed > emergencyWindow) {
      return 0; // Emergency window expired
    }
    
    return Math.max(0, Math.floor((emergencyWindow - elapsed) / (60 * 60 * 1000))); // remaining hours
  };
  
  const emergencyHoursRemaining = job?.is_emergency ? getEmergencyTimeRemaining() : null;

  if (jobLoading) {
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

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-red-500">Error</h1>
            <p className="mt-4 text-gray-600">Could not find job details. The job might not exist or you may not have permission to view it.</p>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button and job header */}
          <div className="mb-6">
            <Button 
              variant="outline"
              className="mb-4" 
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex items-center mt-2 space-x-2">
                  <p className="text-gray-500 text-sm">{job.category?.name}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-gray-500 text-sm">
                    Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {job.is_emergency && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">Emergency</Badge>
                )}
                {job.is_fix_now && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">Fix Now</Badge>
                )}
                {getStatusBadge(job.status)}
              </div>
            </div>
          </div>
          
          {/* Emergency countdown banner */}
          {job.is_emergency && job.status === 'open' && emergencyHoursRemaining !== null && (
            <div className={`mb-6 rounded-md p-4 flex items-center ${emergencyHoursRemaining > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`h-6 w-6 mr-3 ${emergencyHoursRemaining > 0 ? 'text-red-600' : 'text-gray-500'}`} />
              <div>
                <h3 className={`font-medium ${emergencyHoursRemaining > 0 ? 'text-red-900' : 'text-gray-700'}`}>
                  {emergencyHoursRemaining > 0 
                    ? `Emergency Service: ${emergencyHoursRemaining} hours remaining for priority response` 
                    : "Emergency window has expired"}
                </h3>
                <p className={`text-sm ${emergencyHoursRemaining > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                  {emergencyHoursRemaining > 0 
                    ? "Providers will get bonus rates for responding quickly to this emergency job."
                    : "This emergency job is still open but no longer qualifies for expedited service."}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Job details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <h3 className="font-medium mb-1">Budget</h3>
                      <p className="text-gray-700">${job.budget_min} - ${job.budget_max}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Location</h3>
                      <p className="text-gray-700">{job.location || 'Not specified'}</p>
                    </div>
                    {job.preferred_date && (
                      <div>
                        <h3 className="font-medium mb-1">Preferred Date</h3>
                        <p className="text-gray-700">{new Date(job.preferred_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                {isProvider && job.status === 'open' && (
                  <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    {!hasUserBidded ? (
                      <>
                        <Button 
                          className="w-full sm:w-auto bg-donezo-teal hover:bg-donezo-teal/90"
                          onClick={() => setIsBidModalOpen(true)}
                        >
                          Place Bid
                        </Button>
                        
                        {/* Show premium provider fast-track option */}
                        {(job.is_emergency || job.is_fix_now) && isPremiumPartner && (
                          <Button 
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600"
                            onClick={() => setIsBidModalOpen(true)}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Fast-Track Bid (Premium)
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        You have already bid on this job
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
              
              {/* Bids section */}
              {job.status !== 'cancelled' && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Bids</CardTitle>
                    <CardDescription>
                      {bids.length} service provider{bids.length !== 1 && 's'} bid on this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bidsLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-donezo-blue"></div>
                      </div>
                    ) : (
                      <BidsList 
                        bids={bids} 
                        showDetailedView={true}
                        onAcceptBid={isCustomer && job.status === 'open' ? handleAcceptBid : undefined}
                        highlightEmergency={job.is_emergency}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Job images section - for in-progress or completed jobs */}
              {(job.status === 'in_progress' || job.status === 'completed') && activeContract && (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Job Progress Images</h2>
                    {!showJobImageUploaders && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowJobImageUploaders(!showJobImageUploaders)}
                        className="flex items-center"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Manage Photos
                      </Button>
                    )}
                  </div>
                  
                  {showJobImageUploaders ? (
                    // Photo management view
                    <div className="space-y-6">
                      <JobImageUploader 
                        contractId={activeContract} 
                        imageType="before" 
                        existingImages={beforeImages}
                      />
                      
                      <JobImageUploader 
                        contractId={activeContract} 
                        imageType="after" 
                        existingImages={afterImages}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowJobImageUploaders(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Photo gallery view
                    <div className="space-y-6">
                      {(beforeImages.length > 0 || afterImages.length > 0) ? (
                        <>
                          {beforeImages.length > 0 && (
                            <div>
                              <h3 className="font-medium mb-2">Before Images</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {beforeImages.map((image) => (
                                  <div key={image.id} className="relative group">
                                    <img 
                                      src={image.image_url} 
                                      alt={image.description || "Before image"}
                                      className="w-full h-32 object-cover rounded-md"
                                    />
                                    {image.description && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs">
                                        {image.description}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {afterImages.length > 0 && (
                            <div>
                              <h3 className="font-medium mb-2">After Images</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {afterImages.map((image) => (
                                  <div key={image.id} className="relative group">
                                    <img 
                                      src={image.image_url} 
                                      alt={image.description || "After image"}
                                      className="w-full h-32 object-cover rounded-md"
                                    />
                                    {image.description && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs">
                                        {image.description}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 font-medium text-gray-900">No images yet</h3>
                          <p className="text-gray-500 mt-1">
                            No before/after photos have been uploaded for this job
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                    
                    {bids && (
                      <p className="mt-2">
                        <span className="font-medium">{bids.length}</span> bid{bids.length !== 1 && 's'} received
                      </p>
                    )}
                  </div>
                </CardContent>
                
                {/* Emergency service info */}
                {job.is_emergency && (
                  <div className="px-6 py-3 border-t border-gray-200">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm text-red-800">Emergency Service</h4>
                        <p className="text-xs text-red-600 mt-1">
                          This job has been marked as an emergency and will receive priority attention
                          from service providers.
                        </p>
                        
                        {emergencyHoursRemaining !== null && emergencyHoursRemaining > 0 && (
                          <div className="mt-2 flex items-center text-xs font-medium text-red-800">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {emergencyHoursRemaining} hours remaining in emergency window
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Fix now service info */}
                {job.is_fix_now && (
                  <div className="px-6 py-3 border-t border-gray-200">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-purple-500 mt-0.5 mr-2 shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm text-purple-800">Fix Now Priority</h4>
                        <p className="text-xs text-purple-600 mt-1">
                          This job is using the Fix Now service and will be matched with premium
                          service providers for faster resolution.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
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
                      {isPremiumPartner && (job.is_emergency || job.is_fix_now) && (
                        <li className="text-amber-600 font-medium">You qualify for premium partner fast-track bidding</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
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
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing payment...
                </>
              ) : (
                "Accept Bid & Pay to Escrow"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobDetails;
