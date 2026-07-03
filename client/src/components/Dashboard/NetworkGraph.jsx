import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import {
  Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, Tag, Users,
  Shield, AlertTriangle, ChevronRight, X, Layers, Radio,
  Network, Eye, EyeOff, Download, Info, Activity, MapPin, User
} from 'lucide-react';
import {
  initialElements, communities,
  hiddenNeighborNodes, hiddenNeighborEdges
} from '../../data/networkData';

cytoscape.use(fcose);

const CYTO_STYLE = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'font-family': 'Outfit, Inter, system-ui, sans-serif',
      'font-size': '9px',
      'font-weight': '600',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': '4px',
      'color': '#8a887e',
      'text-outline-width': 2,
      'text-outline-color': '#060a14',
      'width': 32,
      'height': 32,
      'border-width': 2,
      'border-color': '#2a2a3a',
      'background-color': '#2a2a3a',
      'transition-property': 'background-color, border-color, width, height, opacity',
      'transition-duration': '0.25s',
      'overlay-opacity': 0,
    }
  },
  {
    selector: 'node[type="offender"]',
    style: {
      'shape': 'hexagon',
      'background-color': '#5c1010',
      'border-color': '#cc3333',
      'border-width': 2,
      'color': '#e6a4a4',
      'width': 38,
      'height': 38,
    }
  },
  {
    selector: 'node[type="offender"][riskScore > 70]',
    style: {
      'border-width': 3,
      'border-color': '#cc3333',
      'background-color': '#7a1515',
      'width': 44,
      'height': 44,
      'shadow-blur': 12,
      'shadow-color': '#cc3333',
      'shadow-opacity': 0.6,
      'shadow-offset-x': 0,
      'shadow-offset-y': 0,
    }
  },
  {
    selector: 'node[type="victim"]',
    style: {
      'shape': 'ellipse',
      'background-color': '#3a1a08',
      'border-color': '#d4a853',
      'border-width': 2,
      'color': '#e6d4a4',
      'width': 30,
      'height': 30,
    }
  },
  {
    selector: 'node[type="policeStation"]',
    style: {
      'shape': 'triangle',
      'background-color': '#0a1a3a',
      'border-color': '#2b5f9e',
      'border-width': 2,
      'color': '#8ab4e6',
      'width': 40,
      'height': 40,
    }
  },
  {
    selector: 'node[type="crime"]',
    style: {
      'shape': 'diamond',
      'background-color': '#1a1815',
      'border-color': '#8a887e',
      'border-width': 1.5,
      'color': '#b0ada6',
      'width': 24,
      'height': 24,
      'font-size': '8px',
    }
  },
  {
    selector: 'node[type="crime"][gravity="1"]',
    style: {
      'border-color': '#cc3333',
      'background-color': '#1a0a0a',
      'border-width': 2,
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#d4a853',
      'border-width': 3,
      'color': '#e6e2d8',
      'shadow-blur': 16,
      'shadow-color': '#d4a853',
      'shadow-opacity': 0.3,
      'shadow-offset-x': 0,
      'shadow-offset-y': 0,
    }
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-color': '#d4a853',
      'border-width': 3,
      'shadow-blur': 20,
      'shadow-color': '#d4a853',
      'shadow-opacity': 0.5,
      'shadow-offset-x': 0,
      'shadow-offset-y': 0,
      'color': '#e6e2d8',
    }
  },
  {
    selector: 'node.dimmed',
    style: {
      'opacity': 0.15,
    }
  },
  {
    selector: 'node.neighbor-revealed',
    style: {
      'border-color': '#d4a853',
      'border-width': 2.5,
      'shadow-blur': 12,
      'shadow-color': '#d4a853',
      'shadow-opacity': 0.5,
      'shadow-offset-x': 0,
      'shadow-offset-y': 0,
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 1,
      'line-color': '#2a2a3a',
      'target-arrow-color': '#2a2a3a',
      'target-arrow-shape': 'vee',
      'curve-style': 'bezier',
      'opacity': 0.6,
      'arrow-scale': 0.8,
      'overlay-opacity': 0,
    }
  },
  {
    selector: 'edge[type="committed"]',
    style: {
      'line-color': '#5c1010',
      'target-arrow-color': '#cc3333',
      'width': 1.5,
      'line-style': 'solid',
    }
  },
  {
    selector: 'edge[type="victimized"]',
    style: {
      'line-color': '#3a1a08',
      'target-arrow-color': '#d4a853',
      'width': 1,
      'line-style': 'dashed',
      'line-dash-pattern': [4, 3],
    }
  },
  {
    selector: 'edge[type="investigatedBy"]',
    style: {
      'line-color': '#0a1a3a',
      'target-arrow-color': '#2b5f9e',
      'width': 1.2,
      'line-style': 'solid',
    }
  },
  {
    selector: 'edge[type="coAccused"]',
    style: {
      'line-color': '#5c3a1a',
      'target-arrow-color': '#d4a853',
      'target-arrow-shape': 'none',
      'width': 2,
      'line-style': 'dashed',
      'line-dash-pattern': [6, 3],
    }
  },
  {
    selector: 'edge[type="linkedTo"]',
    style: {
      'line-color': '#2a4a1a',
      'target-arrow-color': '#4a8a2a',
      'target-arrow-shape': 'diamond',
      'width': 1.5,
      'line-style': 'dotted',
    }
  },
  {
    selector: 'edge.dimmed',
    style: { 'opacity': 0.05 }
  },
  {
    selector: 'edge.highlighted',
    style: { 'opacity': 1, 'width': 2.5 }
  },
];

