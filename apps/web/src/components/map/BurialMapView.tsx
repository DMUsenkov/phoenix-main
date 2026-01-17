

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import type { BurialPoint } from '@/lib/api';
import { ExternalLink, MapPin } from 'lucide-react';

const RUSSIA_CENTER: [number, number] = [55.7558, 37.6173];
const DEFAULT_ZOOM = 5;

function createBurialIcon(photoUrl: string | null): L.DivIcon {
  const hasPhoto = !!photoUrl;

  return L.divIcon({
    className: 'burial-marker-icon',
    html: `
      <div class="burial-marker">
        <div class="burial-marker-inner">
          ${hasPhoto
            ? `<img src="${photoUrl}" alt="" class="burial-marker-photo" />`
            : `<div class="burial-marker-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`
          }
        </div>
        <div class="burial-marker-pin"></div>
      </div>
    `,
    iconSize: [52, 64],
    iconAnchor: [26, 64],
    popupAnchor: [0, -58],
  });
}

function MapStyleInjector() {
  useEffect(() => {
    const styleId = 'burial-marker-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .burial-marker {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .burial-marker-inner {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #7c3aed);
        padding: 3px;
        box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4), 0 0 0 2px rgba(255,255,255,0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .burial-marker:hover .burial-marker-inner {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(168, 85, 247, 0.5), 0 0 0 3px rgba(255,255,255,0.2);
      }

      .burial-marker-photo {
        width: 42px;
        height: 42px;
        min-width: 42px;
        min-height: 42px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center 20%;
        background: #1a1a1a;
        display: block;
        border: none;
        outline: none;
        image-rendering: -webkit-optimize-contrast;
      }

      .burial-marker-placeholder {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #27272a, #18181b);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a1a1aa;
      }

      .burial-marker-pin {
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 12px solid #7c3aed;
        margin-top: -2px;
        filter: drop-shadow(0 2px 4px rgba(124, 58, 237, 0.4));
      }

      .leaflet-popup-content-wrapper {
        background: rgba(24, 24, 27, 0.95) !important;
        backdrop-filter: blur(12px) !important;
        border-radius: 16px !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      .leaflet-popup-content {
        margin: 0 !important;
        width: auto !important;
      }

      .leaflet-popup-tip {
        background: rgba(24, 24, 27, 0.95) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        box-shadow: none !important;
      }

      .leaflet-popup-close-button {
        color: #a1a1aa !important;
        font-size: 20px !important;
        padding: 8px 10px !important;
        top: 4px !important;
        right: 4px !important;
      }

      .leaflet-popup-close-button:hover {
        color: #fff !important;
      }


      .leaflet-control-zoom {
        display: none !important;
      }


      .leaflet-control-attribution {
        display: none !important;
      }

    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
}

interface BurialPopupContentProps {
  point: BurialPoint;
}

function BurialPopupContent({ point }: BurialPopupContentProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const birthDate = formatDate(point.birth_date);
  const deathDate = formatDate(point.death_date);

  return (
    <div className="w-72">

      <div className="relative">
        {point.photo_url ? (
          <div className="h-32 overflow-hidden">
            <img
              src={point.photo_url}
              alt={point.full_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-br from-phoenix-600/20 to-purple-600/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        )}
      </div>


      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
          {point.full_name}
        </h3>


        {(birthDate || deathDate) && (
          <p className="text-sm text-zinc-400 mb-3">
            {birthDate && deathDate
              ? `${birthDate} — ${deathDate}`
              : birthDate
                ? `Род. ${birthDate}`
                : `Ум. ${deathDate}`
            }
          </p>
        )}


        {point.burial_place && (
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="w-4 h-4 text-phoenix-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-zinc-400 line-clamp-2">{point.burial_place}</p>
          </div>
        )}


        <Link
          to={`/p/${point.page_slug}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r to-phoenix-700 text-white text-sm font-medium transition-all"
        >
          Открыть страницу памяти
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function FitBounds({ points }: { points: BurialPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const bounds = L.latLngBounds(
      points.map(p => [p.lat, p.lng] as [number, number])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [points, map]);

  return null;
}

interface BurialMapViewProps {
  burialPoints: BurialPoint[];
  isLoading?: boolean;
}

export function BurialMapView({ burialPoints, isLoading }: BurialMapViewProps) {
  const markersRef = useRef<Map<string, L.DivIcon>>(new Map());

  const getIcon = useCallback((point: BurialPoint) => {
    const key = point.photo_url || 'no-photo';
    if (!markersRef.current.has(key)) {
      markersRef.current.set(key, createBurialIcon(point.photo_url));
    }
    return markersRef.current.get(key)!;
  }, []);

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-64px)]">
      <MapContainer
        center={RUSSIA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        style={{ background: '#0a0a0a', height: '100%', minHeight: 'calc(100vh - 64px)' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapStyleInjector />

        {burialPoints.length > 0 && <FitBounds points={burialPoints} />}

        {burialPoints.map((point) => (
          <Marker
            key={point.page_slug}
            position={[point.lat, point.lng]}
            icon={getIcon(point)}
          >
            <Popup>
              <BurialPopupContent point={point} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>


      {isLoading && (
        <div className="absolute inset-0 bg-obsidian/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-surface-50/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-surface-200 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-phoenix-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-zinc-300">Загрузка страниц памяти...</span>
          </div>
        </div>
      )}
    </div>
  );
}
