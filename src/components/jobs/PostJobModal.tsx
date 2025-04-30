
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useJobs } from '@/hooks/useJobs';
import { useCategories } from '@/hooks/useCategories';
import { Loader2, Sparkles } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category_id: z.string().min(1, {
    message: "Please select a category.",
  }),
  budget_min: z.number().min(1, {
    message: "Minimum budget must be at least $1.",
  }),
  budget_max: z.number().min(1, {
    message: "Maximum budget must be at least $1.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  preferred_date: z.date().optional(),
  is_emergency: z.boolean().default(false).optional(),
  is_fix_now: z.boolean().default(false).optional(),
  use_ai_description: z.boolean().default(false).optional(),
});

const PostJobModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { useCreateJob } = useJobs();
  const { useAllCategories } = useCategories();
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAiDescription, setUseAiDescription] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const { mutate: createJob } = useCreateJob();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      budget_min: 50,
      budget_max: 200,
      location: "",
      preferred_date: undefined,
      is_emergency: false,
      is_fix_now: false,
      use_ai_description: false,
    }
  });

  const generateDescription = async () => {
    const title = form.getValues('title');
    const categoryId = form.getValues('category_id');
    const budgetMin = form.getValues('budget_min');
    const budgetMax = form.getValues('budget_max');
    const location = form.getValues('location');
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a job title first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingDescription(true);
      
      // Find the category name
      const categoryName = categories?.find(cat => cat.id === categoryId)?.name || '';
      
      console.log("Generating description for:", {
        jobTitle: title,
        category: categoryName,
        budget: `${budgetMin}-${budgetMax}`,
        location: location
      });
      
      const response = await fetch(`${window.location.origin}/functions/v1/generate-job-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobTitle: title,
          category: categoryName,
          budget: `${budgetMin}-${budgetMax}`,
          location: location
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Failed to generate description: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.description) {
        throw new Error('No description was generated');
      }
      
      form.setValue('description', data.description);
      
      toast({
        title: "Description generated!",
        description: "AI has created a job description based on your details."
      });
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Failed to generate description",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to post a job.",
          variant: "destructive"
        });
        return;
      }
      
      // Format preferred date as ISO string if it exists
      const formattedDate = data.preferred_date ? new Date(data.preferred_date).toISOString() : undefined;
      
      // Create job with the right customer_id
      const jobData = {
        customer_id: userId,
        status: "open" as "open", // Explicitly type this as a literal type
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        location: data.location,
        preferred_date: formattedDate,
        is_emergency: data.is_emergency,
        is_fix_now: data.is_fix_now
      };
      
      await createJob(jobData);
      
      // Close modal and reset form
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error creating job",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Create a new job posting for service providers to bid on.
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
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (
                        categories?.map((category) => (
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
            
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md border">
              <div className="flex-grow">
                <h4 className="text-sm font-medium">Use AI to generate description</h4>
                <p className="text-xs text-gray-500">Let AI create a professional job description based on your details</p>
              </div>
              <Switch
                checked={useAiDescription}
                onCheckedChange={(checked) => {
                  setUseAiDescription(checked);
                  form.setValue('use_ai_description', checked);
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <FormLabel>Job Description</FormLabel>
                    {useAiDescription && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDescription}
                        disabled={isGeneratingDescription}
                        className="flex items-center gap-1"
                      >
                        {isGeneratingDescription ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="h-3 w-3" /> Generate with AI</>
                        )}
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter job description" 
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the job in detail, including scope and requirements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-2">
              <FormField
                control={form.control}
                name="budget_min"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-1/2">
                    <FormLabel>Budget Min</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Minimum budget"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                  <FormItem className="w-full sm:w-1/2">
                    <FormLabel>Budget Max</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Maximum budget"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                    <Input placeholder="Enter location" {...field} />
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
                  <FormLabel>Preferred Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="ml-auto h-4 w-4 opacity-50"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
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
                  <FormDescription>
                    Choose a preferred date for the job.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <FormField
                control={form.control}
                name="is_emergency"
                render={({ field }) => (
                  <FormItem className="flex-1 flex flex-row items-center space-x-2 rounded-md border p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Emergency</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_fix_now"
                render={({ field }) => (
                  <FormItem className="flex-1 flex flex-row items-center space-x-2 rounded-md border p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Fix Now</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-donezo-blue hover:bg-donezo-blue/90"
            >
              {isSubmitting ? "Submitting..." : "Post Job"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PostJobModal;
