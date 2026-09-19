import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, bounds]);
  return null;
};

export const HospitalRouteMap = ({
  patientLocation = [18.5204, 73.8567],
  hospitalLocation = [18.5314, 73.8298],
  hospitalName = 'Hospital',
  routeCoordinates = [patientLocation, hospitalLocation],
}) => {
  return (
    <div className="h-72 w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl relative z-0">
      <MapContainer
        center={patientLocation}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Patient Location Marker */}
        <Marker position={patientLocation}>
          <Popup>
            <div className="text-xs font-bold text-slate-900">Your Location</div>
          </Popup>
        </Marker>

        {/* Hospital Location Marker */}
        <Marker position={hospitalLocation}>
          <Popup>
            <div className="text-xs font-bold text-slate-900">{hospitalName}</div>
          </Popup>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          positions={routeCoordinates}
          color="#2563eb"
          weight={5}
          opacity={0.8}
        />

        <FitBounds bounds={[patientLocation, hospitalLocation]} />
      </MapContainer>
    </div>
  );
};

export default HospitalRouteMap;
