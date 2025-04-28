
import { Contract } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { LinkIcon, Clock, CheckCircle, XCircle, Info, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContractsListProps {
  contracts: Contract[];
}

const ContractsList = ({ contracts }: ContractsListProps) => {
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
          <CardFooter className="flex justify-between pt-0">
            <Link to={`/jobs/${contract.job_id}`} className="w-1/2 pr-1">
              <Button variant="outline" className="w-full">
                <LinkIcon className="h-4 w-4 mr-2" /> Job Details
              </Button>
            </Link>
            <Link to={`/messages`} className="w-1/2 pl-1">
              <Button className="w-full bg-donezo-blue hover:bg-donezo-blue/90">
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ContractsList;
