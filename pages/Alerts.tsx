import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  AlertTriangle, 
  Navigation, 
  PlusCircle, 
  Layers, 
  Search,
  Filter,
  ArrowRight,
  Bell,
  Clock,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin, useAdvancedMarkerRef, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import PlaceAutocomplete from '../src/components/PlaceAutocomplete';

// Custom styles for InfoWindow to match ECOBR232 theme
const infoWindowStyles = `
  .gm-style-iw {
    background-color: #0c1a14 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 16px !important;
    padding: 0 !important;
  }
  .gm-style-iw-d {
    overflow: hidden !important;
  }
  .gm-style-iw-tc::after {
    background-color: #0c1a14 !important;
  }
  .gm-ui-hover-text {
    display: none !important;
  }
  .gm-style-iw-c {
    background-color: #0c1a14 !important;
    padding: 0 !important;
  }
`;

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || import.meta.env.VITE_GOOGLE_MAP || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Coordenadas centrais da BR-232 em Pernambuco (próximo a Caruaru para visão regional)
const BR232_CENTER = { lat: -8.2831, lng: -35.9727 };

const Alerts: React.FC = () => {
  if (!hasValidKey) {
    return (
      <div className="min-h-screen bg-[#05100a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="size-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <MapPin size={40} />
          </div>
          <h2 className="text-2xl font-black italic uppercase italic">Configuração de Mapa Necessária</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Para visualizar a malha geoeconômica em tempo real, você precisa configurar sua chave do Google Maps.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Passo a Passo:</p>
            <ol className="text-[11px] font-bold text-slate-300 space-y-3 list-decimal pl-4 italic">
              <li>Obtenha uma chave no <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a>.</li>
              <li>Certifique-se de que a <span className="text-white">Maps JavaScript API</span> está ativada.</li>
              <li>Autorize o domínio: <code className="bg-white/10 px-1 rounded text-primary">ais-dev-koibnkq45mizwqn6hmma5p-123551615007.us-east1.run.app</code>.</li>
              <li>Abra as <span className="text-white font-black italic">Configurações (⚙️)</span> no topo direito.</li>
              <li>Vá em <span className="text-white font-black italic">Secrets</span>.</li>
              <li>Adicione <code className="bg-white/10 px-1 rounded text-primary">GOOGLE_MAPS_PLATFORM_KEY</code> com a sua chave.</li>
            </ol>
          </div>
          <p className="text-[10px] text-slate-500 italic">O sistema irá reiniciar automaticamente após a adição.</p>
        </div>
      </div>
    );
  }

  return <AlertsContent />;
};

