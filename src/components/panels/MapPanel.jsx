import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { useDashboard } from '../../context';
import { Map as MapIcon, Crosshair, Navigation, Zap, Globe, MapPin, AlertCircle, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

// --- CUSTOM MARKER ICONS (Memoized) ---
const iconCache = new Map();
const getCustomIcon = (color, isCritical, isSelected) => {
  const key = `${color}-${isCritical}-${isSelected}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const icon = new L.DivIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full border animate-[ping_3s_infinite] opacity-40" style="border-color: ${color}33"></div>
        <div class="absolute w-8 h-8 rounded-full animate-pulse" style="background-color: ${color}1a"></div>
        <div class="relative w-4 h-4 rounded-full border-2 border-white/80 shadow-[0_0_15px_${color}] flex items-center justify-center transition-all ${isSelected ? 'scale-125' : ''}" style="background-color: ${color}">
          <div class="w-1 h-1 bg-white rounded-full"></div>
        </div>
        ${isCritical ? '<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444] border border-white/20"></div>' : ''}
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -15]
  });
  iconCache.set(key, icon);
  return icon;
};

// --- TACTICAL POPUP COMPONENT (Memoized to prevent flicker) ---
const TacticalPopup = memo(({ incident, onUpdateStatus, onClose }) => {
    const color = (severity) => {
        const s = severity?.toLowerCase();
        if (s === 'critical' || s === 'high') return '#ef4444';
        if (s === 'warning' || s === 'medium') return '#fbbf24';
        return '#10b981';
    };
    
    const statusColor = incident.status?.toLowerCase() === 'active' ? '#00FFCC' : '#3b82f6';
    
    return (
        <div className="p-4 bg-[#0E1015] text-white font-mono min-w-[240px] border border-white/10 shadow-2xl rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
            
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color(incident.severity) }} />
                    <strong className="text-[10px] tracking-[0.2em] uppercase text-white/90">{incident.type}</strong>
                </div>
                {onClose && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <Zap className="w-3 h-3" />
                    </button>
                )}
            </div>
            
            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <span className="text-[7px] text-white/20 uppercase tracking-widest font-black">LOCATION</span>
                    <span className="text-[10px] text-white/80 uppercase">{incident.location}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[7px] text-white/20 uppercase tracking-widest font-black">SEVERITY</span>
                        <span className="text-[10px] font-bold" style={{ color: color(incident.severity) }}>{incident.severity}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[7px] text-white/20 uppercase tracking-widest font-black">STATUS</span>
                        <span className="text-[10px] font-bold" style={{ color: statusColor }}>{incident.status}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(incident.id, 'RESPONDING');
                }}
                className="w-full mt-6 py-3 border border-white/5 bg-white/5 hover:bg-[#00FFCC]/10 hover:border-[#00FFCC]/30 text-[9px] font-black uppercase tracking-[0.3em] transition-all group"
            >
                <span className="group-hover:text-[#00FFCC]">ENGAGE_RESPONSE</span>
            </button>
        </div>
    );
});

// --- MAP HELPER COMPONENTS ---
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [map, center, zoom]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    if (container) resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

export default function MapPanel() {
    const { addToast, incidents, updateStatus, selectedIncidentId, setSelectedIncidentId, responders } = useDashboard();
    const [mapCenter, setMapCenter] = useState([13.3409, 74.7421]);
    const [mapZoom, setMapZoom] = useState(12);
    const [mapMode, setMapMode] = useState('satellite');

    const validIncidents = useMemo(() => (incidents || []).filter(a => {
        const lat = parseFloat(a.latitude);
        const lng = parseFloat(a.longitude);
        return !isNaN(lat) && !isNaN(lng);
    }), [incidents]);

    const getMarkerColor = (severity) => {
        const s = severity?.toLowerCase();
        if (s === 'critical' || s === 'high') return '#ef4444';
        if (s === 'warning' || s === 'medium') return '#fbbf24';
        return '#10b981';
    };

    const responderIcon = (color) => new L.DivIcon({
      html: `<div class="relative flex items-center justify-center">
        <div class="absolute w-6 h-6 rounded-full animate-ping opacity-10" style="background-color: ${color}"></div>
        <div class="w-3 h-3 bg-white border-2 border-black rotate-45 flex items-center justify-center shadow-lg" style="border-color: ${color}">
          <div class="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>`,
      className: 'responder-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    useEffect(() => {
        if (selectedIncidentId) {
            const inc = incidents.find(i => i.id === selectedIncidentId);
            if (inc && inc.latitude && inc.longitude) {
                setMapCenter([parseFloat(inc.latitude), parseFloat(inc.longitude)]);
                setMapZoom(16);
            }
        }
    }, [selectedIncidentId, incidents]);

    return (
        <div className="flex flex-col h-full w-full bg-[#0A0A0B]/20 relative overflow-hidden backdrop-blur-3xl group">
            
            {/* Header HUD */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02] relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 border border-blue-500/20 bg-blue-500/5 flex items-center justify-center">
                        <MapIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h4 className="font-outfit font-black text-xl tracking-tight text-white uppercase leading-none mb-1">GEOSPATIAL_INTEL</h4>
                        <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">SYSTEM: LEAFLET_OSM_HYBRID // GRID: ACTIVE</p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <button
                        onClick={() => setMapMode(prev => prev === 'dark' ? 'satellite' : 'dark')}
                        className={`w-10 h-10 border flex items-center justify-center transition-all ${mapMode === 'satellite' ? 'bg-[#00FFCC] text-black border-[#00FFCC]' : 'border-white/10 text-white/40 hover:text-white hover:bg-white/5'}`}
                        title="Toggle Tactical/Satellite View"
                    >
                        <Globe className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setMapCenter([13.3409, 74.7421]);
                            setMapZoom(12);
                            setSelectedIncidentId(null);
                            addToast('Recalibrating Tactical Grid...', 'success');
                        }}
                        className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Crosshair className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-[#0a0a0c]">
                <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    scrollWheelZoom={true}
                    className="w-full h-full z-10"
                    zoomControl={false}
                >
                    {mapMode === 'dark' ? (
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    ) : (
                        <>
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" zIndex={1000} />
                        </>
                    )}

                    <div className={`absolute inset-0 pointer-events-none z-[400] transition-opacity duration-1000 ${mapMode === 'satellite' ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_2px,3px_100%]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/[0.03] rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>

                    {/* SELECTED INCIDENT (Persistent Layer - rendered outside cluster to prevent flickering) */}
                    {selectedIncidentId && incidents.find(i => i.id === selectedIncidentId) && (
                        (() => {
                            const incident = incidents.find(i => i.id === selectedIncidentId);
                            const lat = parseFloat(incident.latitude);
                            const lng = parseFloat(incident.longitude);
                            if (isNaN(lat) || isNaN(lng)) return null;
                            
                            return (
                                <Marker
                                    key={`selected-${incident.id}`}
                                    position={[lat, lng]}
                                    zIndexOffset={1000}
                                    icon={getCustomIcon(getMarkerColor(incident.severity), incident.severity?.toLowerCase() === 'critical', true)}
                                >
                                    <Popup 
                                        className="custom-leaflet-popup" 
                                        autoPan={false} 
                                        closeButton={false}
                                        closeOnClick={false}
                                        interactive={true}
                                    >
                                        <TacticalPopup 
                                            incident={incident} 
                                            onUpdateStatus={updateStatus} 
                                            onClose={() => setSelectedIncidentId(null)}
                                        />
                                    </Popup>
                                </Marker>
                            );
                        })()
                    )}

                    <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                        {validIncidents
                            .filter(i => i.id !== selectedIncidentId) // Only cluster non-selected incidents
                            .map(incident => (
                            <Marker
                                key={incident.id}
                                position={[parseFloat(incident.latitude), parseFloat(incident.longitude)]}
                                eventHandlers={{ click: () => setSelectedIncidentId(incident.id) }}
                                icon={getCustomIcon(getMarkerColor(incident.severity), incident.severity?.toLowerCase() === 'critical', false)}
                            >
                                <Popup className="custom-leaflet-popup" autoPan={false} closeButton={false}>
                                    <TacticalPopup 
                                        incident={incident} 
                                        onUpdateStatus={updateStatus} 
                                        onClose={() => setSelectedIncidentId(null)}
                                    />
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {responders && responders.map(resp => (
                      <Marker key={resp.id} position={resp.coords} icon={responderIcon(resp.type === 'AMBULANCE' ? '#ef4444' : '#3b82f6')}>
                         <Popup autoPan={false}>
                            <div className="p-2 font-mono text-[9px] uppercase bg-black text-white border border-white/10">
                               {resp.name} // MOVING_TO_OBJECTIVE
                            </div>
                         </Popup>
                      </Marker>
                    ))}

                    <MapController center={mapCenter} zoom={mapZoom} />
                </MapContainer>

                <div className="absolute top-10 right-10 flex flex-col gap-3 p-6 bg-black/60 backdrop-blur-2xl border border-white/5 z-[1000] pointer-events-none sm:pointer-events-auto">
                    {[
                        { label: 'CRITICAL_THREAT', color: '#ef4444' },
                        { label: 'MODERATE_WARN', color: '#fbbf24' },
                        { label: 'STABLE_ACTIVE', color: '#10b981' }
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                            <span className="font-mono text-[7px] font-black uppercase text-white/40 tracking-[0.3em]">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-6 py-4 bg-black flex justify-between items-center bg-white/[0.02] z-20">
                <div className="flex gap-10">
                    <div className="flex items-center gap-3">
                         <Globe className="w-3.5 h-3.5 text-white/20" />
                         <span className="font-mono text-[8px] text-white/40 tracking-[0.3em] uppercase">LINK: OSM_CARTODB_SECURE</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="font-mono text-[8px] text-white/10 uppercase tracking-widest">{validIncidents.length} NODES_ON_GRID</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-leaflet-popup .leaflet-popup-content-wrapper { background: transparent !important; padding: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
                .custom-leaflet-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
                .custom-leaflet-popup .leaflet-popup-tip { background: #0E1015 !important; border: 1px solid rgba(255,255,255,0.1); }
                .leaflet-container { background: #0a0a0c !important; }
                .leaflet-popup-content-wrapper { background: #0A0A0B !important; color: white !important; border: 1px solid rgba(255,255,255,0.1); border-radius: 0 !important; }
                .leaflet-popup-tip { background: #0A0A0B !important; }
            `}} />
        </div>
    );
}
