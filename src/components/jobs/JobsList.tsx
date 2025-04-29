import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle, Info, MessageSquare,MapPin,Calendar } from 'lucide-react';
import BidModal from '@/components/bids/BidModal';
import JobDetailsModal from './JobDetailsModal';

interface JobsListProps {
  jobs: Job[];
  showBidButton?: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

const JobsList = ({ jobs, showBidButton = false, isLoading = false, error = null }: JobsListProps) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenBidModal = (job: Job) => {
    setSelectedJob(job);
    setIsBidModalOpen(true);
  };

  const handleOpenDetailsModal = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'blue', text: 'Open' },
      in_progress: { color: 'amber', text: 'In Progress' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray', text: status };
    
    return (
      <Badge 
        variant="outline" 
        className={`bg-${config.color}-100 text-${config.color}-800 hover:bg-${config.color}-100`}
      >
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-donezo-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading jobs</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {showBidButton 
            ? "There are no open jobs available at the moment." 
            : "You haven't posted any jobs yet."}
        </p>
        {!showBidButton && (
          <div className="mt-6">
            <Button 
              onClick={() => document.getElementById("post-job-button")?.click()}
              className="bg-donezo-blue hover:bg-donezo-blue/90"
            >
              Post Your First Job
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <CardTitle className="text-lg sm:text-xl line-clamp-2">{job.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {job.is_emergency && (
                  <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Emergency
                  </Badge>
                )}
                {job.is_fix_now && (
                  <Badge className="bg-purple-500 hover:bg-purple-600">Fix Now</Badge>
                )}
                {getStatusBadge(job.status)}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap gap-x-2">
             
              <span>{job.category?.name}</span>
              <span>•</span>
              <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              {job.bids_count !== undefined && job.bids_count > 0 && (
                <>
                  <span>•</span>
                  <span>{job.bids_count} bid{job.bids_count !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 line-clamp-2">{job.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.budget_min && job.budget_max && (
                <Badge variant="secondary" className="text-green-700">
                  Budget: ${job.budget_min} - ${job.budget_max}
                </Badge>
              )}
              {job.location && (
                <Badge variant="secondary" className="text-blue-700">
                  <MapPin className="h-3 w-3 mr-1" /> {job.location}
                </Badge>
              )}
              {job.preferred_date && (
                <Badge variant="secondary" className="text-purple-700">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(job.preferred_date).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => handleOpenDetailsModal(job)}
              className="flex-1 min-w-[120px]"
            >
              <Info className="mr-2 h-4 w-4" /> Details
            </Button>
            
            {showBidButton && job.status === 'open' ? (
              <Button 
                onClick={() => handleOpenBidModal(job)}
                className="bg-donezo-teal hover:bg-donezo-teal/90 flex-1 min-w-[120px]"
              >
                Place Bid
              </Button>
            ) : (
              <Link to={`/jobs/${job.id}`} className="flex-1 min-w-[120px]">
                <Button className="bg-donezo-blue hover:bg-donezo-blue/90 w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Manage
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}

      {selectedJob && (
        <>
          <BidModal 
            isOpen={isBidModalOpen}
            onClose={() => setIsBidModalOpen(false)}
            job={selectedJob}
          />
          <JobDetailsModal 
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            job={selectedJob}
            showBidButton={showBidButton}
            onBid={() => {
              setIsDetailsModalOpen(false);
              handleOpenBidModal(selectedJob);
            }}
          />
        </>
      )}
    </div>
  );
};

export default JobsList;