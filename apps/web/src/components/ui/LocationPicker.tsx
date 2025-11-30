import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

import 'leaflet/dist/leaflet.css';

const markerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7C3AED" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface Location {
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface LocationPickerProps {
  value?: Location | null;
  onChange?: (location: Location | null) => void;
  label?: string;
  placeholder?: string;
  className?: string | undefined;
  disabled?: boolean;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [map, center]);

  return null;
}

export function LocationPicker({
  value,
  onChange,
  label,
  placeholder = 'Выберите место на карте',
  className,
  disabled = false,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<Location | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const defaultCenter: [number, number] = [55.7558, 37.6173];

  useEffect(() => {
    if (isOpen) {
      setTempLocation(value ?? null);
      setAddressInput(value?.address ?? '');
    }
  }, [isOpen, value]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setTempLocation(prev => ({
      address: prev?.address ?? null,
      lat,
      lng,
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!addressInput.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=1`
      );
      const data = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>;

      const result = data[0];
      if (result) {
        setTempLocation({
          address: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        });
        setAddressInput(result.display_name);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [addressInput]);

  const handleConfirm = useCallback(() => {
    if (tempLocation) {
      onChange?.({
        ...tempLocation,
        address: addressInput || tempLocation.address,
      });
    }
    setIsOpen(false);
  }, [tempLocation, addressInput, onChange]);

  const handleClear = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  const hasLocation = value?.lat != null && value?.lng != null;
  const hasTempLocation = tempLocation?.lat != null && tempLocation?.lng != null;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={cn(
            'flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
            'bg-surface-900 border-white/10',
            hasLocation
              ? 'text-white'
              : 'text-white/50',
            !disabled && 'hover:border-phoenix-500/50 hover:bg-surface-800',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <MapPin size={20} className={hasLocation ? 'text-phoenix-400' : 'text-white/40'} />
          <span className="truncate">
            {value?.address || (hasLocation ? `${value?.lat?.toFixed(6)}, ${value?.lng?.toFixed(6)}` : placeholder)}
          </span>
        </button>

        {hasLocation && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="px-3"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Выберите место"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Введите адрес для поиска..."
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleSearch()}
              disabled={isSearching || !addressInput.trim()}
            >
              <Search size={18} />
            </Button>
          </div>

          <div className="h-[400px] rounded-lg overflow-hidden border border-white/10">
            <MapContainer
              center={hasTempLocation ? [tempLocation.lat!, tempLocation.lng!] : defaultCenter}
              zoom={hasTempLocation ? 15 : 10}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {hasTempLocation && (
                <>
                  <Marker
                    position={[tempLocation.lat!, tempLocation.lng!]}
                    icon={markerIcon}
                  />
                  <MapCenterUpdater
                    center={[tempLocation.lat!, tempLocation.lng!]}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {hasTempLocation && (
            <div className="text-sm text-white/60">
              Координаты: {tempLocation.lat?.toFixed(6)}, {tempLocation.lng?.toFixed(6)}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!hasTempLocation}
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LocationPicker;
