

import { useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapObject, ObjectType } from '@/lib/api';
import type { BBox } from '@/lib/hooks';

const MOSCOW_CENTER: [number, number] = [55.7558, 37.6173];
const DEFAULT_ZOOM = 12;

const MARKER_ICONS: Record<ObjectType, L.Icon> = {
  tree: new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#22c55e"/>
        <circle cx="16" cy="14" r="8" fill="white"/>
        <text x="16" y="18" text-anchor="middle" font-size="12">Tree</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  }),
  plaque: new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#f59e0b"/>
        <circle cx="16" cy="14" r="8" fill="white"/>
        <text x="16" y="18" text-anchor="middle" font-size="12">Plaque</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  }),
  place: new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#a855f7"/>
        <circle cx="16" cy="14" r="8" fill="white"/>
        <text x="16" y="18" text-anchor="middle" font-size="12">Place</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  }),
};

interface MapEventsProps {
  onBoundsChange: (bbox: BBox) => void;
}

function MapEvents({ onBoundsChange }: MapEventsProps) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        minLng: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLng: bounds.getEast(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        minLng: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLng: bounds.getEast(),
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      minLat: bounds.getSouth(),
      minLng: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLng: bounds.getEast(),
    });
  }, [map, onBoundsChange]);

  return null;
}

interface MapViewProps {
  objects: MapObject[];
  selectedObject: MapObject | null;
  onSelectObject: (obj: MapObject | null) => void;
  onBoundsChange: (bbox: BBox) => void;
  isLoading?: boolean;
}

export function MapView({
  objects,
  selectedObject: _selectedObject,
  onSelectObject,
  onBoundsChange,
  isLoading,
}: MapViewProps) {
  const handleBoundsChange = useCallback(
    (bbox: BBox) => {
      onBoundsChange(bbox);
    },
    [onBoundsChange]
  );

  const markers = useMemo(
    () =>
      objects.map((obj) => (
        <Marker
          key={obj.id}
          position={[obj.lat, obj.lng]}
          icon={MARKER_ICONS[obj.type]}
          eventHandlers={{
            click: () => onSelectObject(obj),
          }}
        />
      )),
    [objects, onSelectObject]
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={MOSCOW_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        style={{ background: '#1a1a1a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onBoundsChange={handleBoundsChange} />
        {markers}
      </MapContainer>

      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-surface-50/90 backdrop-blur-sm px-4 py-2 rounded-full border border-surface-200 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-phoenix-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-zinc-300">Загрузка...</span>
          </div>
        </div>
      )}
    </div>
  );
}
