import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({ initialLocation, onLocationChange }: LocationPickerProps) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const [location, setLocation] = useState({
    lat: initialLocation?.lat ?? -1.2921,
    lng: initialLocation?.lng ?? 36.8219,
  });
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.lng ?? 36.8219,
    latitude: initialLocation?.lat ?? -1.2921,
    zoom: 11,
  });

  useEffect(() => {
    const nextAddress = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    onLocationChange(location.lat, location.lng, nextAddress);
  }, [location, onLocationChange]);

  const handleMapClick = (event: any) => {
    const nextLocation = {
      lat: Number(event.lngLat.lat),
      lng: Number(event.lngLat.lng),
    };

    setLocation(nextLocation);
    setViewState((current) => ({ ...current, latitude: nextLocation.lat, longitude: nextLocation.lng }));
  };

  if (!token) {
    return (
      <div className="h-64 rounded-xl border border-gray-200 bg-slate-900 flex items-center justify-center text-sm text-slate-300">
        Add VITE_MAPBOX_TOKEN to enable the live map.
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-0">
      <Map
        {...viewState}
        onMove={(event: any) => setViewState(event.viewState)}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={token}
        attributionControl={false}
      >
        <Marker
          longitude={location.lng}
          latitude={location.lat}
          color="#22c55e"
          anchor="center"
        />
        <NavigationControl position="bottom-right" />
      </Map>
    </div>
  );
}
