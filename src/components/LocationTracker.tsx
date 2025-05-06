
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationTrackerProps {
  contractId: string;
  providerId: string;
  isProvider: boolean;
}

const LocationTracker = ({ contractId, providerId, isProvider }: LocationTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [channel, setChannel] = useState<any>(null);
  
  // Set up realtime subscription to location updates
  useEffect(() => {
    if (!contractId || !user?.id) return;
    
    // Create and subscribe to the channel
    const locationChannel = supabase.channel(`contract-${contractId}-location`);
    
    // Handle location updates
    locationChannel
      .on('broadcast', { event: 'location' }, (payload) => {
        if (payload.payload && typeof payload.payload === 'object') {
          setLocation(payload.payload as Location);
        }
      })
      .subscribe();
    
    setChannel(locationChannel);
    
    return () => {
      if (locationChannel) {
        supabase.removeChannel(locationChannel);
      }
    };
  }, [contractId, user?.id]);
  
  // Start or stop location tracking
  const toggleTracking = () => {
    if (tracking) {
      // Stop tracking
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setTracking(false);
      toast({
        title: "Location sharing stopped",
        description: "You are no longer sharing your location"
      });
    } else {
      // Start tracking
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description: "Your browser does not support location tracking",
          variant: "destructive"
        });
        return;
      }
      
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
          };
          
          setLocation(newLocation);
          
          // Broadcast location to the channel
          if (channel) {
            channel.send({
              type: 'broadcast',
              event: 'location',
              payload: newLocation
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location error",
            description: getLocationErrorMessage(error),
            variant: "destructive"
          });
          setTracking(false);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
      
      setWatchId(id);
      setTracking(true);
      toast({
        title: "Location sharing started",
        description: "Your live location is now visible to the other party"
      });
    }
  };
  
  const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location permission was denied. Please enable location services in your browser settings.";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable.";
      case error.TIMEOUT:
        return "The request to get location timed out.";
      default:
        return "An unknown error occurred while getting location.";
    }
  };
  
  const getLocationText = () => {
    if (!location) return "No location data available";
    
    // Format the coordinates
    const lat = location.latitude.toFixed(6);
    const lng = location.longitude.toFixed(6);
    
    // Format the timestamp
    const date = new Date(location.timestamp);
    const timeString = date.toLocaleTimeString();
    
    return `Location: ${lat}, ${lng} (as of ${timeString})`;
  };

  if (!isProvider && !location) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-sm text-yellow-700">
            The service provider hasn't shared their location yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-md p-4 mt-4">
      <h3 className="text-lg font-medium mb-2">Location Tracking</h3>
      
      {isProvider ? (
        <div className="space-y-4">
          <Button
            onClick={toggleTracking}
            className={tracking ? "bg-red-500 hover:bg-red-600" : "bg-donezo-blue hover:bg-donezo-blue/90"}
          >
            {tracking ? (
              <>Stop sharing location</>
            ) : (
              <>Share my location</>
            )}
          </Button>
          
          {tracking && (
            <p className="text-sm text-muted-foreground">
              {getLocationText()}
            </p>
          )}
        </div>
      ) : (
        <div>
          {location ? (
            <div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm">{getLocationText()}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Service provider is sharing their location in real-time
              </p>
              <div className="mt-3">
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Waiting for location updates...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationTracker;
