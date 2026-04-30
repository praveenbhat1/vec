import { useState, useMemo, useEffect, useRef } from 'react';
import { useDashboard } from '../../context';
import { Map as MapIcon, Crosshair, Navigation, Zap, Globe, MapPin, AlertCircle, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

// --- CUSTOM MARKER ICONS ---
const createCustomIcon = (color, isCritical) => {
  return new L.DivIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
        <div class="relative w-4 h-4 rounded-full border-2 border-black shadow-lg flex items-center justify-center transition-transform hover:scale-125" style="background-color: ${color}">
          <div class="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
        </div>
        ${isCritical ? '<div class="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></div>' : ''}
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10]
  });
};

// --- MAP HELPER COMPONENTS ---
function MapController({ center, zoom }) {
  const map = useMap();
  const prevRef = useRef({ center, zoom });

  useEffect(() => {
    const isSame = 
      prevRef.current.center[0] === center[0] && 
      prevRef.current.center[1] === center[1] && 
      prevRef.current.zoom === zoom;

    if (!isSame) {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
      prevRef.current = { center, zoom };
    }
  }, [map, center, zoom]);

  return null;
}

export default function MapPanel() {
    const { addToast, incidents, updateStatus } = useDashboard();
    const [mapCenter, setMapCenter] = useState([13.3409, 74.7421]); // Default Udupi
    const [mapZoom, setMapZoom] = useState(12);

    const validIncidents = useMemo(() => (incidents || []).filter(a => {
        const lat = parseFloat(a.latitude);
        const lng = parseFloat(a.longitude);
        return !isNaN(lat) && !isNaN(lng);
    }), [incidents]);

    const getMarkerColor = (severity) => {
        const s = severity?.toLowerCase();
        if (s === 'critical' || s === 'high') return '#ef4444'; // Red
        if (s === 'warning' || s === 'medium') return '#fbbf24'; // Yellow
        return '#10b981'; // Green
    };

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
                        onClick={() => {
                            setMapCenter([13.3409, 74.7421]);
                            setMapZoom(12);
                            addToast('Recalibrating GPS...', 'info');
                        }}
                        className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Crosshair className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Map Body */}
            <div className="flex-1 relative overflow-hidden bg-[#0a0a0c]">
                
                <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    scrollWheelZoom={true}
                    className="w-full h-full z-10"
                    zoomControl={false}
                >
                    {/* Control Room Style Dark Tiles */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={50}
                        showCoverageOnHover={false}
                    >
                        {validIncidents.map(incident => (
                            <Marker
                                key={incident.id}
                                position={[parseFloat(incident.latitude), parseFloat(incident.longitude)]}
                                icon={createCustomIcon(
                                    getMarkerColor(incident.severity), 
                                    incident.severity?.toLowerCase() === 'critical'
                                )}
                            >
                                <Popup className="custom-leaflet-popup">
                                    <div className="p-4 bg-[#0E1015] text-white font-mono min-w-[220px] border border-white/10 shadow-2xl rounded-none">
                                        <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
                                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getMarkerColor(incident.severity) }} />
                                            <strong className="text-xs tracking-[0.2em] uppercase text-white/90">{incident.type}</strong>
                                        </div>
                                        <div className="space-y-2 mt-3">
                                            <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest">
                                                <span>Location</span>
                                                <span className="text-white/80">{incident.location}</span>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest">
                                                <span>Severity</span>
                                                <span className="font-bold" style={{ color: getMarkerColor(incident.severity) }}>{incident.severity}</span>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest">
                                                <span>Status</span>
                                                <span className="text-blue-400">{incident.status}</span>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest pt-1">
                                                <span>Timestamp</span>
                                                <span className="text-white/20">{incident.time || 'SYNCHRONIZING...'}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => updateStatus(incident.id, 'RESPONDING')}
                                            className="w-full mt-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-[8px] uppercase tracking-[0.3em] transition-all"
                                        >
                                            ENGAGE_RESPONSE
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    <MapController center={mapCenter} zoom={mapZoom} />
                </MapContainer>

                {/* Tactical Legend HUD */}
                <div className="absolute top-10 right-10 flex flex-col gap-3 p-6 bg-black/60 backdrop-blur-2xl border border-white/5 opacity-60 hover:opacity-100 transition-opacity z-[1000] pointer-events-none sm:pointer-events-auto">
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

                {/* Scanning Laser Line Overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 opacity-5">
                   <div className="w-full h-[1px] bg-cyan-500 animate-scan-y" />
                </div>
            </div>

            {/* Bottom Footer Telemetry */}
            <div className="px-6 py-4 bg-black flex flex-wrap justify-between items-center bg-white/[0.02] z-20">
                <div className="flex gap-10">
                    <div className="flex items-center gap-3">
                         <Globe className="w-3.5 h-3.5 text-white/20" />
                         <span className="font-mono text-[8px] text-white/40 tracking-[0.3em] uppercase">LINK: OSM_CARTODB_SECURE</span>
                    </div>
                    <div className="flex items-center gap-3 hidden sm:flex">
                         <Zap className="w-3.5 h-3.5 text-yellow-500/20" />
                         <span className="font-mono text-[8px] text-white/40 tracking-[0.3em] uppercase">SIGNAL: ENCRYPTED_HYBRID</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="font-mono text-[8px] text-white/10 uppercase tracking-widest">{validIncidents.length} NODES_ON_GRID</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-leaflet-popup .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }
                .custom-leaflet-popup .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
                }
                .custom-leaflet-popup .leaflet-popup-tip {
                    background: #0E1015 !important;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .leaflet-container {
                    background: #0a0a0c !important;
                }
                .leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {
                    transition: transform 0.3s ease-out, opacity 0.3s ease-in;
                }
                .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
                    background-color: rgba(0, 240, 255, 0.1) !important;
                }
                .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
                    background-color: rgba(0, 240, 255, 0.3) !important;
                    color: white !important;
                    font-family: 'JetBrains Mono', monospace !important;
                    font-weight: 800 !important;
                    font-size: 10px !important;
                }
            `}} />
        </div>
    );
}

