
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Contract, JobImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Loader2, Calendar, ArrowRight } from 'lucide-react';
import JobImageUploader from '@/components/jobs/JobImageUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useJobImages } from '@/hooks/useJobImages';
import LocationTracker from '@/components/LocationTracker';

interface ContractDetailsProps {
  contract: Contract;
  onReleasePayment: (contractId: string) => void;
  onUpdateStatus: (contractId: string, status: string) => void;
  isReleasing: boolean;
  isUpdating: boolean;
  onCheckout: (contractId: string) => void;
  isCheckingOut: boolean;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onReleasePayment,
  onUpdateStatus,
  isReleasing,
  isUpdating,
  onCheckout,
  isCheckingOut
}) => {
  const { user } = useAuth();
  const { useContractBeforeImages, useContractAfterImages } = useJobImages();
  const [showImageUploader, setShowImageUploader] = useState(false);
  
  const { data: beforeImages = [] } = useContractBeforeImages(contract.id);
  const { data: afterImages = [] } = useContractAfterImages(contract.id);
  
  const isProvider = user?.id === contract.provider_id;
  const isCustomer = user?.id === contract.customer_id;
  
  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'not_paid':
        return <Badge variant="outline">Not Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleImagesUpdated = () => {
    // Refresh image data
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            Contract: {contract.job?.title}
          </div>
          <div className="flex space-x-2">
            {getStatusBadge(contract.status || 'pending')}
            {getPaymentStatusBadge(contract.payment_status || 'not_paid')}
          </div>
        </CardTitle>
        <CardDescription>
          Created on {formatDate(contract.created_at)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount</h3>
            <p className="text-lg font-semibold">${contract.amount}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p>{formatDate(contract.start_date)}</p>
              {contract.end_date && (
                <>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <p>{formatDate(contract.end_date)}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Payment section for customer */}
        {isCustomer && contract.payment_status === 'not_paid' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-md font-medium text-blue-800 mb-2">Payment Required</h3>
            <p className="text-sm text-blue-700 mb-4">
              Payment is required to start this contract. Once payment is made, the service provider can begin work.
            </p>
            <Button 
              onClick={() => onCheckout(contract.id)} 
              disabled={isCheckingOut}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ${contract.amount} to Escrow</>
              )}
            </Button>
          </div>
        )}
        
        {/* Location tracker */}
        <LocationTracker 
          contractId={contract.id} 
          providerId={contract.provider_id || ''} 
          isProvider={isProvider} 
        />
        
        {/* Work completion section for provider */}
        {isProvider && contract.status === 'in_progress' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-md font-medium text-blue-800 mb-2">Mark Work as Complete</h3>
            <p className="text-sm text-blue-700 mb-4">
              Once you've completed the work, upload photos and mark the contract as complete.
            </p>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => setShowImageUploader(!showImageUploader)}
                variant="outline"
              >
                {showImageUploader ? 'Hide Image Uploader' : 'Upload Completion Photos'}
              </Button>
              
              <Button 
                onClick={() => onUpdateStatus(contract.id, 'completed')}
                disabled={isUpdating || afterImages.length === 0}
                className={afterImages.length === 0 ? "bg-gray-400 cursor-not-allowed" : ""}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Mark as Completed</>
                )}
              </Button>
              {afterImages.length === 0 && (
                <p className="text-xs text-red-600">
                  Please upload at least one photo to document the completed work
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Payment release section for customer */}
        {isCustomer && contract.status === 'completed' && contract.payment_status !== 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-md font-medium text-green-800 mb-2">Work Completed</h3>
            <p className="text-sm text-green-700 mb-4">
              The service provider has marked this job as complete. Please review the work and release payment.
            </p>
            <Button 
              onClick={() => onReleasePayment(contract.id)}
              disabled={isReleasing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isReleasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Release Payment</>
              )}
            </Button>
          </div>
        )}
        
        {/* Image uploaders */}
        {showImageUploader && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <JobImageUploader
              contractId={contract.id}
              imageType="before"
              existingImages={beforeImages}
              onImagesUpdated={handleImagesUpdated}
            />
            <JobImageUploader
              contractId={contract.id}
              imageType="after"
              existingImages={afterImages}
              onImagesUpdated={handleImagesUpdated}
            />
          </div>
        )}
        
        {/* Image preview section */}
        {(beforeImages.length > 0 || afterImages.length > 0) && !showImageUploader && (
          <div className="space-y-4">
            <h3 className="font-medium">Job Documentation</h3>
            
            {beforeImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Before Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {beforeImages.map((image: JobImage) => (
                    <a 
                      key={image.id} 
                      href={image.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={image.image_url} 
                        alt={image.description || "Before image"} 
                        className="h-24 w-full object-cover rounded-md hover:opacity-80 transition"
                      />
                      {image.description && (
                        <p className="text-xs truncate mt-1">{image.description}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {afterImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">After Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {afterImages.map((image: JobImage) => (
                    <a 
                      key={image.id} 
                      href={image.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={image.image_url} 
                        alt={image.description || "After image"} 
                        className="h-24 w-full object-cover rounded-md hover:opacity-80 transition"
                      />
                      {image.description && (
                        <p className="text-xs truncate mt-1">{image.description}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowImageUploader(true)}
            >
              Manage Photos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractDetails;
