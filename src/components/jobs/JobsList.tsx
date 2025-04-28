
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle, Info, MessageSquare } from 'lucide-react';
import BidModal from '@/components/bids/BidModal';
import JobDetailsModal from './JobDetailsModal';

interface JobsListProps {
  jobs: Job[];
  showBidButton?: boolean;
}

const JobsList = ({ jobs, showBidButton = false }: JobsListProps) => {
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
        <Card key={job.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{job.title}</CardTitle>
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
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <p>{job.category?.name}</p>
              <span className="mx-2">•</span>
              <p>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
              {job.bids_count !== undefined && (
                <>
                  <span className="mx-2">•</span>
                  <p>{job.bids_count} bid{job.bids_count !== 1 ? 's' : ''}</p>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 line-clamp-2">{job.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.budget_min && job.budget_max && (
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Budget: ${job.budget_min} - ${job.budget_max}
                </span>
              )}
              {job.location && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  Location: {job.location}
                </span>
              )}
              {job.preferred_date && (
                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                  Preferred Date: {new Date(job.preferred_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              onClick={() => handleOpenDetailsModal(job)}
            >
              <Info className="mr-2 h-4 w-4" /> View Details
            </Button>
            
            {showBidButton && job.status === 'open' ? (
              <Button 
                onClick={() => handleOpenBidModal(job)}
                className="bg-donezo-teal hover:bg-donezo-teal/90"
              >
                Place Bid
              </Button>
            ) : (
              <Link to={`/jobs/${job.id}`}>
                <Button className="bg-donezo-blue hover:bg-donezo-blue/90">
                  <MessageSquare className="mr-2 h-4 w-4" /> Manage Job
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
