
import React, { useState, useEffect } from 'react';
import { MapPin, Locate } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LocationTrackerProps {
  contractId: string;
  providerId: string;
  isProvider: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  updated_at: string;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ contractId, providerId, isProvider }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // For providers: Share location
  const startSharingLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location sharing not supported",
        description: "Your browser doesn't support location sharing.",
        variant: "destructive"
      });
      return;
    }
    
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(newLocation);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Update location in Supabase
        try {
          const { error } = await supabase
            .from('provider_locations')
            .upsert({
              provider_id: user?.id,
              contract_id: contractId,
              latitude: newLocation.latitude,
              longitude: newLocation.longitude,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'provider_id,contract_id'
            });
            
          if (error) {
            console.error("Error updating location:", error);
          }
        } catch (err) {
          console.error("Exception updating location:", err);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location error",
          description: `Error getting location: ${error.message}`,
          variant: "destructive"
        });
        stopSharingLocation();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
    
    setWatchId(id);
    setIsSharing(true);
  };
  
  const stopSharingLocation = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
  };
  
  // For customers: Get provider's location
  useEffect(() => {
    if (isProvider || !providerId) return;
    
    const fetchProviderLocation = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_locations')
          .select('*')
          .eq('provider_id', providerId)
          .eq('contract_id', contractId)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            console.error("Error fetching provider location:", error);
          }
          return;
        }
        
        if (data) {
          const locationData = data as LocationData;
          setLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude
          });
          
          const updatedAt = new Date(locationData.updated_at);
          const now = new Date();
          const diffMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);
          
          // Only show location if updated in the last 5 minutes
          if (diffMinutes > 5) {
            setLocation(null);
            setLastUpdated("Location data is outdated");
          } else {
            setLastUpdated(updatedAt.toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error("Exception fetching provider location:", err);
      }
    };
    
    fetchProviderLocation();
    
    // Set up subscription to location changes
    const channel = supabase
      .channel('public:provider_locations')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'provider_locations',
        filter: `provider_id=eq.${providerId}` 
      }, (payload) => {
        if (payload.new) {
          const newData = payload.new as LocationData;
          setLocation({
            latitude: newData.latitude,
            longitude: newData.longitude
          });
          setLastUpdated(new Date(newData.updated_at).toLocaleTimeString());
        }
      })
      .subscribe();
      
    // Refetch every 30 seconds as a backup
    const interval = setInterval(fetchProviderLocation, 30000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [providerId, contractId, isProvider]);
  
  // Clean up watch when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);
  
  if (isProvider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSharing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Currently sharing your location
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {lastUpdated || 'Just now'}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={stopSharingLocation}
                >
                  Stop Sharing
                </Button>
              </div>
              {location && (
                <div className="bg-gray-50 p-3 rounded-md text-xs">
                  <p>Lat: {location.latitude.toFixed(6)}</p>
                  <p>Long: {location.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="mb-3 text-sm text-gray-600">
                Share your location with the customer so they can track your arrival.
              </p>
              <Button onClick={startSharingLocation}>
                <Locate className="h-4 w-4 mr-2" />
                Start Location Sharing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Customer view
  return location ? (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Provider Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">
                Provider's location is available
              </p>
              {/* In a real app, this would show a map with the provider's location */}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Last updated: {lastUpdated}</span>
            <span>
              Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Provider Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-gray-500 mb-1">
            Location tracking not available
          </p>
          <p className="text-xs text-gray-400">
            The service provider is not currently sharing their location
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationTracker;
