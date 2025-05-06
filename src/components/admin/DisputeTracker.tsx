
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Dispute {
  id: string;
  contract_id: string;
  customer_id: string;
  provider_id: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  contract: {
    job: {
      title: string;
    }
  };
  customer: {
    user_metadata: {
      full_name: string;
    }
  };
  provider: {
    user_metadata: {
      full_name: string;
    }
  };
}

const DisputeTracker: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const fetchDisputes = async () => {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        contract:contract_id (job:job_id(*)),
        customer:customer_id (user_metadata),
        provider:provider_id (user_metadata)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Dispute[];
  };
  
  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: fetchDisputes,
  });

  const updateDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, updates }: { disputeId: string, updates: any }) => {
      const { data, error } = await supabase
        .from('disputes')
        .update(updates)
        .eq('id', disputeId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      toast({
        title: 'Dispute updated',
        description: 'The dispute has been successfully updated.',
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: `${error}`,
        variant: 'destructive',
      });
    }
  });

  const handleOpenDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setStatus(dispute.status);
    setNotes(dispute.resolution_notes || "");
    setDialogOpen(true);
  };

  const handleUpdateDispute = () => {
    if (!selectedDispute) return;
    
    updateDisputeMutation.mutate({
      disputeId: selectedDispute.id,
      updates: {
        status,
        resolution_notes: notes,
        updated_at: new Date().toISOString()
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Disputes</h2>
          
          {disputes && disputes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      {dispute.contract?.job?.title || "Unknown Job"}
                    </TableCell>
                    <TableCell>
                      {dispute.customer?.user_metadata?.full_name || "Unknown Customer"}
                    </TableCell>
                    <TableCell>
                      {dispute.provider?.user_metadata?.full_name || "Unknown Provider"}
                    </TableCell>
                    <TableCell>
                      <div className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${dispute.status === 'open' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${dispute.status === 'investigating' ? 'bg-blue-100 text-blue-800' : ''}
                        ${dispute.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                        ${dispute.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {dispute.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenDetails(dispute)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No active disputes found</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              Review and update the dispute status.
            </DialogDescription>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Contract ID</p>
                <p className="text-sm text-gray-600">{selectedDispute.contract_id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-gray-600">{selectedDispute.reason}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <Select 
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Resolution Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add resolution notes here..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDispute} disabled={updateDisputeMutation.isPending}>
              {updateDisputeMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DisputeTracker;
