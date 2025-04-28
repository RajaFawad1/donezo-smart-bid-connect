
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { AlertTriangle, MapPin, Clock, Calendar, DollarSign } from 'lucide-react';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  showBidButton?: boolean;
  onBid?: () => void;
}

const JobDetailsModal = ({ 
  isOpen, 
  onClose, 
  job,
  showBidButton = false,
  onBid 
}: JobDetailsModalProps) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">{job.title}</DialogTitle>
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
          <DialogDescription>
            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })} in {job.category?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{job.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Budget
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                ${job.budget_min} - ${job.budget_max}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> Location
              </h3>
              <p className="mt-1 text-sm text-gray-900">{job.location || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {job.preferred_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Preferred Date
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(job.preferred_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Status
              </h3>
              <p className="mt-1 text-sm text-gray-900 capitalize">{job.status.replace('_', ' ')}</p>
            </div>
          </div>
          
          {(job.is_emergency || job.is_fix_now) && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">
                  {job.is_emergency && 'Emergency Service'}
                  {job.is_emergency && job.is_fix_now && ' - '}
                  {job.is_fix_now && 'Fix Now Priority'}
                </p>
                <p className="text-amber-700 mt-0.5">
                  {job.is_emergency && 'This job requires urgent attention.'}
                  {job.is_emergency && job.is_fix_now && ' '}
                  {job.is_fix_now && 'Customer is willing to pay premium for fast service.'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {showBidButton && job.status === 'open' && onBid && (
            <Button className="bg-donezo-teal hover:bg-donezo-teal/90" onClick={onBid}>
              Place Bid
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
