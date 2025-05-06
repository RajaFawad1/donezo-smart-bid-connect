
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

interface ProviderLocationMapProps {
  latitude: number;
  longitude: number;
  providerName?: string;
  lastUpdated?: string;
}

const ProviderLocationMap: React.FC<ProviderLocationMapProps> = ({
  latitude,
  longitude,
  providerName = "Provider",
  lastUpdated
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Load Google Maps API
  useEffect(() => {
    const loadMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
        });
        
        await loader.load();
        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps API:", error);
        toast({
          title: "Map loading error",
          description: "Could not load the map. Please try again later.",
          variant: "destructive"
        });
      }
    };
    
    loadMap();
  }, [toast]);
  
  // Initialize the map when API is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    try {
      // Create a new map instance
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true
      });
      
      // Create a marker for the provider's location
      const newMarker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: newMap,
        title: `${providerName}'s location`,
        animation: google.maps.Animation.DROP,
      });
      
      // Create an info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <div style="font-weight: bold;">${providerName}</div>
            <div style="font-size: 12px; color: #666;">
              ${lastUpdated ? `Last updated: ${lastUpdated}` : ''}
            </div>
          </div>
        `
      });
      
      // Show info window when marker is clicked
      newMarker.addListener("click", () => {
        infoWindow.open({
          anchor: newMarker,
          map: newMap
        });
      });
      
      // Save references to map and marker
      setMap(newMap);
      setMarker(newMarker);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map error",
        description: "Could not initialize the map.",
        variant: "destructive"
      });
    }
  }, [mapLoaded, latitude, longitude, providerName, lastUpdated, toast]);
  
  // Update marker position when location changes
  useEffect(() => {
    if (map && marker) {
      const newPosition = { lat: latitude, lng: longitude };
      marker.setPosition(newPosition);
      map.panTo(newPosition);
    }
  }, [latitude, longitude, map, marker]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Provider Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {process.env.GOOGLE_MAPS_API_KEY ? (
          <div className="space-y-4">
            <div 
              ref={mapRef} 
              className="h-[300px] w-full rounded-md bg-gray-100 shadow-inner"
            ></div>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated}
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <AlertTitle>Map not available</AlertTitle>
            <AlertDescription>
              Google Maps API key is not configured. Please contact the administrator.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderLocationMap;
