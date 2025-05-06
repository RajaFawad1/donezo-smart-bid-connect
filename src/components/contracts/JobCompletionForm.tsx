
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { Contract } from '@/types';
import { Loader2, CheckCircle } from 'lucide-react';
import JobImageUploader from '@/components/jobs/JobImageUploader';

interface JobCompletionFormProps {
  contract: Contract;
  onCompleted?: () => void;
}

const JobCompletionForm: React.FC<JobCompletionFormProps> = ({ 
  contract, 
  onCompleted 
}) => {
  const [completionNote, setCompletionNote] = useState('');
  const [hasUploaded, setHasUploaded] = useState(false);
  const { useJobImagesByContract } = useJobImages();
  const { useMarkJobCompleted } = useContracts();
  const { toast } = useToast();
  
  const { data: jobImages = [] } = useJobImagesByContract(contract.id);
  const markCompletedMutation = useMarkJobCompleted();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const afterImages = jobImages.filter(img => img.image_type === 'after');
    
    if (afterImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one photo of the completed work",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await markCompletedMutation.mutateAsync({
        contractId: contract.id,
        message: completionNote
      });
      
      if (onCompleted) {
        onCompleted();
      }
    } catch (error) {
      console.error("Error marking job as completed:", error);
    }
  };

  const handleImagesUpdated = () => {
    setHasUploaded(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Request Job Completion</h3>
        <p className="text-sm text-gray-500">
          Upload photos of your completed work and request payment release.
        </p>
      </div>

      <JobImageUploader
        contractId={contract.id}
        imageType="after"
        onImagesUpdated={handleImagesUpdated}
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="completion-note" className="block text-sm font-medium text-gray-700 mb-1">
            Completion Note (Optional)
          </label>
          <Textarea
            id="completion-note"
            placeholder="Add any notes about the completed work..."
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
            className="h-24"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={markCompletedMutation.isPending}
        >
          {markCompletedMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Job as Complete
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default JobCompletionForm;
