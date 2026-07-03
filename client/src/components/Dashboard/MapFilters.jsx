import React from 'react';
import {
  Layers,
  Shield,
  Filter,
  Compass,
  Sliders,
  Info,
  MapPin,
  Flame,
  AlertTriangle
} from 'lucide-react';

export default function MapFilters({
  activeLayers,
  setActiveLayers,
  selectedCategories,
  setSelectedCategories,
  severity,
  setSeverity,
  onFlyToHotspot,
  activeRole
}) {
  const categories = [
    'Property Offences',
    'Cyber Crimes',
    'Crimes Against Body',
    'Narcotics NDPS',
    'Public Nuisance'
  ];

  const handleCategoryToggle = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleLayer = (layerKey) => {
    setActiveLayers({
      ...activeLayers,
      [layerKey]: !activeLayers[layerKey]
    });
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-72 bg-[var(--color-canvas-dark)]/95 backdrop-blur-md border border-[var(--color-hairline-dark)] rounded-sm shadow-2xl p-4 text-[var(--color-on-dark)] overflow-y-auto max-h-[calc(100%-2rem)] flex flex-col space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-[var(--color-hairline-dark)] pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="h-[18px] w-[18px] text-[var(--color-primary)]" />
          <h3 className="text-sm font-bold tracking-wide uppercase">Map Controls</h3>
        </div>
        <span className="text-[8px] bg-[var(--color-surface-elevated-dark)] text-[var(--color-primary)] border border-[var(--color-hairline-dark)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          LIVE
        </span>
      </div>

      <div className="bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] rounded-sm p-2.5 flex items-center space-x-2.5">
        <Shield className="h-4 w-4 text-[var(--color-primary)]" />
        <div className="text-[10px]">
          <span className="font-semibold block text-[var(--color-muted)]">Jurisdiction Level</span>
          <span className="font-bold text-[var(--color-primary)]">
            {activeRole === 'SCRB_ADMIN' ? 'State Headquarters' :
             activeRole === 'DISTRICT_OFFICER' ? 'District: Bengaluru Urban' :
             'Station: Shivajinagar PS'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[9px] text-[var(--color-muted)] font-bold uppercase tracking-wider flex items-center space-x-1">
          <Layers className="h-3 w-3" />
          <span>Layer Visibility</span>
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-2 rounded-sm bg-[var(--color-surface-elevated-dark)]/30 border border-[var(--color-hairline-dark)] hover:bg-[var(--color-canvas-dark)]/60 transition-all cursor-pointer">
            <span className="text-xs font-semibold flex items-center space-x-2">
              <Flame className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span>District Heatmap</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.heatmap}
              onChange={() => toggleLayer('heatmap')}
              className="w-3.5 h-3.5 text-[var(--color-primary)] rounded border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated-dark)] focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-2 rounded-sm bg-[var(--color-surface-elevated-dark)]/30 border border-[var(--color-hairline-dark)] hover:bg-[var(--color-canvas-dark)]/60 transition-all cursor-pointer">
            <span className="text-xs font-semibold flex items-center space-x-2">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span>Police Stations</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.stations}
              onChange={() => toggleLayer('stations')}
              className="w-3.5 h-3.5 text-[var(--color-primary)] rounded border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated-dark)] focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-2 rounded-sm bg-[var(--color-surface-elevated-dark)]/30 border border-[var(--color-hairline-dark)] hover:bg-[var(--color-canvas-dark)]/60 transition-all cursor-pointer">
            <span className="text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="h-3.5 w-3.5 text-[#cc3333]" />
              <span>Hotspot Circles</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.hotspots}
              onChange={() => toggleLayer('hotspots')}
              className="w-3.5 h-3.5 text-[var(--color-primary)] rounded border-[var(--color-hairline-dark)] bg-[var(--color-surface-elevated-dark)] focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[9px] text-[var(--color-muted)] font-bold uppercase tracking-wider flex items-center space-x-1">
          <Filter className="h-3 w-3" />
          <span>Crime Categories</span>
        </h4>
        <div className="space-y-1">
          {categories.map(cat => {
            const isChecked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className={`flex items-center justify-between p-1.5 px-2.5 rounded-sm border text-xs font-medium cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-[var(--color-surface-elevated-dark)] border-[var(--color-hairline-dark)] text-[var(--color-primary)]'
                    : 'bg-transparent border-transparent text-[var(--color-muted)] hover:text-[var(--color-on-dark)]'
                }`}
              >
                <span>{cat}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryToggle(cat)}
                  className="hidden"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[9px] text-[var(--color-muted)] font-bold uppercase tracking-wider">Severity Filter</h4>
        <div className="grid grid-cols-3 gap-1 bg-[var(--color-surface-elevated-dark)] p-0.5 rounded-sm border border-[var(--color-hairline-dark)]">
          {['all', '1', '2'].map(val => (
            <button
              key={val}
              onClick={() => setSeverity(val)}
              className={`py-1.5 text-[9px] font-bold rounded-sm uppercase tracking-wider transition-all ${
                severity === val
                  ? 'bg-[var(--color-primary)] text-[#0a0f1a] shadow-md'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-on-dark)]'
              }`}
            >
              {val === 'all' ? 'All' : val === '1' ? 'Heinous' : 'Minor'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <h4 className="text-[9px] text-[var(--color-muted)] font-bold uppercase tracking-wider flex items-center space-x-1">
          <Compass className="h-3 w-3" />
          <span>Hotspot Presets</span>
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onFlyToHotspot('bengaluru')}
            className="p-2 text-left bg-[var(--color-surface-elevated-dark)]/60 hover:bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] hover:border-[var(--color-primary)]/40 rounded-sm transition-all"
          >
            <span className="text-[8px] text-[var(--color-muted)] font-bold uppercase block">Pattern 1</span>
            <span className="text-[9px] font-bold text-[var(--color-on-dark)] block truncate">Bengaluru East</span>
            <span className="text-[7px] text-[var(--color-primary)] block mt-0.5 font-semibold">Burglary Spike</span>
          </button>
          <button
            onClick={() => onFlyToHotspot('coastal')}
            className="p-2 text-left bg-[var(--color-surface-elevated-dark)]/60 hover:bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] hover:border-blue-500/40 rounded-sm transition-all"
          >
            <span className="text-[8px] text-[var(--color-muted)] font-bold uppercase block">Pattern 5</span>
            <span className="text-[9px] font-bold text-[var(--color-on-dark)] block truncate">Coastal Tourism</span>
            <span className="text-[7px] text-[var(--color-primary)] block mt-0.5 font-semibold">Seasonal Brawl</span>
          </button>
        </div>
        <button
          onClick={() => onFlyToHotspot('state')}
          className="w-full py-2 bg-[var(--color-surface-elevated-dark)]/80 hover:bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] rounded-sm text-center text-xs font-bold transition-all text-[var(--color-muted)] hover:text-[var(--color-on-dark)]"
        >
          Reset State-wide View
        </button>
      </div>

      <div className="border-t border-[var(--color-hairline-dark)] pt-3 flex items-start space-x-2 text-[9px] text-[var(--color-muted)]">
        <Info className="h-3.5 w-3.5 text-[var(--color-primary)]/60 shrink-0 mt-0.5" />
        <p className="leading-normal">
          Click station shields to view operational statistics. Double-ring pulses indicate anomalous burglary clusters.
        </p>
      </div>
    </div>
  );
}
