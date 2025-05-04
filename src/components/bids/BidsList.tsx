
import { useState } from 'react';
import { Bid } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { LinkIcon, ClockIcon, CheckCircle, XCircle, Info, MessageSquare, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BidsListProps {
  bids: Bid[];
  showDetailedView?: boolean;
  onAcceptBid?: (bid: Bid) => void;
  highlightEmergency?: boolean;
}

const BidsList = ({ bids, showDetailedView = false, onAcceptBid, highlightEmergency }: BidsListProps) => {
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
        <p className="mt-1 text-sm text-gray-500">
          {showDetailedView 
            ? "This job hasn't received any bids yet." 
            : "You haven't placed any bids yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <Card key={bid.id} className={`overflow-hidden ${highlightEmergency && bid.status === 'pending' ? 'border-red-300' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{bid.job?.title || 'Untitled Job'}</CardTitle>
                <p className="text-sm text-gray-500">
                  Bid placed {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {highlightEmergency && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Emergency
                  </Badge>
                )}
                {getStatusBadge(bid.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bid Amount</p>
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
                <p className="text-sm text-gray-500">Proposal</p>
                <p className="text-sm mt-1">{bid.description}</p>
              </div>
            )}

            {showDetailedView && bid.provider && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-donezo-blue text-white flex items-center justify-center font-semibold">
                    {bid.provider?.business_name?.charAt(0) || 
                     bid.provider?.user?.user_metadata?.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {bid.provider?.business_name || 
                       bid.provider?.user?.user_metadata?.full_name || 'Service Provider'}
                    </p>
                    {bid.provider?.years_experience && (
                      <p className="text-xs text-gray-500">
                        {bid.provider.years_experience} years experience
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            {!showDetailedView ? (
              <Link to={`/jobs/${bid.job_id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <LinkIcon className="h-4 w-4 mr-2" /> View Job Details
                </Button>
              </Link>
            ) : (
              <div className="flex w-full space-x-2">
                {bid.provider && (
                  <Link to={`/messages/${bid.provider_id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" /> Message Provider
                    </Button>
                  </Link>
                )}
                {bid.status === 'pending' && onAcceptBid && (
                  <Button 
                    onClick={() => onAcceptBid(bid)} 
                    className="flex-1 bg-donezo-teal hover:bg-donezo-teal/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept Bid
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BidsList;
