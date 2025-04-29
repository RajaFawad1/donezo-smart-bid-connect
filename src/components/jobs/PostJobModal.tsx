import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useJobs } from '@/hooks/useJobs';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  category_id: z.string().min(1, { message: 'Please select a category' }),
  budget_min: z.number().min(5, { message: 'Minimum budget must be at least $5' }),
  budget_max: z.number().min(5, { message: 'Maximum budget must be at least $5' }),
  location: z.string().min(3, { message: 'Please enter a valid location' }),
  preferred_date: z.date().optional(),
  is_emergency: z.boolean().default(false).optional(),
  is_fix_now: z.boolean().default(false).optional(),
});

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostJobModal = ({ isOpen, onClose }: PostJobModalProps) => {
  const { toast } = useToast();
  const { useCreateJob } = useJobs();
  const { useAllCategories } = useCategories();
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: createJob } = useCreateJob();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      budget_min: 5,
      budget_max: 100,
      location: '',
      preferred_date: undefined,
      is_emergency: false,
      is_fix_now: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to post a job.",
          variant: "destructive",
        });
        return;
      }
      
      // Format preferred date as ISO string if it exists
      const formattedDate = data.preferred_date ? new Date(data.preferred_date).toISOString() : undefined;
      
      // Create job with the right customer_id and explicitly typed status
      const jobData: Partial<Job> = {
        customer_id: userId,
        status: "open",
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        location: data.location,
        preferred_date: formattedDate,
        is_emergency: data.is_emergency,
        is_fix_now: data.is_fix_now,
      };
      
      await createJob(jobData);
      
      // Immediately invalidate queries to refresh job lists
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      
      // Close modal and reset form
      form.reset();
      onClose();
      
      toast({
        title: "Job created successfully",
        description: "Your job has been posted and is now visible to service providers.",
      });
      
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error creating job",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-[550px] md:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-semibold">Post a New Job</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Fill out the details below to create a new job and get bids from service providers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job title" {...field} />
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
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your job in detail..." 
                      className="min-h-[80px] md:min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={categoriesLoading || !categories || categories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          categoriesLoading ? "Loading categories..." : 
                          (!categories || categories.length === 0) ? "No categories available" : "Select a category"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (!categories || categories.length === 0) ? (
                        <SelectItem value="empty" disabled>No categories available</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Budget ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))} 
                        min={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Budget ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))} 
                        min={form.watch('budget_min')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full sm:w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_emergency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Emergency Service</FormLabel>
                      <FormDescription className="text-xs">
                        Need help urgently?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_fix_now"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Fix Now</FormLabel>
                      <FormDescription className="text-xs">
                        Priority service
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-donezo-blue hover:bg-donezo-blue/90 w-full sm:w-auto"
                disabled={isSubmitting || !categories || categories.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PostJobModal;