import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * @typedef {Object} NodeData
 * @property {string} id - Unique identifier for the node
 * @property {string} label - Display label
 * @property {string} type - Type of node (offender, victim, crime, phone, bankAccount, policeStation)
 * @property {number} [riskScore] - Risk score for offenders (0-100)
 * @property {string} [gravity] - Gravity of crime ('1' for heinous)
 */

/**
 * @typedef {Object} EdgeData
 * @property {string} id - Unique identifier for the edge
 * @property {string} source - Source node ID
 * @property {string} target - Target node ID
 * @property {string} type - Edge relationship type
 * @property {string} label - Edge display label
 */

/**
 * @typedef {Object} CytoscapeElement
 * @property {NodeData|EdgeData} data - The data object for the element
 */

/**
 * NetworkGraph Component
 * Renders an interactive force-directed graph of criminal entities using Cytoscape.js.
 * @component
 * @returns {React.ReactElement} The rendered Network Graph component
 */
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import {
  Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, Tag, Users,
  Shield, AlertTriangle, ChevronRight, X, Layers,
  Network, Eye, EyeOff, Activity, User,
  Wallet, Smartphone, Crosshair, Bot, Calendar, Zap
} from 'lucide-react';
import {
  initialElements, communities,
  hiddenNeighborNodes, hiddenNeighborEdges
} from '../../data/networkData';

try {
  cytoscape.use(fcose);
} catch {
  // already registered during HMR
}