const AlertsContent: React.FC = () => {
  const navigate = useNavigate();
  const map = useMap();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [alertData, setAlertData] = useState<Record<number, { text: string, meters: number }>>({});

  const alerts = [
    { 
      id: 1, 
      type: 'Acidente', 
      msg: 'KM 24 - Colisão Leve', 
      city: 'Jaboatão', 
      time: '2 min', 
      severity: 'high', 
      position: { lat: -8.1256, lng: -35.0158 } 
    },
    { 
      id: 2, 
      type: 'Obra', 
      msg: 'KM 82 - Recapeamento', 
      city: 'Bezerros', 
      time: '15 min', 
      severity: 'medium', 
      position: { lat: -8.2326, lng: -35.7924 } 
    },
    { 
      id: 3, 
      type: 'Radar', 
      msg: 'Novo radar KM 115', 
      city: 'Caruaru', 
      time: '1h', 
      severity: 'low', 
      position: { lat: -8.2831, lng: -35.9727 } 
    },
    { 
      id: 4, 
      type: 'Animal', 
      msg: 'Animais na pista KM 310', 
      city: 'Custódia', 
      time: '22 min', 
      severity: 'medium', 
      position: { lat: -8.0878, lng: -37.6433 } 
    },
  ];

  const handlePlaceSelect = useCallback((place: any) => {
    if (place && map) {
      const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
      const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
      map.panTo({ lat, lng });
      map.setZoom(14);
      setIsSearchOpen(false);
    }
  }, [map]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const routesLib = useMapsLibrary('routes');
  const markerLib = useMapsLibrary('marker');

  useEffect(() => {
    if (userLocation && hasValidKey && routesLib) {
      try {
        const service = new routesLib.DistanceMatrixService();
        service.getDistanceMatrix({
          origins: [userLocation],
          destinations: alerts.map(a => a.position),
          travelMode: 'DRIVING' as any,
        }, (response: any, status: any) => {
          if (status === 'OK' && response && response.rows && response.rows[0]) {
            const data: Record<number, { text: string, meters: number }> = {};
            response.rows[0].elements.forEach((element: any, index: number) => {
              if (element && element.status === 'OK' && alerts[index]) {
                data[alerts[index].id] = {
                  text: element.distance.text,
                  meters: element.distance.value
                };
              }
            });
            setAlertData(data);
          }
        });
      } catch (err) {
        console.warn('Distance Matrix Service failed:', err);
      }
    }
  }, [userLocation, routesLib]);

  const categories = ['Todos', 'Trânsito', 'Segurança', 'Clima', 'Serviços'];

  if (!markerLib) {
    return (
      <div className="min-h-screen bg-[#05100a] flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white overflow-hidden flex flex-col">
      <style>{infoWindowStyles}</style>
      
      {/* Background Abstract Map Grid (Keep as subtle overlay) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-10" style={{ 
        backgroundImage: 'radial-gradient(#00E676 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }}></div>

      {/* Top Header */}
      <header className="relative z-20 px-6 py-6 border-b border-white/5 bg-[#05100a]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
           <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                 <Navigation size={22} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-sm font-black italic uppercase italic tracking-widest leading-none">Mapa de Alertas</h1>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Atualizado agora</p>
              </div>
           </div>
           <button 
             onClick={() => navigate('/reportar')}
             className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
           >
             <PlusCircle size={20} />
           </button>
        </div>
      </header>

      {/* Categories Filter */}
      <div className="relative z-20 flex overflow-x-auto px-6 py-4 no-scrollbar gap-3 bg-[#05100a]/40 border-b border-white/5">
         {categories.map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
               selectedCategory === cat ? 'bg-primary text-black border-primary' : 'bg-white/5 text-slate-400 border-white/10'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Real Google Map View */}
        <section id="alerts-map-container" className="flex-1 relative min-h-[350px] md:min-h-full">
           <Map
             defaultCenter={BR232_CENTER}
             defaultZoom={8}
             mapId="DEMO_MAP_ID" 
             internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
             disableDefaultUI={true}
             style={{ width: '100%', height: '100%' }}
           >
             {map && markerLib && alerts.map(alert => (
               <AdvancedMarker 
                 key={alert.id}
                 position={alert.position}
                 onClick={() => setSelectedAlertId(alert.id)}
               >
                 <div className="relative group">
                    <div className={`size-10 rounded-xl flex items-center justify-center border-2 shadow-2xl transition-transform ${
                      alert.id === selectedAlertId ? 'scale-125 z-50' : 'group-hover:scale-110'
                    } ${
                      alert.severity === 'high' ? 'bg-red-500/20 border-red-500 text-red-500' : 
                      alert.severity === 'medium' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 
                      'bg-primary/20 border-primary text-primary'
                    }`}>
                       <AlertTriangle size={20} />
                    </div>
                    
                    {/* Ripple for High Priority */}
                    {alert.severity === 'high' && (
                      <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping opacity-40"></div>
                    )}
                 </div>
               </AdvancedMarker>
             ))}

             {/* InfoWindow for Selected Alert */}
             <AnimatePresence>
               {selectedAlertId && (
                 <InfoWindow
                   position={alerts.find(a => a.id === selectedAlertId)?.position}
                   onCloseClick={() => setSelectedAlertId(null)}
                 >
                   {(() => {
                     const alert = alerts.find(a => a.id === selectedAlertId);
                     if (!alert) return null;
                     return (
                       <div className="p-1 min-w-[160px]">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{alert.type}</span>
                             <span className="text-[8px] font-bold text-slate-400">{alert.time}</span>
                          </div>
                          <h4 className="text-[12px] font-black italic uppercase leading-tight mb-2 text-white">{alert.msg}</h4>
                          <div className="flex items-center gap-1 text-[9px] text-primary font-bold">
                             <MapPin size={10} /> <span>{alert.city}</span>
                          </div>
                       </div>
                     );
                   })()}
                 </InfoWindow>
               )}
             </AnimatePresence>
           </Map>

           {/* Search Overlay */}
           <AnimatePresence>
             {isSearchOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="absolute top-6 left-6 right-6 md:left-auto md:right-24 md:w-80 z-50"
               >
                 <div className="bg-[#0c1a14]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 shadow-2xl">
                   <div className="flex items-center gap-2 mb-2 px-4 pt-2">
                     <Search size={14} className="text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pesquisar na Malha</span>
                     <button 
                       onClick={() => setIsSearchOpen(false)}
                       className="ml-auto size-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
                     >
                       <X size={14} />
                     </button>
                   </div>
                   <PlaceAutocomplete 
                     onPlaceSelect={handlePlaceSelect}
                     placeholder="Buscar KM, Posto ou Cidade..."
                   />
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Floating Map Controls */}
           <div className="absolute right-6 top-6 space-y-3 z-30">
              <button className="size-12 rounded-2xl bg-[#0c1a14]/90 backdrop-blur-3xl border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black active:scale-95 transition-all text-white shadow-2xl">
                 <Layers size={20} />
              </button>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`size-12 rounded-2xl bg-[#0c1a14]/90 backdrop-blur-3xl border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black active:scale-95 transition-all shadow-2xl ${isSearchOpen ? 'bg-primary text-black' : 'text-white'}`}
              >
                 <Search size={20} />
              </button>
           </div>
        </section>

        {/* Alerts List (Side/Bottom Sidebar) */}
        <aside className="w-full md:w-[400px] bg-[#0c1a14]/95 md:bg-[#0c1a14]/80 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[50vh] md:h-full relative z-30">
           <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                 <Clock size={14} className="text-primary" /> Recentes na Malha
              </h3>
              <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[8px] font-black uppercase leading-none">{alerts.length} Ativos</span>
           </div>
           
           <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">
              {[...alerts].sort((a,b) => (alertData[a.id]?.meters || 9e9) - (alertData[b.id]?.meters || 9e9)).map(alert => (
                <motion.div 
                  key={alert.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-5 border rounded-3xl group cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden ${
                    selectedAlertId === alert.id ? 'bg-primary/10 border-primary/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                   {/* Proximity Indicator */}
                   {alertData[alert.id] && alertData[alert.id].meters < 50000 && (
                     <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl italic">
                       Próximo
                     </div>
                   )}

                   <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                     alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                     alert.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' : 
                     'bg-primary/10 text-primary'
                   }`}>
                      <AlertTriangle size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-[10px] font-black uppercase italic leading-none">{alert.type}</span>
                         <span className="text-[8px] font-bold text-slate-500 tracking-widest">{alert.time}</span>
                      </div>
                      <h4 className="text-sm font-black italic uppercase leading-tight truncate">{alert.msg}</h4>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MapPin size={8} /> {alert.city} {alertData[alert.id] && <span className="text-primary ml-1">({alertData[alert.id].text})</span>}
                      </p>
                   </div>
                   <ChevronRight size={16} className={`transition-colors ${
                     selectedAlertId === alert.id ? 'text-primary' : 'text-slate-700 group-hover:text-primary'
                   }`} />
                </motion.div>
              ))}
           </div>

           <div className="p-6 bg-black/40 border-t border-white/5">
              <button 
                onClick={() => navigate('/reportar')}
                className="w-full h-15 bg-primary hover:bg-green-400 text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,230,118,0.2)]"
              >
                 Reportar Ocorrência <PlusCircle size={18} />
              </button>
           </div>
        </aside>
      </div>

    </div>
  );
};

export default Alerts;
