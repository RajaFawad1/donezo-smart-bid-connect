
import { useState } from 'react';
import { Contract } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useContracts } from '@/hooks/useContracts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  LinkIcon, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Info,
  Loader2,
  Wallet,
  MapPin,
  CreditCard
} from 'lucide-react';

interface ContractsListProps {
  contracts: Contract[];
}

const ContractsList = ({ contracts }: ContractsListProps) => {
  const { user } = useAuth();
  const { useReleasePayment, useStripeCheckout } = useContracts();
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [trackLocationModalOpen, setTrackLocationModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  
  const releasePaymentMutation = useReleasePayment();
  const stripeCheckoutMutation = useStripeCheckout();

  const handleReleasePayment = (contractId: string) => {
    setSelectedContractId(contractId);
    setReleaseDialogOpen(true);
  };

  const handleStripeCheckout = (contractId: string) => {
    stripeCheckoutMutation.mutate(contractId);
  };

  const handleTrackLocation = (providerId: string) => {
    setSelectedProviderId(providerId);
    setTrackLocationModalOpen(true);
  };

  const confirmReleasePayment = async () => {
    if (selectedContractId) {
      try {
        await releasePaymentMutation.mutateAsync(selectedContractId);
      } catch (error) {
        console.error('Error releasing payment:', error);
      } finally {
        setReleaseDialogOpen(false);
        setSelectedContractId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>;
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'not_paid':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Not Paid</Badge>;
      case 'in_escrow':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Escrow</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No contracts found</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have any active contracts yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{contract.job?.title || 'Contract'}</CardTitle>
                <div className="flex space-x-2">
                  {getStatusBadge(contract.status)}
                  {getPaymentStatusBadge(contract.payment_status)}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Created {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Contract Amount</p>
                  <p className="font-semibold">${contract.amount}</p>
                  {contract.payment_status === 'not_paid' && contract.status !== 'completed' && (
                    <p className="text-xs text-orange-600 mt-1">
                      Payment required to start service
                    </p>
                  )}
                  {contract.payment_status === 'in_escrow' && (
                    <p className="text-xs text-blue-600 mt-1">
                      Amount held in escrow until job completion
                    </p>
                  )}
                  {contract.payment_status === 'paid' && (
                    <p className="text-xs text-green-600 mt-1">
                      Payment released (10% platform fee applied)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{contract.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              {contract.start_date && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
                  </div>
                  {contract.end_date && (
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{new Date(contract.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 pt-0">
              <Link to={`/jobs/${contract.job_id}`} className="flex-1 min-w-[120px]">
                <Button variant="outline" className="w-full">
                  <LinkIcon className="h-4 w-4 mr-2" /> Job Details
                </Button>
              </Link>
              <Link to={`/messages/${contract.customer_id === user?.id ? contract.provider_id : contract.customer_id}`} className="flex-1 min-w-[120px]">
                <Button className="w-full bg-donezo-blue hover:bg-donezo-blue/90">
                  <MessageSquare className="h-4 w-4 mr-2" /> Message
                </Button>
              </Link>

              {/* Payment button for customers when contract is in not_paid status */}
              {user?.id === contract.customer_id && 
                contract.status !== 'completed' && 
                contract.payment_status === 'not_paid' && (
                <Button 
                  className="flex-1 min-w-[120px] bg-donezo-teal hover:bg-donezo-teal/90"
                  onClick={() => handleStripeCheckout(contract.id)}
                  disabled={stripeCheckoutMutation.isPending}
                >
                  {stripeCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                    </>
                  )}
                </Button>
              )}
              
              {/* Show release payment button for customers when contract is in_progress and payment is in escrow */}
              {user?.id === contract.customer_id && 
                contract.status === 'in_progress' && 
                contract.payment_status === 'in_escrow' && (
                <Button 
                  className="flex-1 min-w-[120px] bg-donezo-teal hover:bg-donezo-teal/90"
                  onClick={() => handleReleasePayment(contract.id)}
                  disabled={releasePaymentMutation.isPending}
                >
                  {releasePaymentMutation.isPending && selectedContractId === contract.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" /> Release Payment
                    </>
                  )}
                </Button>
              )}
              
              {/* Track location button for customers with in-progress contracts */}
              {user?.id === contract.customer_id && 
                contract.status === 'in_progress' && 
                contract.payment_status !== 'not_paid' && (
                <Button 
                  className="flex-1 min-w-[120px]"
                  variant="outline"
                  onClick={() => handleTrackLocation(contract.provider_id)}
                >
                  <MapPin className="h-4 w-4 mr-2" /> Track Provider
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release payment for this job? This will send the payment to the service provider (minus 10% platform fee) and mark the contract as complete. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReleasePayment}>
              Release Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Location Tracking Modal */}
      <AlertDialog open={trackLocationModalOpen} onOpenChange={setTrackLocationModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Provider Location</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="py-4">
                <div className="bg-gray-200 h-64 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Provider's location will appear here</p>
                  {/* In a real app, this would show a map with the provider's location */}
                </div>
                <p className="mt-4 text-sm">
                  The service provider's location will be updated in real-time when they're en route to your location.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setTrackLocationModalOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContractsList;
