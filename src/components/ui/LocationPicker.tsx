import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// Component to handle map center changes from outside
function ChangeView({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function LocationPicker({ initialLocation, onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng>(
    new L.LatLng(initialLocation?.lat || -1.2921, initialLocation?.lng || 36.8219)
  );

  useEffect(() => {
    // Reverse geocoding (simplified for MVP)
    // In a production app, use Google Geocoding API or Nominatim
    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
        );
        const data = await response.json();
        const address = data.display_name || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
        onLocationChange(position.lat, position.lng, address);
      } catch (err) {
        onLocationChange(position.lat, position.lng, `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
      }
    };

    fetchAddress();
  }, [position]);

  return (
    <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={position} />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
