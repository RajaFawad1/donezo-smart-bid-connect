
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import JobsList from '@/components/jobs/JobsList';
import { useJobs } from '@/hooks/useJobs';
import { useBids } from '@/hooks/useBids';
import { useContracts } from '@/hooks/useContracts';
import ContractsList from '@/components/contracts/ContractsList';
import { Button } from '@/components/ui/button';
import SwipeToBid from '@/components/jobs/SwipeToBid';

const ProviderDashboard = () => {
  const [view, setView] = useState<string>('swipe');
  const { useOpenJobs } = useJobs();
  const { useMyBids } = useBids();
  const { useMyContracts } = useContracts();
  
  const { data: openJobs, isLoading: jobsLoading } = useOpenJobs();
  const { data: myBids, isLoading: bidsLoading } = useMyBids();
  const { data: myContracts, isLoading: contractsLoading } = useMyContracts();
  
  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Find jobs, manage your bids, and track your contracts
          </p>
        </div>
      </div>
      
      <Tabs defaultValue={view} onValueChange={setView}>
        <TabsList className="w-full mb-6 grid grid-cols-4">
          <TabsTrigger value="swipe">Swipe Jobs</TabsTrigger>
          <TabsTrigger value="available">Available Jobs</TabsTrigger>
          <TabsTrigger value="bids">My Bids {myBids?.length ? `(${myBids.length})` : ''}</TabsTrigger>
          <TabsTrigger value="contracts">My Contracts {myContracts?.length ? `(${myContracts.length})` : ''}</TabsTrigger>
        </TabsList>

        <TabsContent value="swipe">
          <SwipeToBid />
        </TabsContent>

        <TabsContent value="available">
          <JobsList
            jobs={openJobs || []}
            showBidButton={true}
            emptyMessage="No available jobs found. Check back later for new opportunities."
            view="provider"
          />
        </TabsContent>

        <TabsContent value="bids">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Bids</h2>
              
              {bidsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-blue"></div>
                </div>
              ) : myBids && myBids.length > 0 ? (
                <div className="space-y-6">
                  {myBids.map((bid) => (
                    <div key={bid.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{bid.job?.title || 'Job'}</h3>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>Bid Amount: ${bid.amount}</span>
                            <span>Est. Hours: {bid.estimated_hours}</span>
                          </div>
                        </div>
                        <div className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                          ${bid.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {bid.status}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{bid.description}</p>
                      
                      {bid.status === 'pending' && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="text-xs">
                            Edit Bid
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't placed any bids yet</p>
                  <Button 
                    variant="default" 
                    className="mt-4"
                    onClick={() => setView('swipe')}
                  >
                    Find Jobs to Bid On
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <ContractsList 
            contracts={myContracts || []} 
            view="provider"
          />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default ProviderDashboard;
