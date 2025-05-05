
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contract');
  const { toast } = useToast();

  useEffect(() => {
    // Show success toast
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed and held in escrow until job completion.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully and is being held in escrow. 
              The funds will be released to the service provider once the job is completed.
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-donezo-blue hover:bg-donezo-blue/90"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
              {contractId && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/jobs/${contractId}`)}
                >
                  View Contract Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