const LAYOUT_CONFIG = {
  name: 'fcose',
  animate: true,
  animationDuration: 1200,
  animationEasing: 'ease-out-cubic',
  fit: true,
  padding: 60,
  randomize: true,
  nodeRepulsion: 6500,
  idealEdgeLength: (edge) => {
    const t = edge.data('type');
    if (t === 'coAccused') return 80;
    if (t === 'committed') return 120;
    if (t === 'investigatedBy') return 140;
    return 160;
  },
  edgeElasticity: 0.45,
  numIter: 2500,
  gravity: 0.25,
  gravityRange: 3.8,
  tile: true,
  tilingPaddingVertical: 30,
  tilingPaddingHorizontal: 30,
};

const NODE_TYPE_META = {
  offender:      { label: 'Repeat Offender', color: '#cc3333', Icon: User },
  victim:        { label: 'Victim',           color: '#d4a853', Icon: Users },
  policeStation: { label: 'Police Station',   color: '#2b5f9e', Icon: Shield },
  crime:         { label: 'Crime Event',      color: '#8a887e', Icon: AlertTriangle },
};

const COMMUNITY_COLORS = communities.map(c => c.color);

function DetailRow({ label, value, accent }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-blue-500/5 last:border-0">
      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide shrink-0 mr-2">{label}</span>
      <span className={`text-[11px] font-medium text-right ${accent || 'text-slate-50'}`}>{value ?? '—'}</span>
    </div>
  );
}

