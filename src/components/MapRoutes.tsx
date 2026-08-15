import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Compass, MapPin, CheckCircle, Navigation, Info, ShieldCheck } from 'lucide-react';
import { MAP_NODES, PRESET_ROUTES } from '../mockData';

interface MapRoutesProps {
  onAddLogMessage?: (title: string, message: string, type: 'delivery' | 'system') => void;
  onLogDeliverySimulated?: (earnings: number, km: number, app: string) => void;
  currentKm: number;
}

export default function MapRoutes({ onAddLogMessage, onLogDeliverySimulated, currentKm }: MapRoutesProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r1');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [estimatedFuelSaved, setEstimatedFuelSaved] = useState<number>(0);
  const [gpsStatus, setGpsStatus] = useState<'Inativo' | 'Buscando GPS...' | 'Rastreando Ativo'>('Inativo');
  const [currentCoordName, setCurrentCoordName] = useState<string>("São Paulo, SP");

  // Keep a ref of values to avoid re-triggering useEffect
  const simIntervalRef = useRef<any>(null);

  const selectedRoute = PRESET_ROUTES.find(r => r.id === selectedRouteId) || PRESET_ROUTES[0];

  useEffect(() => {
    // Leaflet is loaded globally in index.html
    const L = (window as any).L;
    if (!L) return;

    // Check if map container is already initialized
    const mapContainer = document.getElementById('map-element');
    if (!mapContainer) return;

    // Clean up previous map if exists
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.error("Error removing map", e);
      }
      mapRef.current = null;
    }

    // Initialize map centering on São Paulo / Av. Paulista
    const map = L.map('map-element', {
      zoomControl: false,
      attributionControl: false
    }).setView([-23.5614, -46.6559], 13);
    
    mapRef.current = map;

    // Add a dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Add standard zoom control at the bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Initial marker (motoboy icon)
    const riderIcon = L.divIcon({
      html: `<div class="w-8 h-8 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center shadow-lg animate-pulse">
              <span class="text-xs font-bold text-black">🏍️</span>
             </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const startCoords = selectedRoute.stops[0].coords;
    markerRef.current = L.marker(startCoords, { icon: riderIcon }).addTo(map);

    // Draw markers for all stops
    selectedRoute.stops.forEach((stop, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === selectedRoute.stops.length - 1;
      const stopColor = isStart ? 'bg-green-500' : isEnd ? 'bg-red-500' : 'bg-blue-500';
      const stopLabel = isStart ? 'A' : isEnd ? 'B' : `${idx + 1}`;

      const stopIcon = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full ${stopColor} border border-white flex items-center justify-center shadow-md">
                <span class="text-xxs font-bold text-white">${stopLabel}</span>
               </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker(stop.coords, { icon: stopIcon })
        .addTo(map)
        .bindPopup(`<b>Ponto ${stopLabel}:</b> ${stop.name}`);
    });

    // Draw route line
    const routePoints = selectedRoute.stops.map(stop => stop.coords);
    routeLineRef.current = L.polyline(routePoints, {
      color: '#eab308', // yellow-500
      weight: 4,
      opacity: 0.8,
      dashArray: '5, 10'
    }).addTo(map);

    // Fit map to route bounds
    map.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error("Clean map failure", e);
        }
        mapRef.current = null;
      }
    };
  }, [selectedRouteId]);

  // Simulate GPS tracking and movement
  const startGpsSimulation = () => {
    if (isSimulating) {
      // Stop
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      setGpsStatus('Inativo');
      setSpeedKmh(0);
      return;
    }

    const L = (window as any).L;
    if (!L || !mapRef.current || !markerRef.current) return;

    setIsSimulating(true);
    setGpsStatus('Buscando GPS...');
    setSpeedKmh(0);
    setDistanceTraveled(0);
    setSimulationProgress(0);

    let progress = 0;
    const stops = selectedRoute.stops;
    const totalSteps = 50; // number of increments
    const totalDistance = selectedRoute.distance;
    
    // Dispatch system notification
    if (onAddLogMessage) {
      onAddLogMessage(
        "Simulador GPS Ativo", 
        `Iniciando rastreamento de rota otimizada: ${selectedRoute.name}`, 
        'system'
      );
    }

    // Short timeout to simulate "acquiring satellites"
    setTimeout(() => {
      setGpsStatus('Rastreando Ativo');
      
      simIntervalRef.current = setInterval(() => {
        progress += 1;
        const currentRatio = progress / totalSteps;
        setSimulationProgress(Math.floor(currentRatio * 100));

        // Random realistic speed between 35 and 55 km/h for motorbikes in city
        const randomSpeed = Math.floor(Math.random() * 20) + 35;
        setSpeedKmh(randomSpeed);

        // Update distance
        const dist = parseFloat((currentRatio * totalDistance).toFixed(2));
        setDistanceTraveled(dist);

        // Fuel saved calculation based on route efficiency
        const savedFuel = parseFloat((dist * 0.026 * (selectedRoute.savingsFuelPercent / 100)).toFixed(3));
        setEstimatedFuelSaved(savedFuel);

        // Interpolate coordinates
        const stopIndexFloat = currentRatio * (stops.length - 1);
        const currentStopIndex = Math.floor(stopIndexFloat);
        const nextStopIndex = Math.min(currentStopIndex + 1, stops.length - 1);
        const segmentRatio = stopIndexFloat - currentStopIndex;

        const startCoords = stops[currentStopIndex].coords;
        const endCoords = stops[nextStopIndex].coords;

        const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * segmentRatio;
        const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * segmentRatio;

        // Current location name based on nearest stop
        const currentName = stops[nextStopIndex].name;
        setCurrentCoordName(currentName);

        // Move marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], mapRef.current.getZoom());
        }

        if (progress >= totalSteps) {
          clearInterval(simIntervalRef.current);
          setIsSimulating(false);
          setGpsStatus('Inativo');
          setSpeedKmh(0);
          setDistanceTraveled(totalDistance);
          
          // Trigger simulated delivery logs
          const simulatedEarning = Math.floor(totalDistance * 2.5) + 8; // R$ 2.50 per km + flat fee of R$ 8
          
          if (onAddLogMessage) {
            onAddLogMessage(
              "Corrida Concluída", 
              `Você entregou com sucesso em ${stops[stops.length - 1].name}. Ganhos calculados: R$ ${simulatedEarning.toFixed(2)}`, 
              'delivery'
            );
          }

          if (onLogDeliverySimulated) {
            onLogDeliverySimulated(simulatedEarning, totalDistance, 'Particular');
          }
        }
      }, 500); // speed up simulation (every 500ms is a tick)
    }, 1500);
  };

  const resetSimulation = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsSimulating(false);
    setSimulationProgress(0);
    setSpeedKmh(0);
    setDistanceTraveled(0);
    setEstimatedFuelSaved(0);
    setGpsStatus('Inativo');
    setCurrentCoordName("São Paulo, SP");

    const L = (window as any).L;
    if (L && markerRef.current && mapRef.current) {
      markerRef.current.setLatLng(selectedRoute.stops[0].coords);
      mapRef.current.setView(selectedRoute.stops[0].coords, 13);
    }
  };

  return (
    <div id="gps-map-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Route & Controller Panel */}
      <div className="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="font-display font-semibold text-white text-lg">Otimização de Rotas</h2>
              <p className="text-xs text-gray-400">Reduza consumo com GPS inteligente</p>
            </div>
          </div>

          {/* Select Route */}
          <div className="space-y-3 mb-5">
            <label className="text-xs text-gray-400 font-medium">Selecione uma Rota do Sistema:</label>
            {PRESET_ROUTES.map((route) => (
              <button
                key={route.id}
                id={`btn-route-${route.id}`}
                onClick={() => {
                  if (!isSimulating) setSelectedRouteId(route.id);
                }}
                disabled={isSimulating}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${
                  selectedRouteId === route.id
                    ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400'
                    : 'bg-[#18191c] border-[#222428] text-gray-300 hover:border-gray-600 disabled:opacity-50'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    {route.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex gap-2">
                    <span>🏁 {route.stops.length} paradas</span>
                    <span>•</span>
                    <span>📏 {route.distance} KM</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    -{route.savingsFuelPercent}% Gasolina
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Stops List */}
          <div className="bg-[#18191c] border border-[#222428] rounded-lg p-3.5 mb-5">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Sequência da Rota Otimizada:</p>
            <div className="space-y-3 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2b2d31]">
              {selectedRoute.stops.map((stop, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === selectedRoute.stops.length - 1;
                return (
                  <div key={idx} className="flex items-start gap-3 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStart ? 'bg-green-500 text-white' : isEnd ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {isStart ? 'A' : isEnd ? 'B' : idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{stop.name}</p>
                      <p className="text-xxs text-gray-400">Coordenadas: {stop.coords[0].toFixed(4)}, {stop.coords[1].toFixed(4)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GPS Control Status Panel */}
        <div className="space-y-4">
          <div className="border-t border-[#212327] pt-4 flex justify-between items-center">
            <div>
              <p className="text-xxs text-gray-400 uppercase tracking-wider font-semibold">Status do Rastreamento GPS</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${
                  gpsStatus === 'Rastreando Ativo' ? 'bg-green-500 animate-ping' : gpsStatus === 'Buscando GPS...' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'
                }`}></span>
                <span className="text-xs font-semibold text-gray-200">{gpsStatus}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xxs text-gray-400 uppercase tracking-wider font-semibold">Velocidade Atual</p>
              <p className="text-sm font-mono font-bold text-yellow-400">{speedKmh} km/h</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-simulate-gps"
              onClick={startGpsSimulation}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all ${
                isSimulating
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/10'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {isSimulating ? 'Parar Rastreamento' : 'Simular Entrega'}
            </button>
            <button
              id="btn-reset-gps"
              onClick={resetSimulation}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1c1d20] border border-[#2d2e33] hover:border-gray-600 text-gray-300 font-semibold text-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
          </div>

          {isSimulating && (
            <div className="bg-[#18191c] border border-[#222428] rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xxs text-gray-400 font-semibold">
                <span>Progresso da Rota</span>
                <span>{simulationProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#24262b] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${simulationProgress}%` }}></div>
              </div>
              <p className="text-xxs text-gray-400 italic flex items-center gap-1 text-center justify-center mt-1">
                <MapPin className="w-3 h-3 text-red-400" />
                Local atual: <span className="text-white not-italic font-bold">{currentCoordName}</span>
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Live Map Visualizer Container */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Real-time stats header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111214] border border-[#212327] rounded-xl p-3.5 flex flex-col justify-between">
            <p className="text-xxs text-gray-400 font-semibold uppercase">Distância Percorrida</p>
            <p className="text-lg font-mono font-bold text-white mt-1">
              {distanceTraveled} <span className="text-xs text-gray-400">km</span>
            </p>
          </div>
          <div className="bg-[#111214] border border-[#212327] rounded-xl p-3.5 flex flex-col justify-between">
            <p className="text-xxs text-gray-400 font-semibold uppercase">Economia Estimada</p>
            <p className="text-lg font-mono font-bold text-emerald-400 mt-1">
              {estimatedFuelSaved} <span className="text-xs">L</span>
            </p>
          </div>
          <div className="bg-[#111214] border border-[#212327] rounded-xl p-3.5 flex flex-col justify-between">
            <p className="text-xxs text-gray-400 font-semibold uppercase">KM Inicial do Turno</p>
            <p className="text-lg font-mono font-bold text-gray-300 mt-1">
              {currentKm} <span className="text-xs text-gray-400">km</span>
            </p>
          </div>
          <div className="bg-[#111214] border border-[#212327] rounded-xl p-3.5 flex flex-col justify-between">
            <p className="text-xxs text-gray-400 font-semibold uppercase">KM Atual Estimado</p>
            <p className="text-lg font-mono font-bold text-yellow-400 mt-1">
              {(currentKm + distanceTraveled).toFixed(1)} <span className="text-xs text-yellow-400">km</span>
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[420px] bg-[#111214] border border-[#212327] rounded-xl overflow-hidden shadow-2xl">
          <div id="map-element" className="absolute inset-0 w-full h-full z-10"></div>
          
          {/* Overlay Map HUD Elements */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
            <div className="bg-[#0f1011]/90 backdrop-blur-md border border-[#2a2c31] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xxs font-bold uppercase tracking-wider text-white">Rotas Certificadas Ecologicamente</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-20 bg-[#0f1011]/90 backdrop-blur-md border border-[#2a2c31] px-3 py-2 rounded-lg max-w-xs shadow-lg pointer-events-none">
            <div className="flex gap-2 items-start">
              <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xxs font-bold text-white">Roteirizador de Baixo Carbono</p>
                <p className="text-3xs text-gray-400 mt-0.5">Calcula inclinação das vias e semáforos para minimizar paradas, reduzindo o consumo de combustível em até 15%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
