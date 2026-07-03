import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  policeStations,
  crimeIncidents,
  districts
} from '../../data/mockCrimeData';
import MapFilters from './MapFilters';
import {
  Play,
  Pause,
  Calendar,
  TrendingUp,
  Activity,
  Shield,
  ShieldAlert,
  FileText,
  Clock,
  Navigation
} from 'lucide-react';

const stationIcon = L.divIcon({
  className: 'custom-station-marker',
  html: `
    <div class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900/90 border border-blue-500/60 shadow-lg shadow-[#d4a853]/20 text-blue-400 hover:scale-110 hover:border-blue-500 transition-all duration-200">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/></svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const getHotspotPulseIcon = (subhead) => {
  const isBurglary = subhead === 'Burglary by Night';
  const className = isBurglary ? 'hotspot-pulse-double' : 'hotspot-pulse yellow';
  return L.divIcon({
    className: 'custom-hotspot-marker-icon',
    html: `<div class="${className}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function MapController({ flyTo, activeRole }) {
  const map = useMap();
  const prevRole = useRef(activeRole);

  useEffect(() => {
    if (flyTo) {
      const { center, zoom } = flyTo;
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [flyTo, map]);

  useEffect(() => {
    if (prevRole.current !== activeRole) {
      prevRole.current = activeRole;

      if (activeRole === 'INVESTIGATION_OFFICER') {
        map.setView([12.97452, 77.624424], 15);
        map.setMaxBounds([
          [12.96, 77.61],
          [12.99, 77.64]
        ]);
      } else if (activeRole === 'DISTRICT_OFFICER') {
        map.setView([12.9716, 77.5946], 12);
        map.setMaxBounds([
          [12.80, 77.40],
          [13.15, 77.80]
        ]);
      } else {
        map.setView([14.5, 75.7], 7.5);
        map.setMaxBounds([[-90, -180], [90, 180]]);
      }
    }
  }, [activeRole, map]);

  return null;
}

const TIMELINE_STEPS = [
  { label: 'Nov 2025', datePrefix: '2025-11' },
  { label: 'Dec 2025', datePrefix: '2025-12' },
  { label: 'Jan 2026', datePrefix: '2026-01' },
  { label: 'Feb 2026', datePrefix: '2026-02' },
  { label: 'Mar 2026', datePrefix: '2026-03' },
  { label: 'Apr 2026', datePrefix: '2026-04' },
  { label: 'May 2026', datePrefix: '2026-05' },
  { label: 'Jun 2026', datePrefix: '2026-06' },
  { label: 'Jul 2026', datePrefix: '2026-07' }
];

export default function HotspotMap({ activeRole }) {
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    stations: true,
    hotspots: true
  });

  const [selectedCategories, setSelectedCategories] = useState([
    'Property Offences',
    'Cyber Crimes',
    'Crimes Against Body',
    'Narcotics NDPS',
    'Public Nuisance'
  ]);
  const [severity, setSeverity] = useState('all');

  const [timelineIndex, setTimelineIndex] = useState(TIMELINE_STEPS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCumulative, setIsCumulative] = useState(true);

  const [flyToTarget, setFlyToTarget] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimelineIndex((prevIndex) => {
          if (prevIndex === TIMELINE_STEPS.length - 1) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 1500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const mapCenter = useMemo(() => {
    if (activeRole === 'INVESTIGATION_OFFICER') return [12.97452, 77.624424];
    if (activeRole === 'DISTRICT_OFFICER') return [12.9716, 77.5946];
    return [14.5, 75.7];
  }, [activeRole]);

  const mapZoom = useMemo(() => {
    if (activeRole === 'INVESTIGATION_OFFICER') return 15;
    if (activeRole === 'DISTRICT_OFFICER') return 12;
    return 7.5;
  }, [activeRole]);

  const filteredCrimes = useMemo(() => {
    return crimeIncidents.filter(c => {
      if (activeRole === 'DISTRICT_OFFICER' && c.districtId !== 1) return false;
      if (activeRole === 'INVESTIGATION_OFFICER' && c.unitId !== 1) return false;
      if (!selectedCategories.includes(c.crimeHeadName)) return false;
      if (severity !== 'all' && c.gravity !== severity) return false;
      const activeStep = TIMELINE_STEPS[timelineIndex];
      if (isCumulative) {
        const activeDateStr = `${activeStep.datePrefix}-31`;
        return c.registrationDate <= activeDateStr;
      } else {
        return c.registrationDate.startsWith(activeStep.datePrefix);
      }
    });
  }, [selectedCategories, severity, timelineIndex, isCumulative, activeRole]);

  const stationsWithStats = useMemo(() => {
    return policeStations.map(station => {
      const stationCrimes = filteredCrimes.filter(c => c.unitId === station.id);
      const total = stationCrimes.length;
      const disposed = stationCrimes.filter(c => c.caseStatusName === 'Disposed').length;
      const heinous = stationCrimes.filter(c => c.gravity === '1').length;
      const clearanceRate = total > 0 ? Math.round((disposed / total) * 100) : 75;

      let alertLevel = 'Normal';
      if (heinous > 5 || total > 20) alertLevel = 'High Alert';
      else if (heinous > 2 || total > 10) alertLevel = 'Medium Alert';

      return {
        ...station,
        totalCrimes: total,
        disposedCrimes: disposed,
        heinousCrimes: heinous,
        clearanceRate,
        alertLevel
      };
    });
  }, [filteredCrimes]);

  const handleFlyToHotspot = (preset) => {
    if (preset === 'bengaluru') {
      setFlyToTarget({ center: [12.975, 77.625], zoom: 14 });
    } else if (preset === 'coastal') {
      setFlyToTarget({ center: [12.8703, 74.8436], zoom: 11 });
    } else {
      setFlyToTarget({
        center: activeRole === 'INVESTIGATION_OFFICER' ? [12.97452, 77.624424] :
                activeRole === 'DISTRICT_OFFICER' ? [12.9716, 77.5946] : [14.5, 75.7],
        zoom: activeRole === 'INVESTIGATION_OFFICER' ? 15 :
              activeRole === 'DISTRICT_OFFICER' ? 12 : 7.5
      });
    }
  };

  return (
    <div className="flex flex-col grow rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative h-[calc(100vh-10rem)] min-h-[500px]">

      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapController flyTo={flyToTarget} activeRole={activeRole} />

          {activeLayers.heatmap && filteredCrimes.map((crime) => {
            const isHeinous = crime.gravity === '1';
            const color = isHeinous ? '#cc3333' : '#d4a853';
            const radius = isHeinous ? 180 : 120;
            return (
              <Circle
                key={`heat-${crime.id}`}
                center={[crime.latitude, crime.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.1,
                  color: 'transparent',
                  weight: 0
                }}
              />
            );
          })}

          {activeLayers.hotspots && filteredCrimes
            .filter(c => c.isAnomaly || c.crimeSubHeadName === 'Burglary by Night' || c.crimeSubHeadName === 'Drunken Brawl')
            .slice(0, 45)
            .map((crime) => (
              <Marker
                key={`hotspot-${crime.id}`}
                position={[crime.latitude, crime.longitude]}
                icon={getHotspotPulseIcon(crime.crimeSubHeadName)}
              >
                <Popup className="tactical-popup">
                  <div className="p-1 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] font-bold text-[#cc3333] uppercase tracking-wider flex items-center space-x-1">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Hotspot Alert
                      </span>
                      <span className="text-[8px] bg-[#8b0000]/10 text-[#cc3333] border border-[#8b0000]/20 px-1 rounded font-bold uppercase">
                        {crime.gravity === '1' ? 'HEINOUS' : 'MINOR'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-50">{crime.crimeSubHeadName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{crime.unitName} &bull; {crime.districtName}</p>
                    </div>

                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 space-y-1 text-[9px] text-slate-50">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">FIR No:</span>
                        <span className="font-bold">{crime.crimeNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Occurred:</span>
                        <span className="font-semibold">{crime.registrationDate} @ {crime.time}</span>
                      </div>
                      {crime.moPhrase && (
                        <div className="border-t border-slate-800 pt-1 mt-1">
                          <span className="text-blue-400 font-semibold block uppercase text-[8px] tracking-wide">MO Pattern:</span>
                          <span className="italic text-slate-400 leading-normal block">{crime.moPhrase}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          }

          {activeLayers.stations && stationsWithStats
            .filter(s => activeRole !== 'DISTRICT_OFFICER' || s.districtId === 1)
            .filter(s => activeRole !== 'INVESTIGATION_OFFICER' || s.id === 1)
            .map((station) => (
              <Marker
                key={`station-${station.id}`}
                position={[station.lat, station.lon]}
                icon={stationIcon}
              >
                <Popup className="station-popup">
                  <div className="w-56 space-y-2.5 p-0.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-50">{station.name}</h4>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{station.alertLevel}</span>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        station.alertLevel === 'High Alert' ? 'bg-[#8b0000]/10 text-[#cc3333] border border-[#8b0000]/20' :
                        station.alertLevel === 'Medium Alert' ? 'bg-blue-900/50 text-blue-400 border border-slate-700' :
                        'bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/20'
                      }`}>
                        Unit {station.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-center">
                      <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[16px] font-extrabold text-[#2b5f9e] block leading-tight">{station.totalCrimes}</span>
                        <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider block">Crimes Logged</span>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[16px] font-extrabold text-[#2e7d32] block leading-tight">{station.clearanceRate}%</span>
                        <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider block">Clearance Rate</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-900/50 p-2 rounded-lg border border-blue-500/5 text-[9px] text-slate-400 leading-normal">
                      <div className="flex justify-between">
                        <span>Jurisdiction Personnel:</span>
                        <span className="font-bold text-slate-50">{station.staff} Officers</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Patrol Interceptors:</span>
                        <span className="font-bold text-slate-50">{station.vehicles} Vehicles</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heinous Offences:</span>
                        <span className={`font-bold ${station.heinousCrimes > 0 ? 'text-[#cc3333]' : 'text-slate-400'}`}>{station.heinousCrimes} cases</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>

        <MapFilters
          activeLayers={activeLayers}
          setActiveLayers={setActiveLayers}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          severity={severity}
          setSeverity={setSeverity}
          onFlyToHotspot={handleFlyToHotspot}
          activeRole={activeRole}
        />

        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl p-4 w-60 text-slate-50 pointer-events-auto flex flex-col space-y-3">
          <div>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Intelligence Summary</span>
            <h4 className="text-xs font-bold text-slate-50">Filtered Incident Registry</h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
              <span className="flex items-center text-slate-400">
                <Activity className="h-3.5 w-3.5 mr-1.5 text-[#2b5f9e]" />
                Active Crimes Count
              </span>
              <span className="font-extrabold text-[#2b5f9e]">{filteredCrimes.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
              <span className="flex items-center text-slate-400">
                <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-[#cc3333]" />
                Heinous Offences
              </span>
              <span className="font-extrabold text-[#cc3333]">
                {filteredCrimes.filter(c => c.gravity === '1').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-slate-400">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                Planted Anomalies
              </span>
              <span className="font-extrabold text-blue-400">
                {filteredCrimes.filter(c => c.isAnomaly).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 p-4 px-6 flex flex-col md:flex-row items-center gap-4 select-none">
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-xl transition-all border ${
              isPlaying
                ? 'bg-blue-900/50 text-blue-400 border-slate-700 hover:bg-blue-700/40'
                : 'bg-[#2b5f9e]/20 hover:bg-[#2b5f9e]/30 text-[#2b5f9e] border-[#2b5f9e]/30'
            }`}
          >
            {isPlaying ? <Pause className="h-[18px] w-[18px]" fill="currentColor" /> : <Play className="h-[18px] w-[18px]" fill="currentColor" />}
          </button>

          <div className="text-xs">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">TIMELINE</span>
            <span className="font-bold text-slate-50 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              {TIMELINE_STEPS[timelineIndex].label}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full px-2 relative">
          <input
            type="range"
            min="0"
            max={TIMELINE_STEPS.length - 1}
            value={timelineIndex}
            onChange={(e) => {
              setTimelineIndex(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer focus:outline-none accent-[#d4a853]"
          />

          <div className="flex justify-between text-[7px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-wide">
            {TIMELINE_STEPS.map((step, idx) => (
              <span
                key={step.label}
                onClick={() => {
                  setTimelineIndex(idx);
                  setIsPlaying(false);
                }}
                className={`cursor-pointer transition-colors ${idx === timelineIndex ? 'text-blue-400 scale-105' : 'hover:text-slate-50'}`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px] shrink-0 font-bold">
          <button
            onClick={() => setIsCumulative(true)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isCumulative
                ? 'bg-blue-600 text-[#0a0f1a] shadow-sm'
                : 'text-slate-400 hover:text-slate-50'
            }`}
          >
            Cumulative
          </button>
          <button
            onClick={() => setIsCumulative(false)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !isCumulative
                ? 'bg-blue-600 text-[#0a0f1a] shadow-sm'
                : 'text-slate-400 hover:text-slate-50'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
    </div>
  );
}
