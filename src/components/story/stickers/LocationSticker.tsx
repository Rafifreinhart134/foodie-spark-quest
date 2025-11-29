import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationStickerProps {
  onAdd: (location: string) => void;
  onClose: () => void;
}

interface Place {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
}

export const LocationSticker = ({ onAdd, onClose }: LocationStickerProps) => {
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPopularPlaces();
  }, []);

  useEffect(() => {
    if (location.length > 2) {
      searchPlaces();
    } else if (location.length === 0) {
      fetchPopularPlaces();
    }
  }, [location]);

  const fetchPopularPlaces = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('places')
      .select('id, name, city, address')
      .limit(10)
      .order('created_at', { ascending: false });
    
    if (data) {
      setPlaces(data);
    }
    setLoading(false);
  };

  const searchPlaces = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('places')
      .select('id, name, city, address')
      .or(`name.ilike.%${location}%,city.ilike.%${location}%,address.ilike.%${location}%`)
      .limit(10);
    
    if (data) {
      setPlaces(data);
    }
    setLoading(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Use reverse geocoding to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          const locationName = data.display_name.split(',').slice(0, 3).join(',');
          onAdd(locationName);
          onClose();
        } catch (error) {
          toast({
            title: "Error",
            description: "Could not get location name",
            variant: "destructive"
          });
        }
        setGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enable location services",
          variant: "destructive"
        });
        setGettingLocation(false);
      }
    );
  };

  const popularLocations = [
    'Jakarta, Indonesia',
    'Bali, Indonesia',
    'Bandung, Indonesia',
    'Surabaya, Indonesia',
    'Yogyakarta, Indonesia'
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add Location</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1"
        />
        <Button 
          size="icon"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {location && (
        <Button 
          className="w-full" 
          onClick={() => {
            onAdd(location);
            onClose();
          }}
        >
          Add "{location}"
        </Button>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : places.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">Places</p>
            {places.map((place) => (
              <button
                key={place.id}
                onClick={() => {
                  const locationText = [place.name, place.city].filter(Boolean).join(', ');
                  onAdd(locationText);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <MapPin className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-medium">{place.name}</div>
                  {place.city && (
                    <div className="text-sm text-muted-foreground">{place.city}</div>
                  )}
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Popular Locations</p>
            {popularLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  onAdd(loc);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>{loc}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
