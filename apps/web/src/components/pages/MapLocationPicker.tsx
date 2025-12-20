

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Check, X, Maximize2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import 'leaflet/dist/leaflet.css';


delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  label: string;
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  hint?: string;
}

interface ClickHandlerProps {
  onClick: (lat: number, lng: number) => void;
}

function ClickHandler({ onClick }: ClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapCenterProps {
  lat: number;
  lng: number;
}

function MapCenter({ lat, lng }: MapCenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [map, lat, lng]);
  return null;
}

export function MapLocationPicker({
  label,
  lat,
  lng,
  onChange,
  hint,
}: MapLocationPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempLat, setTempLat] = useState<number | null>(lat);
  const [tempLng, setTempLng] = useState<number | null>(lng);

  useEffect(() => {
    setTempLat(lat);
    setTempLng(lng);
  }, [lat, lng]);

  const handleMapClick = useCallback((clickLat: number, clickLng: number) => {
    setTempLat(clickLat);
    setTempLng(clickLng);
  }, []);

  const handleConfirm = () => {
    onChange(tempLat, tempLng);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempLat(lat);
    setTempLng(lng);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    onChange(null, null);
    setTempLat(null);
    setTempLng(null);
  };

  const hasCoordinates = lat !== null && lng !== null;
  const hasTempCoordinates = tempLat !== null && tempLng !== null;


  const defaultCenter: [number, number] = [55.7558, 37.6173];
  const mapCenter: [number, number] = hasTempCoordinates
    ? [tempLat, tempLng]
    : defaultCenter;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-phoenix-400" />
          {label}
        </div>
      </label>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          {hasCoordinates ? 'Изменить на карте' : 'Выбрать на карте'}
        </Button>

        {hasCoordinates && (
          <>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <MapPin className="w-4 h-4 text-green-400" />
              <span>{lat?.toFixed(5)}, {lng?.toFixed(5)}</span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-red-400 transition-colors"
              title="Удалить координаты"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {hint && (
        <p className="text-xs text-zinc-400">{hint}</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title="Выберите место на карте"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Кликните на карту, чтобы установить точку места захоронения
          </p>

          <div className="h-[400px] rounded-lg overflow-hidden border border-white/10">
            <MapContainer
              center={mapCenter}
              zoom={hasTempCoordinates ? 15 : 10}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
              attributionControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <ClickHandler onClick={handleMapClick} />
              {hasTempCoordinates && (
                <>
                  <Marker position={[tempLat, tempLng]} />
                  <MapCenter lat={tempLat} lng={tempLng} />
                </>
              )}
            </MapContainer>
          </div>

          {hasTempCoordinates && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="w-4 h-4" />
              <span>Выбрано: {tempLat?.toFixed(6)}, {tempLng?.toFixed(6)}</span>
            </div>
          )}

          <div className="space-y-3 pt-2 border-t border-white/10">
            <p className="text-sm text-zinc-400">Или введите координаты вручную:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Широта (Latitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={tempLat ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    setTempLat(value);
                  }}
                  placeholder="54.110943"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-phoenix-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Долгота (Longitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={tempLng ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    setTempLng(value);
                  }}
                  placeholder="36.716309"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-phoenix-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              disabled={!hasTempCoordinates}
            >
              <Check className="w-4 h-4 mr-2" />
              Подтвердить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MapLocationPicker;
