import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Heart, Maximize2, Minimize2, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface BurialMapProps {
  lat: number;
  lng: number;
  burialPhotoUrl?: string | null;
}

export function BurialMap({ lat, lng, burialPhotoUrl }: BurialMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="space-y-6">

        {burialPhotoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video"
          >
            <img
              src={burialPhotoUrl}
              alt="Место захоронения"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90">
              <Heart className="w-5 h-5 text-phoenix-400" />
              <span className="text-sm font-medium">Фотография места захоронения</span>
            </div>
          </motion.div>
        )}


        <div className="relative rounded-2xl overflow-hidden bg-surface-100 border border-white/10">
          <div className="aspect-video sm:aspect-[2/1] relative overflow-hidden">
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              className="w-full h-full z-0"
              style={{ background: '#0a0a0a' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[lat, lng]} />
            </MapContainer>
          </div>
          <div className="p-4 flex items-center justify-between bg-surface-50/50">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-2 text-phoenix-400 hover:text-phoenix-300 text-sm transition-colors group"
            >
              <span>Развернуть карту</span>
              <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>


      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden border border-white/10 bg-surface-100"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-phoenix-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-phoenix-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Место захоронения</h3>
                      <p className="text-zinc-400 text-sm">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
                  >
                    <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>


              <div className="w-full h-full overflow-hidden">
                <MapContainer
                  center={[lat, lng]}
                  zoom={15}
                  className="w-full h-full z-0"
                  style={{ background: '#0a0a0a' }}
                  zoomControl={true}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[lat, lng]} />
                </MapContainer>
              </div>


              <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>Свернуть</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
