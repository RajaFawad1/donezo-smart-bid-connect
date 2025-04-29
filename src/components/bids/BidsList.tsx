
import { useState } from 'react';
import { Bid } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { LinkIcon, ClockIcon, CheckCircle, XCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BidsListProps {
  bids: Bid[];
}

const BidsList = ({ bids }: BidsListProps) => {
  const getStatusBadge = (status: string) => {
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

  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No bids found</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't placed any bids yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <Card key={bid.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{bid.job?.title || 'Untitled Job'}</CardTitle>
                <p className="text-sm text-gray-500">
                  Bid placed {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                </p>
              </div>
              {getStatusBadge(bid.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Your Bid</p>
                <p className="font-semibold">${bid.amount}</p>
              </div>
              {bid.estimated_hours && (
                <div>
                  <p className="text-sm text-gray-500">Est. Hours</p>
                  <p className="font-semibold">{bid.estimated_hours}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Hourly Rate</p>
                <p className="font-semibold">
                  {bid.estimated_hours ? `$${(bid.amount / bid.estimated_hours).toFixed(2)}/hr` : 'N/A'}
                </p>
              </div>
            </div>
            {bid.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Your Proposal</p>
                <p className="text-sm mt-1">{bid.description}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to={`/jobs/${bid.job_id}`} className="w-full">
              <Button variant="outline" className="w-full">
                <LinkIcon className="h-4 w-4 mr-2" /> View Job Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BidsList;
