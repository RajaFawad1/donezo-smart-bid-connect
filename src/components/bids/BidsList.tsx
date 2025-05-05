
import React from 'react';
import { Bid } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface BidsListProps {
  bids: Bid[];
  showDetailedView?: boolean;
  onAcceptBid?: (bid: Bid) => void;
  highlightEmergency?: boolean;
  onJobClick?: (jobId: string) => void;
}

const BidsList = ({ bids, showDetailedView = false, onAcceptBid, highlightEmergency = false, onJobClick }: BidsListProps) => {
  const { user } = useAuth();

  if (!bids || bids.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-gray-50">
        <p className="text-gray-500">No bids have been placed yet.</p>
      </div>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const renderBid = (bid: Bid) => {
    const bidderName = bid.provider?.business_name || 'Service Provider';
    
    // Fix the TypeScript error by safely accessing the is_premium_partner property
    // First check if provider exists, then if provider.user exists, then use optional chaining for user_metadata
    const isPremiumPartner = bid.provider?.is_premium_partner || false;
    
    const isCustomer = user?.id !== bid.provider_id;

    return (
      <Card 
        key={bid.id} 
        className={`mb-4 ${bid.status === 'accepted' ? 'border-green-400' : ''}`}
      >
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{bidderName}</h3>
                {isPremiumPartner && (
                  <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">Premium Partner</Badge>
                )}
                <span className="ml-2">{getStatusBadge(bid.status)}</span>
              </div>
              
              <p className="text-sm text-gray-500 mt-1">
                Bid placed {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
              </p>
              
              {showDetailedView && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{bid.description}</p>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold text-lg">${bid.amount}</p>
              <p className="text-sm text-gray-500">Est. {bid.estimated_hours} {bid.estimated_hours === 1 ? 'hour' : 'hours'}</p>
            </div>
          </div>

          {showDetailedView && (
            <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
              {isCustomer ? (
                <div className="flex flex-wrap gap-2">
                  {bid.provider_id && (
                    <Link to={`/messages/${bid.provider_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-1 h-4 w-4" /> Message Provider
                      </Button>
                    </Link>
                  )}
                  
                  {onAcceptBid && bid.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="bg-donezo-teal hover:bg-donezo-teal/90"
                      onClick={() => onAcceptBid(bid)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" /> Accept Bid
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  {getStatusIcon(bid.status)}
                  <span className="ml-1 text-sm capitalize text-gray-700">
                    {bid.status === 'pending' 
                      ? 'Waiting for customer response' 
                      : bid.status === 'accepted' 
                        ? 'Your bid was accepted!' 
                        : 'Your bid was rejected'}
                  </span>
                </div>
              )}
              
              {highlightEmergency && isPremiumPartner && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  Premium Partner Fast Response
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {bids.map(renderBid)}
    </div>
  );
};

export default BidsList;
