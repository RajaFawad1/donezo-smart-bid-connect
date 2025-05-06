
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
import { Badge } from '@/components/ui/badge';
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
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

interface FlaggedUser {
  id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'warning_issued' | 'suspended' | 'cleared';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  flag_count: number;
  user: {
    user_metadata: {
      full_name: string;
      email: string;
      user_type: string;
    }
  };
}

const UserFlagging: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFlag, setSelectedFlag] = useState<FlaggedUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const fetchFlaggedUsers = async () => {
    // First get all user flags
    const { data: flagData, error: flagError } = await supabase
      .from('user_flags')
      .select(`
        *,
        user:user_id (user_metadata)
      `)
      .order('created_at', { ascending: false });
      
    if (flagError) throw flagError;
    
    // Group flags by user and count them
    const userFlags = new Map();
    flagData?.forEach(flag => {
      if (!userFlags.has(flag.user_id)) {
        userFlags.set(flag.user_id, {
          ...flag,
          flag_count: 1
        });
      } else {
        const existing = userFlags.get(flag.user_id);
        existing.flag_count += 1;
        // Use the most recent flag as the main one
        if (new Date(flag.created_at) > new Date(existing.created_at)) {
          userFlags.set(flag.user_id, {
            ...flag,
            flag_count: existing.flag_count
          });
        }
      }
    });
    
    return Array.from(userFlags.values()) as FlaggedUser[];
  };
  
  const { data: flaggedUsers, isLoading } = useQuery({
    queryKey: ['admin', 'flagged_users'],
    queryFn: fetchFlaggedUsers,
  });

  const updateUserFlagMutation = useMutation({
    mutationFn: async ({ flagId, updates }: { flagId: string, updates: any }) => {
      const { data, error } = await supabase
        .from('user_flags')
        .update(updates)
        .eq('id', flagId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flagged_users'] });
      toast({
        title: 'User flag updated',
        description: 'The user flag status has been updated.',
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
  
  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // In a real application, this would call a secure API endpoint to handle user suspension
      // Here, we're simulating by updating user metadata
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { suspended: true, suspended_at: new Date().toISOString() } }
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flagged_users'] });
      toast({
        title: 'User suspended',
        description: 'The user has been suspended from the platform.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Suspension failed',
        description: `${error}`,
        variant: 'destructive',
      });
    }
  });

  const handleOpenDetails = (flag: FlaggedUser) => {
    setSelectedFlag(flag);
    setStatus(flag.status);
    setNotes(flag.admin_notes || "");
    setDialogOpen(true);
  };

  const handleUpdateFlag = () => {
    if (!selectedFlag) return;
    
    updateUserFlagMutation.mutate({
      flagId: selectedFlag.id,
      updates: {
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString()
      }
    });
  };

  const handleSuspendUser = () => {
    if (!selectedFlag) return;
    
    suspendUserMutation.mutate(selectedFlag.user_id);
    
    // Also update the flag status
    updateUserFlagMutation.mutate({
      flagId: selectedFlag.id,
      updates: {
        status: 'suspended',
        admin_notes: notes ? `${notes}\n\nUser suspended on ${new Date().toLocaleString()}` : `User suspended on ${new Date().toLocaleString()}`,
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
          <h2 className="text-xl font-semibold mb-4">Flagged Users</h2>
          
          {flaggedUsers && flaggedUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Flag Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flag Count</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedUsers.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      {flag.user?.user_metadata?.full_name || "Unknown User"}
                      <div className="text-xs text-gray-500">
                        {flag.user?.user_metadata?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {flag.user?.user_metadata?.user_type || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {flag.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${flag.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${flag.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${flag.status === 'warning_issued' ? 'bg-orange-100 text-orange-800' : ''}
                        ${flag.status === 'suspended' ? 'bg-red-100 text-red-800' : ''}
                        ${flag.status === 'cleared' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {flag.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={flag.flag_count > 2 ? "destructive" : "outline"}>
                        {flag.flag_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(flag.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenDetails(flag)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No flagged users found</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Flagged User Details</DialogTitle>
            <DialogDescription>
              Review and take action on this flagged user.
            </DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">User</p>
                <p className="text-sm">
                  {selectedFlag.user?.user_metadata?.full_name} 
                  <span className="text-gray-500 ml-2">({selectedFlag.user?.user_metadata?.user_type})</span>
                </p>
                <p className="text-xs text-gray-500">{selectedFlag.user?.user_metadata?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Flag Reason</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedFlag.reason}</p>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="warning_issued">Warning Issued</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Admin Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add admin notes here..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handleSuspendUser}
              disabled={!selectedFlag || updateUserFlagMutation.isPending || suspendUserMutation.isPending}
            >
              Suspend User
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateFlag}
                disabled={updateUserFlagMutation.isPending}
              >
                {updateUserFlagMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserFlagging;
