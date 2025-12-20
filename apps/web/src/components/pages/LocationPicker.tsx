

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LocationPickerProps {
  label: string;
  value: string;
  lat?: number | null;
  lng?: number | null;
  onChange: (place: string, lat: number | null, lng: number | null) => void;
  placeholder?: string;
  hint?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationPicker({
  label,
  value,
  lat,
  lng,
  onChange,
  placeholder = 'Введите адрес или название места',
  hint,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(lat || null);
  const [selectedLng, setSelectedLng] = useState<number | null>(lng || null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'ru',
          },
        }
      );
      const data = await response.json() as SearchResult[];
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectResult = (result: SearchResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);

    setSelectedLat(newLat);
    setSelectedLng(newLng);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    onChange(result.display_name, newLat, newLng);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onChange(e.target.value, selectedLat, selectedLng);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedLat(null);
    setSelectedLng(null);
    setSearchResults([]);
    onChange('', null, null);
  };

  const hasCoordinates = selectedLat !== null && selectedLng !== null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-phoenix-400" />
          {label}
        </div>
      </label>

      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSearch();
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-surface-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 border-b border-white/5 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-phoenix-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {hasCoordinates && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <MapPin className="w-3 h-3 text-green-400" />
          <span>Координаты: {selectedLat?.toFixed(6)}, {selectedLng?.toFixed(6)}</span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${selectedLat}&mlon=${selectedLng}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-phoenix-400 hover:underline ml-2"
          >
            Открыть на карте
          </a>
        </div>
      )}

      {hint && (
        <p className="text-xs text-zinc-400">{hint}</p>
      )}
    </div>
  );
}

export default LocationPicker;