export default function NetworkGraph({ activeRole }) {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [cyInstance, setCyInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showLabels, setShowLabels] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, communities: 0 });
  const [showCommunityLegend, setShowCommunityLegend] = useState(true);
  const [layoutRunning, setLayoutRunning] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: initialElements,
      style: CYTO_STYLE,
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autounselectify: false,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;
    setCyInstance(cy);

    setLayoutRunning(true);
    const layout = cy.layout(LAYOUT_CONFIG);
    layout.run();
    layout.on('layoutstop', () => {
      setLayoutRunning(false);
      setIsLoading(false);
      setStats({
        nodes: cy.nodes().length,
        edges: cy.edges().length,
        communities: communities.length,
      });
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      setSelectedNode(data);
      cy.elements().addClass('dimmed');
      cy.elements().removeClass('highlighted');
      const neighbors = node.neighborhood().add(node);
      neighbors.removeClass('dimmed').addClass('highlighted');
      node.removeClass('dimmed');
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('dimmed highlighted');
      }
    });

    return () => {
      cy.destroy();
    };
  }, []);

  const rerunLayout = useCallback(() => {
    if (!cyRef.current || layoutRunning) return;
    setLayoutRunning(true);
    const layout = cyRef.current.layout(LAYOUT_CONFIG);
    layout.run();
    layout.on('layoutstop', () => setLayoutRunning(false));
  }, [layoutRunning]);

  const fitToScreen = useCallback(() => {
    cyRef.current?.fit(undefined, 60);
  }, []);

  const zoomIn  = useCallback(() => { cyRef.current?.zoom({ level: (cyRef.current.zoom() * 1.3), renderedPosition: { x: containerRef.current.offsetWidth / 2, y: containerRef.current.offsetHeight / 2 } }); }, []);
  const zoomOut = useCallback(() => { cyRef.current?.zoom({ level: (cyRef.current.zoom() * 0.75), renderedPosition: { x: containerRef.current.offsetWidth / 2, y: containerRef.current.offsetHeight / 2 } }); }, []);

  const toggleLabels = useCallback(() => {
    setShowLabels(prev => {
      const next = !prev;
      if (cyRef.current) {
        cyRef.current.style()
          .selector('node')
          .style('label', next ? 'data(label)' : '')
          .update();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!cyRef.current) return;
    if (!searchQuery.trim()) {
      cyRef.current.elements().removeClass('highlighted dimmed');
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matched = cyRef.current.nodes().filter(n =>
      n.data('label').toLowerCase().includes(q)
    );
    if (matched.length === 0) {
      setSearchResults([]);
      return;
    }
    cyRef.current.elements().addClass('dimmed').removeClass('highlighted');
    matched.forEach(n => {
      n.removeClass('dimmed').addClass('highlighted');
      n.neighborhood().removeClass('dimmed');
    });
    setSearchResults(matched.map(n => ({ id: n.id(), label: n.data('label'), type: n.data('type') })));
  }, [searchQuery]);

  const panToNode = useCallback((id) => {
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.getElementById(id);
    if (!node || node.empty()) return;
    cy.animate({
      center: { eles: node },
      zoom: 2.5,
      duration: 600,
      easing: 'ease-out-cubic',
    });
    cy.elements().removeClass('highlighted dimmed');
    const neighbors = node.neighborhood().add(node);
    cy.elements().addClass('dimmed');
    neighbors.removeClass('dimmed').addClass('highlighted');
    setSelectedNode(node.data());
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    if (activeFilter === 'all') {
      cy.nodes().style('display', 'element');
      cy.edges().style('display', 'element');
    } else {
      cy.nodes().forEach(n => {
        n.style('display', n.data('type') === activeFilter ? 'element' : 'none');
      });
      cy.edges().forEach(e => {
        const srcVisible = e.source().data('type') === activeFilter || activeFilter === 'all';
        const tgtVisible = e.target().data('type') === activeFilter || activeFilter === 'all';
        e.style('display', (srcVisible || tgtVisible) ? 'element' : 'none');
      });
    }
  }, [activeFilter]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    if (communityFilter === 'all') {
      cy.nodes().style('opacity', 1);
      cy.edges().style('opacity', 0.6);
    } else {
      const cid = Number(communityFilter);
      cy.nodes().forEach(n => {
        n.style('opacity', n.data('community') === cid ? 1 : 0.08);
      });
      cy.edges().forEach(e => {
        const sameComm = e.source().data('community') === cid && e.target().data('community') === cid;
        e.style('opacity', sameComm ? 1 : 0.04);
      });
    }
  }, [communityFilter]);

  const expandNode = useCallback((nodeId) => {
    const cy = cyRef.current;
    if (!cy) return;

    if (expandedNodes.has(nodeId)) {
      const toRemove = cy.nodes().filter(n => n.data('parentOffender') === nodeId);
      const toRemoveEdges = cy.edges().filter(e => e.data('parentOffender') === nodeId);
      cy.remove(toRemoveEdges);
      cy.remove(toRemove);
      setExpandedNodes(prev => { const s = new Set(prev); s.delete(nodeId); return s; });
      return;
    }

    const newNodes = hiddenNeighborNodes.filter(n => n.data.parentOffender === nodeId);
    const newEdges = hiddenNeighborEdges.filter(e => e.data.parentOffender === nodeId);

    if (newNodes.length === 0) return;

    cy.add([...newNodes, ...newEdges]);

    const parentPos = cy.getElementById(nodeId).position();
    newNodes.forEach(n => {
      const node = cy.getElementById(n.data.id);
      node.position({ x: parentPos.x, y: parentPos.y });
      node.addClass('neighbor-revealed');
    });

    cy.layout({
      name: 'fcose',
      animate: true,
      animationDuration: 800,
      fit: false,
      padding: 40,
      nodeRepulsion: 4000,
      idealEdgeLength: 90,
      numIter: 1000,
    }).run();

    setExpandedNodes(prev => new Set([...prev, nodeId]));
  }, [expandedNodes]);

  const getNodeIcon = (type) => {
    const meta = NODE_TYPE_META[type];
    if (!meta) return null;
    const { Icon, color } = meta;
    return <Icon className="h-3.5 w-3.5" style={{ color }} />;
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-[#cc3333]';
    if (score >= 60) return 'text-blue-400';
    return 'text-[#2e7d32]';
  };

  const getRiskBg = (score) => {
    if (score >= 80) return 'bg-[#8b0000]/10 border-[#8b0000]/30';
    if (score >= 60) return 'bg-blue-900/50 border-slate-700';
    return 'bg-[#2e7d32]/10 border-[#2e7d32]/30';
  };

  const communityForNode = selectedNode ? communities.find(c => c.id === selectedNode.community) : null;
  const canExpand = selectedNode?.type === 'offender' &&
    hiddenNeighborNodes.some(n => n.data.parentOffender === selectedNode.id);

  return (
    <div className="flex flex-col h-full w-full gap-0 relative overflow-hidden">

      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900 shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-900/50 border border-slate-700">
            <Network className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-50 tracking-wide">Criminal Intelligence Network</h2>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              {isLoading ? 'Initialising graph engine\u2026' : `${stats.nodes} Nodes \u00B7 ${stats.edges} Connections \u00B7 ${stats.communities} Communities`}
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-xs mx-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search nodes, suspects, stations\u2026"
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-900 transition-all"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {searchResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => panToNode(r.id)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 hover:bg-slate-900/60 text-left border-b border-slate-800 last:border-0 transition-colors"
                >
                  {getNodeIcon(r.type)}
                  <span className="text-xs text-slate-50 font-medium">{r.label}</span>
                  <span className="text-[9px] text-slate-400 ml-auto capitalize">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${layoutRunning ? 'text-blue-400 bg-blue-900/50 border-slate-700 animate-pulse' : 'text-[#2e7d32] bg-[#2e7d32]/10 border-[#2e7d32]/30'}`}>
            {layoutRunning ? '\u27F3 Computing' : '\u25CF Live'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900/80 border-b border-slate-800 shrink-0 z-10 overflow-x-auto">
        <span className="text-[9px] text-slate-400 font-semibold uppercase shrink-0">Node Type:</span>
        {['all', 'offender', 'victim', 'policeStation', 'crime'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 text-[9px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md border transition-all ${
              activeFilter === f
                ? 'bg-blue-600/50 border-blue-700 text-blue-400'
                : 'bg-transparent border-slate-700 text-slate-400 hover:text-slate-50 hover:border-slate-700'
            }`}
          >
            {f === 'policeStation' ? 'Stations' : f === 'all' ? 'All Nodes' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}

        <div className="w-px h-4 bg-blue-600/50 mx-2 shrink-0" />

        <span className="text-[9px] text-slate-400 font-semibold uppercase shrink-0">Community:</span>
        <button
          onClick={() => setCommunityFilter('all')}
          className={`shrink-0 text-[9px] font-semibold px-2.5 py-1 rounded-md border transition-all ${communityFilter === 'all' ? 'bg-blue-600/50 border-blue-700 text-blue-400' : 'border-slate-700 text-slate-400 hover:border-slate-700'}`}
        >
          All
        </button>
        {communities.map(c => (
          <button
            key={c.id}
            onClick={() => setCommunityFilter(communityFilter === String(c.id) ? 'all' : String(c.id))}
            className={`shrink-0 flex items-center space-x-1.5 text-[9px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
              communityFilter === String(c.id)
                ? 'border-opacity-60 text-slate-50'
                : 'border-slate-700 text-slate-400 hover:border-slate-700'
            }`}
            style={communityFilter === String(c.id) ? { borderColor: c.color, backgroundColor: c.bgColor, color: c.color } : {}}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden relative min-h-0">

        <div
          ref={containerRef}
          className="flex-1 h-full bg-slate-900 relative"
          style={{ minHeight: 0 }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-30">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-slate-700 border-t-[#d4a853] animate-spin" />
              <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-slate-700 border-b-[#d4a853] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
            <p className="text-sm font-bold text-slate-50">Initialising Graph Engine</p>
            <p className="text-[10px] text-slate-400 mt-1">Running F-CoSE layout algorithm\u2026</p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-col space-y-1.5 z-20">
          {[
            { Icon: Maximize2, action: fitToScreen, title: 'Fit to Screen' },
            { Icon: ZoomIn,    action: zoomIn,      title: 'Zoom In' },
            { Icon: ZoomOut,   action: zoomOut,     title: 'Zoom Out' },
            { Icon: RotateCcw, action: rerunLayout,  title: 'Re-run Layout', spin: layoutRunning },
            { Icon: showLabels ? Tag : EyeOff, action: toggleLabels, title: 'Toggle Labels', active: showLabels },
          ].map(({ Icon, action, title, spin, active }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className={`p-2.5 rounded-xl border transition-all shadow-lg backdrop-blur-sm group relative ${
                active === false
                  ? 'bg-slate-950/90 border-slate-700 text-slate-400 hover:text-slate-50'
                  : 'bg-slate-950/90 border-slate-700 text-slate-400 hover:text-slate-50 hover:border-slate-700'
              }`}
            >
              <Icon className={`h-4 w-4 ${spin ? 'animate-spin' : ''}`} />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-950 text-slate-50 text-[9px] font-semibold px-2 py-1 rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {title}
              </div>
            </button>
          ))}
        </div>

        {showCommunityLegend && (
          <div className="absolute left-4 bottom-4 bg-slate-900/95 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 z-20 min-w-[200px] shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Node Types</span>
              <button onClick={() => setShowCommunityLegend(false)} className="text-slate-400 hover:text-slate-50 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
            {Object.entries(NODE_TYPE_META).map(([type, { label, color, Icon }]) => (
              <div key={type} className="flex items-center space-x-2.5 mb-2 last:mb-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.8 }} />
                <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                <span className="text-[9px] text-slate-400 font-medium">{label}</span>
              </div>
            ))}
            <div className="border-t border-slate-800 mt-3 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Communities</span>
              {communities.map(c => (
                <div key={c.id} className="flex items-center space-x-2 mb-1.5 last:mb-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-[9px] text-slate-400">{c.name}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 mt-3 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Edge Types</span>
              {[
                { color: '#cc3333', label: 'Committed Crime', style: 'solid' },
                { color: '#d4a853', label: 'Victimized',       style: 'dashed' },
                { color: '#2b5f9e', label: 'Investigated By',  style: 'solid' },
                { color: '#d4a853', label: 'Co-Accused',       style: 'dashed' },
                { color: '#4a8a2a', label: 'Intelligence Link', style: 'dotted' },
              ].map(({ color, label, style }) => (
                <div key={label} className="flex items-center space-x-2 mb-1.5 last:mb-0">
                  <div className="w-6 h-px shrink-0" style={{ backgroundColor: color, borderTop: style !== 'solid' ? `1px ${style} ${color}` : 'none', background: style === 'solid' ? color : 'none' }} />
                  <span className="text-[9px] text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showCommunityLegend && (
          <button
            onClick={() => setShowCommunityLegend(true)}
            className="absolute left-4 bottom-4 p-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-50 transition-all z-20 backdrop-blur-sm"
            title="Show Legend"
          >
            <Layers className="h-4 w-4" />
          </button>
        )}

        <div
          className={`absolute right-0 top-0 bottom-0 w-72 bg-slate-900/98 backdrop-blur-xl border-l border-slate-800 flex flex-col transition-transform duration-300 ease-out z-20 shadow-2xl ${
            selectedNode ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedNode && (
            <>
              <div
                className="p-5 border-b border-slate-800"
                style={{ background: `linear-gradient(135deg, ${communityForNode?.bgColor || 'transparent'} 0%, transparent 100%)` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="p-2 rounded-xl border"
                      style={{
                        backgroundColor: `${NODE_TYPE_META[selectedNode.type]?.color}15`,
                        borderColor: `${NODE_TYPE_META[selectedNode.type]?.color}40`,
                      }}
                    >
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: NODE_TYPE_META[selectedNode.type]?.color }}>
                        {NODE_TYPE_META[selectedNode.type]?.label}
                      </p>
                      {communityForNode && (
                        <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5" style={{ color: communityForNode.color }}>
                          ◆ {communityForNode.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      cyRef.current?.elements().removeClass('dimmed highlighted');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-50 hover:bg-slate-900/60 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-50 leading-tight">{selectedNode.label}</h3>
                {selectedNode.id && (
                  <p className="text-[9px] text-slate-400 font-mono mt-1">{selectedNode.id}</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {selectedNode.type === 'offender' && selectedNode.riskScore !== undefined && (
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${getRiskBg(selectedNode.riskScore)}`}>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-400">Risk Score</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black ${getRiskColor(selectedNode.riskScore)}`}>
                        {selectedNode.riskScore}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">/100</span>
                    </div>
                  </div>
                )}

                <div className="space-y-0">
                  {selectedNode.type === 'offender' && (
                    <>
                      <DetailRow label="Age" value={`${selectedNode.age} yrs`} />
                      <DetailRow label="Total Cases" value={selectedNode.caseCount} accent="text-[#cc3333]" />
                      <DetailRow label="Modus Operandi" value={selectedNode.mo} />
                      <DetailRow label="District" value={selectedNode.district} />
                    </>
                  )}
                  {selectedNode.type === 'victim' && (
                    <>
                      {selectedNode.age && <DetailRow label="Age" value={`${selectedNode.age} yrs`} />}
                      <DetailRow label="Victim Of" value={selectedNode.victimOf} accent="text-blue-400" />
                    </>
                  )}
                  {selectedNode.type === 'policeStation' && (
                    <>
                      <DetailRow label="District" value={selectedNode.district} />
                      <DetailRow label="Staff Strength" value={selectedNode.staff} />
                      <DetailRow label="Alert Status" value={selectedNode.status} accent={
                        selectedNode.status === 'High Alert' ? 'text-[#cc3333]' :
                        selectedNode.status === 'Med Alert' ? 'text-blue-400' : 'text-[#2e7d32]'
                      } />
                    </>
                  )}
                  {selectedNode.type === 'crime' && (
                    <>
                      <DetailRow label="Crime Head" value={selectedNode.head} />
                      <DetailRow label="Sub-Head" value={selectedNode.sub} accent="text-[#cc3333]" />
                      <DetailRow label="Registered" value={selectedNode.date} />
                      <DetailRow label="Gravity" value={selectedNode.gravity === '1' ? '\u25CF Heinous' : '\u25CB Non-Heinous'} accent={selectedNode.gravity === '1' ? 'text-[#cc3333]' : 'text-slate-400'} />
                      <DetailRow label="Status" value={selectedNode.status} accent={
                        selectedNode.status === 'Under Investigation' ? 'text-blue-400' :
                        selectedNode.status === 'Chargesheeted' ? 'text-[#2b5f9e]' : 'text-[#2e7d32]'
                      } />
                    </>
                  )}
                </div>

                {cyRef.current && (
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2">Connections</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Direct connections</span>
                      <span className="text-sm font-bold text-blue-400">
                        {cyRef.current.getElementById(selectedNode.id)?.neighborhood()?.length ?? 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 space-y-2">
                {canExpand && (
                  <button
                    onClick={() => expandNode(selectedNode.id)}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border font-semibold text-xs transition-all ${
                      expandedNodes.has(selectedNode.id)
                        ? 'bg-blue-900/50 border-blue-500/40 text-blue-400 hover:bg-blue-700/40'
                        : 'bg-blue-900/50 border-slate-700 text-blue-400 hover:bg-blue-700/40'
                    }`}
                  >
                    {expandedNodes.has(selectedNode.id) ? (
                      <><EyeOff className="h-3.5 w-3.5" /><span>Collapse Network</span></>
                    ) : (
                      <><Eye className="h-3.5 w-3.5" /><span>Expand Network</span></>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    cyRef.current?.elements().removeClass('dimmed highlighted');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-50 hover:border-slate-700 font-semibold text-xs transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>Clear Selection</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      <div className="flex items-center justify-between px-6 py-2 bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">
            SCRB Intel — Network Analysis
          </span>
          <span className="text-[9px] text-slate-400/50">|</span>
          <span className="text-[9px] text-slate-400">Classification: RESTRICTED</span>
        </div>
        <div className="flex items-center space-x-3">
          {expandedNodes.size > 0 && (
            <span className="text-[9px] text-blue-400 bg-blue-900/50 border border-slate-700 px-2 py-0.5 rounded-md font-semibold">
              {expandedNodes.size} node{expandedNodes.size > 1 ? 's' : ''} expanded
            </span>
          )}
          <span className="text-[9px] text-slate-400">
            Scroll to zoom &middot; Drag to pan &middot; Click nodes to inspect
          </span>
        </div>
      </div>
    </div>
  );
}
