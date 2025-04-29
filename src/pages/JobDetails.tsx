

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useContracts } from '@/hooks/useContracts';
import { useBids } from '@/hooks/useBids';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BidModal from '@/components/bids/BidModal';
import BidsList from '@/components/bids/BidsList';
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
import { formatDistanceToNow } from 'date-fns';
import { Bid } from '@/types';
import { 
  ChevronLeft,
  Info, 
  Check, 
  X, 
  MessageSquare, 
  Loader2,
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useJobById } = useJobs();
  const { useCreateContract } = useContracts();
  const { useBidsByJobId } = useBids();
  
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const { data: job, isLoading: jobLoading } = useJobById(jobId);
  const { data: bids = [], isLoading: bidsLoading } = useBidsByJobId(jobId);
  const createContractMutation = useCreateContract();

  const isCustomer = user?.id === job?.customer_id;
  const isProvider = user?.user_metadata?.user_type === 'provider';
  const hasUserBidded = bids?.some(bid => bid.provider_id === user?.id);

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
                  <CardFooter>
                    {!hasUserBidded ? (
                      <Button 
                        className="w-full bg-donezo-teal hover:bg-donezo-teal/90"
                        onClick={() => setIsBidModalOpen(true)}
                      >
                        Place Bid
                      </Button>
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
                      />
                    )}
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
                    
                    {bids && (
                      <p className="mt-2">
                        <span className="font-medium">{bids.length}</span> bid{bids.length !== 1 && 's'} received
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
