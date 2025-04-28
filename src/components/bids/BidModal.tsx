
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Job } from '@/types';
import { useBids } from '@/hooks/useBids';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, DollarSign } from 'lucide-react';

const formSchema = z.object({
  amount: z.number()
    .min(1, { message: 'Bid amount must be at least $1' }),
  estimated_hours: z.number()
    .min(0.5, { message: 'Estimated hours must be at least 0.5' })
    .optional(),
  description: z.string()
    .min(10, { message: 'Description must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

const BidModal = ({ isOpen, onClose, job }: BidModalProps) => {
  const { useCreateBid } = useBids();
  const { user } = useAuth();
  const createBidMutation = useCreateBid();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: job.budget_min || 0,
      estimated_hours: 1,
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    try {
      await createBidMutation.mutateAsync({
        job_id: job.id,
        provider_id: user.id,
        amount: values.amount,
        estimated_hours: values.estimated_hours,
        description: values.description,
        status: 'pending',
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting bid:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Place a Bid</DialogTitle>
          <DialogDescription>
            You are bidding on: <span className="font-semibold">{job.title}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">Budget Range:</span>
            <p className="font-medium">${job.budget_min} - ${job.budget_max}</p>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="font-medium">{job.category?.name}</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bid Amount ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Enter your bid amount"
                        className="pl-10"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Hours</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="How many hours will this take?" 
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                      step="0.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how you'll approach this job..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-donezo-teal hover:bg-donezo-teal/90"
                disabled={createBidMutation.isPending}
              >
                {createBidMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Bid'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