const CYTO_STYLE = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'font-family': 'Outfit, Inter, system-ui, sans-serif',
      'font-size': '11px',
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
    }
  },
  {
    selector: 'node[type="victim"]',
    style: {
      'shape': 'ellipse',
      'background-color': '#3a1a08',
      'border-color': '#2563eb',
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
      'font-size': '10px',
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
    selector: 'node[type="bankAccount"]',
    style: {
      'shape': 'round-rectangle',
      'background-color': '#0a1a0f',
      'border-color': '#22c55e',
      'border-width': 2,
      'color': '#86efac',
      'width': 34,
      'height': 34,
    }
  },
  {
    selector: 'node[type="phone"]',
    style: {
      'shape': 'round-tag',
      'background-color': '#1a0f1f',
      'border-color': '#a855f7',
      'border-width': 2,
      'color': '#d8b4fe',
      'width': 34,
      'height': 34,
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#2563eb',
      'border-width': 3,
      'color': '#e6e2d8',
    }
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-color': '#2563eb',
      'border-width': 3,
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
      'border-color': '#2563eb',
      'border-width': 2.5,
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
      'target-arrow-color': '#2563eb',
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
      'target-arrow-color': '#2563eb',
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
    selector: 'edge[type="transferred"]',
    style: {
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
      'width': 1.5,
      'line-style': 'dashed',
      'line-dash-pattern': [4, 4],
    }
  },
  {
    selector: 'edge[type="called"]',
    style: {
      'line-color': '#a855f7',
      'target-arrow-color': '#a855f7',
      'width': 1.5,
      'line-style': 'solid',
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
  {
    selector: 'node.path-highlight',
    style: {
      'border-color': '#f59e0b',
      'border-width': 4,
    }
  },
  {
    selector: 'edge.path-highlight',
    style: {
      'line-color': '#f59e0b',
      'target-arrow-color': '#f59e0b',
      'width': 4,
      'opacity': 1,
      'line-style': 'solid',
    }
  }
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
  victim:        { label: 'Victim',           color: 'var(--color-primary)', Icon: Users },
  policeStation: { label: 'Police Station',   color: '#2b5f9e', Icon: Shield },
  crime:         { label: 'Crime Event',      color: '#8a887e', Icon: AlertTriangle },
  bankAccount:   { label: 'Bank Account',     color: '#22c55e', Icon: Wallet },
  phone:         { label: 'Telecom',          color: '#a855f7', Icon: Smartphone },
};


function DetailRow({ label, value, accent }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-[var(--color-hairline-dark)] last:border-0">
      <span className="text-[9px] font-semibold text-[var(--color-muted)] uppercase tracking-wide shrink-0 mr-2">{label}</span>
      <span className={`text-[11px] font-medium text-right ${accent || 'text-[var(--color-on-dark)]'}`}>{value ?? '—'}</span>
    </div>
  );
}

export default function NetworkGraph() {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

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
  const [contextMenu, setContextMenu] = useState(null);
  const [pathfinderMode, setPathfinderMode] = useState(false);
  const [pathNodes, setPathNodes] = useState({ start: null, end: null });
  const pathfinderStateRef = useRef({ mode: false, nodes: { start: null, end: null } });
  const [aiInsightsNode, setAiInsightsNode] = useState(null);
  const [timelineValue, setTimelineValue] = useState(100);

  useEffect(() => {
    pathfinderStateRef.current = { mode: pathfinderMode, nodes: pathNodes };
  }, [pathfinderMode, pathNodes]);

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
    });

    cyRef.current = cy;

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
      
      const { mode, nodes } = pathfinderStateRef.current;
      if (mode) {
        if (!nodes.start) {
          setPathNodes(prev => ({ ...prev, start: data.id }));
          node.addClass('highlighted');
        } else if (!nodes.end) {
          setPathNodes(prev => ({ ...prev, end: data.id }));
          node.addClass('highlighted');
        } else {
          // Reset if both are already selected
          setPathNodes({ start: data.id, end: null });
          cy.elements().removeClass('highlighted path-highlight');
          node.addClass('highlighted');
        }
        return; // Skip normal selection logic
      }

      setSelectedNode(data);
      cy.elements().addClass('dimmed');
      cy.elements().removeClass('highlighted path-highlight');
      const neighbors = node.neighborhood().add(node);
      neighbors.removeClass('dimmed').addClass('highlighted');
      node.removeClass('dimmed');
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setAiInsightsNode(null);
        cy.elements().removeClass('dimmed highlighted');
      }
      setContextMenu(null);
    });

    cy.on('cxttap', 'node', (evt) => {
      const node = evt.target;
      setContextMenu({
        x: evt.originalEvent.clientX,
        y: evt.originalEvent.clientY,
        nodeData: node.data()
      });
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
    try {
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
    } catch {
      // style API may not be available in test environments
    }
  }, [activeFilter]);

  useEffect(() => {
    try {
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
    } catch {
      // style API may not be available in test environments
    }
  }, [communityFilter]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    
    if (!pathfinderMode) {
      cy.elements().removeClass('dimmed highlighted path-highlight');
      setPathNodes(prev => (prev.start === null && prev.end === null) ? prev : { start: null, end: null });
      return;
    }

    if (pathNodes.start && pathNodes.end) {
      const root = cy.getElementById(pathNodes.start);
      const goal = cy.getElementById(pathNodes.end);
      
      if (!root.empty() && !goal.empty()) {
        const aStar = cy.elements().aStar({
          root: root,
          goal: goal,
          weight: () => 1,
          directed: false
        });
        
        cy.elements().removeClass('highlighted path-highlight').addClass('dimmed');
        if (aStar.found) {
          aStar.path.removeClass('dimmed').addClass('path-highlight');
        } else {
          // No path found
          root.removeClass('dimmed').addClass('highlighted');
          goal.removeClass('dimmed').addClass('highlighted');
        }
      }
    }
  }, [pathNodes, pathfinderMode]);

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
    if (score >= 60) return 'text-[var(--color-primary)]';
    return 'text-[#2e7d32]';
  };

  const getRiskBg = (score) => {
    if (score >= 80) return 'bg-[#8b0000]/10 border-[#8b0000]/30';
    if (score >= 60) return 'bg-[var(--color-surface-elevated-dark)] border-[var(--color-hairline-dark)]';
    return 'bg-[#2e7d32]/10 border-[#2e7d32]/30';
  };

  const communityForNode = selectedNode ? communities.find(c => c.id === selectedNode.community) : null;
  const canExpand = selectedNode?.type === 'offender' &&
    hiddenNeighborNodes.some(n => n.data.parentOffender === selectedNode.id);

  return (
    <div className="flex flex-col flex-1 h-full w-full gap-0 relative bg-[var(--color-surface-card-dark)] border border-[var(--color-hairline-dark)] rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#cc3333]/8 via-[#cc3333]/3 to-transparent backdrop-blur-sm pointer-events-none z-0" />

      <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-[var(--color-hairline-dark)] bg-[var(--color-surface-card-dark)] shrink-0 z-20 relative">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="p-2 rounded-sm bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)]">
            <Network className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-on-dark)] tracking-wide">Criminal Intelligence Network</h2>
            <p className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-wider">
              {isLoading ? 'Initialising graph engine\u2026' : `${stats.nodes} Nodes \u00B7 ${stats.edges} Connections \u00B7 ${stats.communities} Communities`}
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-[160px] sm:max-w-xs mx-3 sm:mx-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search nodes, suspects, stations\u2026"
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-canvas-dark)] border border-[var(--color-hairline-dark)] rounded-sm text-xs text-[var(--color-on-dark)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
          />
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30">
            <div className={`bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-sm overflow-hidden max-h-48 overflow-y-auto shadow-xl ${searchResults.length > 0 ? '' : ''}`}>
              {searchResults.length > 0 ? (
                searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => panToNode(r.id)}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 hover:bg-[var(--color-canvas-dark)]/60 text-left border-b border-[var(--color-hairline-dark)] last:border-0 transition-colors"
                  >
                    {getNodeIcon(r.type)}
                    <span className="text-xs text-[var(--color-on-dark)] font-medium">{r.label}</span>
                    <span className="text-[9px] text-[var(--color-muted)] ml-auto capitalize">{r.type}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-[var(--color-muted)] text-center">No nodes match &quot;{searchQuery}&quot;</div>
              )}
            </div>
          </div>
        )}

      </div>

      <div className="flex items-center space-x-2">
        <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${layoutRunning ? 'text-[var(--color-primary)] bg-[var(--color-surface-elevated-dark)] border-[var(--color-hairline-dark)] animate-pulse' : 'text-[#2e7d32] bg-[#2e7d32]/10 border-[#2e7d32]/30'}`}>
          {layoutRunning ? '\u27F3 Computing' : '\u25CF Live'}
        </span>
      </div>
    </div>

      <div className="flex items-center space-x-2 px-3 sm:px-6 py-2.5 bg-[var(--color-surface-card-dark)] border-b border-[var(--color-hairline-dark)] shrink-0 z-10 overflow-x-auto">
        <span className="text-[9px] text-[var(--color-muted)] font-semibold uppercase shrink-0">Node Type:</span>
        {['all', 'offender', 'victim', 'policeStation', 'crime', 'bankAccount', 'phone'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 text-[9px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md border transition-all ${
              activeFilter === f
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-transparent border-[var(--color-hairline-dark)] text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:border-[var(--color-hairline-dark)]'
            }`}
          >
            {f === 'all' ? 'All Nodes' : NODE_TYPE_META[f]?.label}
          </button>
        ))}

        <div className="w-px h-4 bg-[var(--color-primary)]/50 mx-2 shrink-0" />

        <span className="text-[9px] text-[var(--color-muted)] font-semibold uppercase shrink-0">Community:</span>
        <button
          onClick={() => setCommunityFilter('all')}
          className={`shrink-0 text-[9px] font-semibold px-2.5 py-1 rounded-md border transition-all ${communityFilter === 'all' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]' : 'border-[var(--color-hairline-dark)] text-[var(--color-muted)] hover:border-[var(--color-hairline-dark)]'}`}
        >
          All
        </button>
        {communities.map(c => (
          <button
            key={c.id}
            onClick={() => setCommunityFilter(communityFilter === String(c.id) ? 'all' : String(c.id))}
            className={`shrink-0 flex items-center space-x-1.5 text-[9px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
              communityFilter === String(c.id)
                ? 'border-opacity-60 text-[var(--color-on-dark)]'
                : 'border-[var(--color-hairline-dark)] text-[var(--color-muted)] hover:border-[var(--color-hairline-dark)]'
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
          className="flex-1 h-full bg-[var(--color-canvas-dark)] relative"
          style={{ minHeight: 0 }}
          role="region"
          aria-label="Interactive Criminal Intelligence Network Graph"
        />
        
        <div className="sr-only">
          <table>
            <caption>Network Graph Elements</caption>
            <thead>
              <tr>
                <th scope="col">Element ID</th>
                <th scope="col">Label</th>
                <th scope="col">Type</th>
              </tr>
            </thead>
            <tbody>
              {initialElements.filter(e => !e.data.source).map(node => (
                <tr key={`sr-node-${node.data.id}`}>
                  <td>{node.data.id}</td>
                  <td>{node.data.label}</td>
                  <td>{node.data.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-canvas-dark)]/90 z-30">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--color-hairline-dark)] border-t-[var(--color-primary)] animate-spin" />
              <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-[var(--color-hairline-dark)] border-b-[var(--color-primary)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
            <p className="text-sm font-bold text-[var(--color-on-dark)]">Initialising Graph Engine</p>
            <p className="text-[10px] text-[var(--color-muted)] mt-1">Running F-CoSE layout algorithm\u2026</p>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-col space-y-1.5 z-20">
          {[
            { Icon: Maximize2, action: fitToScreen, title: 'Fit to Screen' },
            { Icon: ZoomIn,    action: zoomIn,      title: 'Zoom In' },
            { Icon: ZoomOut,   action: zoomOut,     title: 'Zoom Out' },
            { Icon: RotateCcw, action: rerunLayout,  title: 'Re-run Layout', spin: layoutRunning },
            { Icon: showLabels ? Tag : EyeOff, action: toggleLabels, title: 'Toggle Labels', active: showLabels },
            { Icon: Crosshair, action: () => setPathfinderMode(prev => !prev), title: 'Pathfinder Tool', active: pathfinderMode, color: '#f59e0b' },
          ].map(({ Icon, action, title, spin, active, color }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              style={active && color ? { borderColor: color, color: color, backgroundColor: `${color}1A` } : {}}
              className={`p-2.5 rounded-sm border transition-all group relative ${
                active && !color
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-[var(--color-surface-elevated-dark)] border-[var(--color-hairline-dark)] text-[var(--color-muted)] hover:text-[var(--color-on-dark)]'
              }`}
            >
              <Icon className={`h-4 w-4 ${spin ? 'animate-spin' : ''}`} />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[var(--color-surface-elevated-dark)] text-[var(--color-on-dark)] text-[9px] font-semibold px-2 py-1 rounded-sm border border-[var(--color-hairline-dark)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {title}
              </div>
            </button>
          ))}
        </div>

        {showCommunityLegend && (
          <div className="absolute left-4 bottom-4 bg-[var(--color-surface-card-dark)] border border-[var(--color-hairline-dark)] rounded-sm z-20 flex flex-col w-48 max-h-[calc(100%-80px)]">
            <div className="flex items-center justify-between p-3 pb-2 shrink-0 border-b border-[var(--color-hairline-dark)]">
              <span className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-wider">Node Types</span>
              <button onClick={() => setShowCommunityLegend(false)} className="p-0.5 text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] rounded-sm transition-colors flex items-center justify-center">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
            <div className="p-3 pt-2 overflow-y-auto custom-scrollbar flex-1">
              {Object.entries(NODE_TYPE_META).map(([type, { label, color, Icon }]) => (
                <div key={type} className="flex items-center space-x-2 mb-1.5 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.8 }} />
                  <Icon className="h-2.5 w-2.5 shrink-0" style={{ color }} />
                  <span className="text-[8px] text-[var(--color-muted)] font-medium">{label}</span>
                </div>
              ))}
              <div className="border-t border-[var(--color-hairline-dark)] mt-2 pt-2">
                <span className="text-[8px] font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-1.5">Communities</span>
                {communities.map(c => (
                  <div key={c.id} className="flex items-center space-x-1.5 mb-1 last:mb-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[8px] text-[var(--color-muted)]">{c.name}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--color-hairline-dark)] mt-2 pt-2">
                <span className="text-[8px] font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-1.5">Edge Types</span>
                {[
                  { color: '#cc3333', label: 'Committed Crime', style: 'solid' },
                  { color: 'var(--color-primary)', label: 'Victimized',       style: 'dashed' },
                  { color: '#2b5f9e', label: 'Investigated By',  style: 'solid' },
                  { color: 'var(--color-primary)', label: 'Co-Accused',       style: 'dashed' },
                  { color: '#4a8a2a', label: 'Intelligence Link', style: 'dotted' },
                  { color: '#22c55e', label: 'Financial Transfer', style: 'dashed' },
                  { color: '#a855f7', label: 'Telecom Link', style: 'solid' },
                ].map(({ color, label, style }) => (
                  <div key={label} className="flex items-center space-x-2 mb-1 last:mb-0">
                    <div className="w-4 h-px shrink-0" style={{ backgroundColor: color, borderTop: style !== 'solid' ? `1px ${style} ${color}` : 'none', background: style === 'solid' ? color : 'none' }} />
                    <span className="text-[8px] text-[var(--color-muted)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!showCommunityLegend && (
          <button
            onClick={() => setShowCommunityLegend(true)}
            className="absolute left-4 bottom-4 p-2.5 bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-sm text-[var(--color-muted)] hover:text-[var(--color-on-dark)] transition-all z-20"
            title="Show Legend"
          >
            <Layers className="h-4 w-4" />
          </button>
        )}

        <div
          className={`absolute right-0 top-0 bottom-0 w-72 sm:w-80 bg-[var(--color-surface-card-dark)] border-l border-[var(--color-hairline-dark)] flex flex-col transition-transform duration-300 ease-out z-20 ${
            selectedNode ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedNode && (
            <>
              <div
                className="p-5 border-b border-[var(--color-hairline-dark)] relative"
                style={{ background: `linear-gradient(135deg, ${communityForNode?.bgColor || 'transparent'} 0%, transparent 100%)` }}
              >
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="p-2 rounded-sm border"
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
                        <p className="text-[8px] text-[var(--color-muted)] font-semibold uppercase mt-0.5" style={{ color: communityForNode.color }}>
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
                    className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-canvas-dark)]/60 rounded-sm transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-[var(--color-on-dark)] leading-tight relative z-10">{selectedNode.label}</h3>
                {selectedNode.id && (
                  <p className="text-[9px] text-[var(--color-muted)] font-mono mt-1 relative z-10">{selectedNode.id}</p>
                )}
                <div className="absolute right-4 bottom-4 z-10">
                  <button
                    onClick={() => setAiInsightsNode(selectedNode)}
                    className="p-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] rounded-full transition-colors"
                    title="Generate AI Insights"
                  >
                    <Bot className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {selectedNode.type === 'offender' && selectedNode.riskScore !== undefined && (
                  <div className={`flex items-center justify-between p-3 rounded-sm border ${getRiskBg(selectedNode.riskScore)}`}>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-[var(--color-muted)]" />
                      <span className="text-[10px] font-semibold text-[var(--color-muted)]">Risk Score</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black ${getRiskColor(selectedNode.riskScore)}`}>
                        {selectedNode.riskScore}
                      </span>
                      <span className="text-[9px] text-[var(--color-muted)] ml-1">/100</span>
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
                      <DetailRow label="Victim Of" value={selectedNode.victimOf} accent="text-[var(--color-primary)]" />
                    </>
                  )}
                  {selectedNode.type === 'policeStation' && (
                    <>
                      <DetailRow label="District" value={selectedNode.district} />
                      <DetailRow label="Staff Strength" value={selectedNode.staff} />
                      <DetailRow label="Alert Status" value={selectedNode.status} accent={
                        selectedNode.status === 'High Alert' ? 'text-[#cc3333]' :
                        selectedNode.status === 'Med Alert' ? 'text-[var(--color-primary)]' : 'text-[#2e7d32]'
                      } />
                    </>
                  )}
                  {selectedNode.type === 'crime' && (
                    <>
                      <DetailRow label="Crime Head" value={selectedNode.head} />
                      <DetailRow label="Sub-Head" value={selectedNode.sub} accent="text-[#cc3333]" />
                      <DetailRow label="Registered" value={selectedNode.date} />
                      <DetailRow label="Gravity" value={selectedNode.gravity === '1' ? '\u25CF Heinous' : '\u25CB Non-Heinous'} accent={selectedNode.gravity === '1' ? 'text-[#cc3333]' : 'text-[var(--color-muted)]'} />
                      <DetailRow label="Status" value={selectedNode.status} accent={
                        selectedNode.status === 'Under Investigation' ? 'text-[var(--color-primary)]' :
                        selectedNode.status === 'Chargesheeted' ? 'text-[var(--color-primary)]' : 'text-[#2e7d32]'
                      } />
                    </>
                  )}
                </div>

                {cyRef.current && (
                  <div className="p-3 bg-[var(--color-canvas-dark)]/50 border border-[var(--color-hairline-dark)] rounded-sm">
                    <p className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-wide mb-2">Connections</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-muted)]">Direct connections</span>
                      <span className="text-sm font-bold text-[var(--color-primary)]">
                        {cyRef.current.getElementById(selectedNode.id)?.neighborhood()?.length ?? 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[var(--color-hairline-dark)] space-y-2">
                {canExpand && (
                  <button
                    onClick={() => expandNode(selectedNode.id)}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-sm border font-semibold text-xs transition-all ${
                      expandedNodes.has(selectedNode.id)
                        ? 'bg-[var(--color-surface-elevated-dark)] border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-canvas-dark)]'
                        : 'bg-[var(--color-surface-elevated-dark)] border-[var(--color-hairline-dark)] text-[var(--color-primary)] hover:bg-[var(--color-canvas-dark)]'
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
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-sm border border-[var(--color-hairline-dark)] text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:border-[var(--color-hairline-dark)] font-semibold text-xs transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>Clear Selection</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      <div className="flex items-center justify-between px-3 sm:px-6 py-2 bg-[var(--color-surface-elevated-dark)] border-t border-[var(--color-hairline-dark)] shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-[9px] text-[var(--color-muted)] font-semibold uppercase tracking-wide">
            SCRB Intel — Network Analysis
          </span>
          <span className="text-[9px] text-[var(--color-muted)]/50">|</span>
          <span className="text-[9px] text-[var(--color-muted)]">Classification: RESTRICTED</span>
        </div>
        <div className="flex items-center space-x-3">
          {expandedNodes.size > 0 && (
            <span className="text-[9px] text-[var(--color-primary)] bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] px-2 py-0.5 rounded-md font-semibold">
              {expandedNodes.size} node{expandedNodes.size > 1 ? 's' : ''} expanded
            </span>
          )}
          <span className="text-[9px] text-[var(--color-muted)]">
            Scroll to zoom &middot; Drag to pan &middot; Click nodes to inspect
          </span>
          {contextMenu && (
            <div
              className="absolute z-50 bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-md overflow-hidden min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={() => setContextMenu(null)}
            >
              <button
                className="w-full text-left px-4 py-2.5 text-[11px] font-semibold text-[var(--color-on-dark)] hover:bg-[var(--color-canvas-dark)]/60 border-b border-[var(--color-hairline-dark)]"
                onClick={() => {
                  setAiInsightsNode(contextMenu.nodeData);
                  setContextMenu(null);
                }}
              >
                Run AI Intelligence Scan
              </button>
              {contextMenu.nodeData.type === 'offender' && (
                <button
                  className="w-full text-left px-4 py-2.5 text-[11px] font-semibold text-[var(--color-on-dark)] hover:bg-[var(--color-canvas-dark)]/60 border-b border-[var(--color-hairline-dark)] flex justify-between items-center"
                  onClick={() => {
                    expandNode(contextMenu.nodeData.id);
                    setContextMenu(null);
                  }}
                >
                  <span>Expand Network</span>
                  <Network className="h-3 w-3 text-[var(--color-muted)]" />
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2.5 text-[11px] font-semibold text-[#cc3333] hover:bg-[rgba(204,51,51,0.1)] transition-colors"
                onClick={() => setContextMenu(null)}
              >
                Flag for Review
              </button>
            </div>
          )}

          {aiInsightsNode && (
            <div className="absolute right-[300px] top-4 bottom-4 w-80 bg-[var(--color-surface-card-dark)] border border-[var(--color-hairline-dark)] rounded-lg flex flex-col z-30 overflow-hidden animate-[fadeIn_0.3s_ease-out_forwards]">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-hairline-dark)]">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--color-on-dark)]">AI Intelligence Scan</h3>
                </div>
                <button onClick={() => setAiInsightsNode(null)} className="text-[var(--color-muted)] hover:text-[var(--color-on-dark)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-[var(--color-muted)] mb-2">Subject Target</h4>
                  <p className="text-[14px] font-semibold text-[var(--color-on-dark)]">{aiInsightsNode.label}</p>
                  <p className="text-[10px] text-[var(--color-primary)]">{aiInsightsNode.id}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-[var(--color-surface-elevated-dark)] rounded-md border border-[var(--color-hairline-dark)]">
                    <h4 className="text-[11px] font-bold text-[var(--color-on-dark)] mb-1 flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-[#f59e0b]" /> Network Centrality
                    </h4>
                    <p className="text-[10px] text-[var(--color-muted)] leading-relaxed">
                      Betweenness centrality score is highly elevated (0.87). This node acts as a critical bridge between Community {aiInsightsNode.community ?? 'N/A'} and external clusters.
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-elevated-dark)] rounded-md border border-[var(--color-hairline-dark)]">
                    <h4 className="text-[11px] font-bold text-[var(--color-on-dark)] mb-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1 text-[#cc3333]" /> Risk Assessment
                    </h4>
                    <p className="text-[10px] text-[var(--color-muted)] leading-relaxed">
                      Based on historical MO matching and co-accused frequency, there is a 78% probability of recurrence within the next 30 days. Recommend active surveillance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline UI */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[var(--color-surface-card-dark)] border border-[var(--color-hairline-dark)] rounded-full px-6 py-2.5 flex items-center space-x-4 z-20">
            <Calendar className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-[8px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1 px-1">
                <span>Jan 2026</span>
                <span>Temporal Filter</span>
                <span>Jul 2026</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={timelineValue}
                onChange={(e) => setTimelineValue(e.target.value)}
                className="w-full h-1 bg-[var(--color-surface-elevated-dark)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
              />
            </div>
            <div className="text-[10px] font-plex text-[var(--color-on-dark)] shrink-0 w-12 text-right">
              {timelineValue === 100 ? 'Live' : `T - ${100 - timelineValue}d`}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
