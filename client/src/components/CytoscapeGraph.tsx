import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { GraphNode, GraphEdge } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, Info, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

try {
  cytoscape.use(dagre);
} catch {
  // Ignore if already registered
}

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  targetIdentifier?: string;
  onNodeSelect?: (nodeData: any) => void;
  height?: string;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  nodes,
  edges,
  targetIdentifier,
  onNodeSelect,
  height = '500px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...nodes.map(n => ({
        group: 'nodes' as const,
        data: {
          id: n.data.id,
          label: n.data.label,
          fullAddress: n.data.fullAddress,
          type: n.data.type,
          isTarget: n.data.isTarget || n.data.fullAddress?.toLowerCase() === targetIdentifier?.toLowerCase(),
          inflowEth: n.data.inflowEth || 0,
          outflowEth: n.data.outflowEth || 0,
          riskLevel: n.data.riskLevel
        }
      })),
      ...edges.map((e, idx) => ({
        group: 'edges' as const,
        data: {
          id: e.data.id || `e_${idx}`,
          source: e.data.source,
          target: e.data.target,
          label: `${e.data.valueEth.toFixed(2)} ETH`,
          valueEth: e.data.valueEth,
          hash: e.data.hash,
          timestamp: e.data.timestamp,
          isError: e.data.isError
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#0B1730',
            'border-width': 2,
            'border-color': '#06D9FF',
            'label': 'data(label)',
            'color': '#F8FAFC',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'width': 36,
            'height': 36,
            'overlay-opacity': 0
          }
        },
        {
          selector: 'node[?isTarget]',
          style: {
            'background-color': '#2563EB',
            'border-color': '#06D9FF',
            'border-width': 4,
            'width': 48,
            'height': 48,
            'font-size': '12px',
            'font-weight': 'bold',
            'color': '#06D9FF'
          }
        },
        {
          selector: 'node[type = "target_tx"]',
          style: {
            'shape': 'diamond',
            'background-color': '#7C3AED',
            'border-color': '#06D9FF'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'rgba(6, 217, 255, 0.4)',
            'target-arrow-color': '#06D9FF',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '10px',
            'color': '#94A3B8',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.8,
            'text-background-color': '#06132D',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'arrow-scale': 1.2
          }
        },
        {
          selector: 'edge[?isError]',
          style: {
            'line-color': '#EF4444',
            'target-arrow-color': '#EF4444',
            'line-style': 'dashed'
          }
        },
        {
          selector: '.highlighted',
          style: {
            'border-color': '#06D9FF',
            'border-width': 4,
            'shadow-blur': 15,
            'shadow-color': '#06D9FF',
            'shadow-opacity': 0.8
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2
          }
        }
      ] as any,
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeDimensionsIncludeLabels: true,
        fit: true,
        padding: 50
      }
    });

    cyRef.current = cy;

    // Node click interactions
    cy.on('tap', 'node', evt => {
      const node = evt.target;
      const data = node.data();
      setSelectedElement({ type: 'node', data });
      if (onNodeSelect) onNodeSelect(data);

      // Highlight neighborhood
      cy.elements().removeClass('highlighted dimmed');
      const neighborhood = node.neighborhood().add(node);
      cy.elements().not(neighborhood).addClass('dimmed');
      neighborhood.addClass('highlighted');
    });

    // Edge click interactions
    cy.on('tap', 'edge', evt => {
      const edge = evt.target;
      setSelectedElement({ type: 'edge', data: edge.data() });
    });

    // Background click to clear highlight
    cy.on('tap', evt => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted dimmed');
        setSelectedElement(null);
      }
    });

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, targetIdentifier]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleReset = () => {
    cyRef.current?.elements().removeClass('highlighted dimmed');
    cyRef.current?.layout({ name: 'cose', animate: true }).run();
    setSelectedElement(null);
  };
  const handleExportPng = () => {
    if (!cyRef.current) return;
    const png = cyRef.current.png({ bg: '#020817', full: true, scale: 2 });
    const link = document.createElement('a');
    link.href = png;
    link.download = `chainforensics_network_graph_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="relative w-full rounded-xl bg-[#06132D] border border-[#06D9FF]/20 overflow-hidden shadow-card">
      {/* Controls Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-lg bg-[#0B1730]/90 backdrop-blur-md border border-white/10 shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#06D9FF] hover:bg-[#06132D] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#06D9FF] hover:bg-[#06132D] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#06D9FF] hover:bg-[#06132D] transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#06D9FF] hover:bg-[#06132D] transition-colors"
          title="Re-layout Graph"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={handleExportPng}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#06132D] transition-colors"
          title="Export Graph as PNG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0B1730]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2563EB] border border-[#06D9FF]" />
          <span>Target Entity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0B1730] border border-[#06D9FF]" />
          <span>Counterparty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#06D9FF]" />
          <span>Fund Transfer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#EF4444] border-dashed" />
          <span>Failed Tx</span>
        </div>
      </div>

      {/* Selected Element Drawer / Floating Card */}
      {selectedElement && (
        <div className="absolute top-3 left-3 z-10 max-w-sm p-4 rounded-xl bg-[#0B1730]/95 backdrop-blur-md border border-[#06D9FF]/30 text-xs shadow-glow-cyan">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <span className="font-semibold text-[#06D9FF] uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {selectedElement.type === 'node' ? 'Entity Inspector' : 'Transfer Details'}
            </span>
            <button
              onClick={() => setSelectedElement(null)}
              className="text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              ✕
            </button>
          </div>

          {selectedElement.type === 'node' ? (
            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-[#94A3B8] block text-[10px]">Address:</span>
                <span className="text-[#F8FAFC] break-all select-all font-semibold">
                  {selectedElement.data.fullAddress || selectedElement.data.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#06132D] p-2 rounded border border-white/5">
                  <span className="text-[#94A3B8] block text-[9px] flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3 text-[#22C55E]" /> Total Inflow
                  </span>
                  <span className="text-[#22C55E] font-bold">
                    {selectedElement.data.inflowEth?.toFixed(4) || '0.00'} ETH
                  </span>
                </div>
                <div className="bg-[#06132D] p-2 rounded border border-white/5">
                  <span className="text-[#94A3B8] block text-[9px] flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-[#EF4444]" /> Total Outflow
                  </span>
                  <span className="text-[#EF4444] font-bold">
                    {selectedElement.data.outflowEth?.toFixed(4) || '0.00'} ETH
                  </span>
                </div>
              </div>
              {selectedElement.data.isTarget && (
                <div className="px-2 py-1 rounded bg-[#2563EB]/20 border border-[#06D9FF]/30 text-[#06D9FF] text-[10px]">
                  Primary Target of Investigation
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-[#94A3B8] block text-[10px]">Transaction Hash:</span>
                <span className="text-[#F8FAFC] break-all select-all">
                  {selectedElement.data.hash}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#94A3B8]">Value:</span>
                <span className="text-[#06D9FF] font-bold">
                  {selectedElement.data.valueEth} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Timestamp:</span>
                <span className="text-[#F8FAFC]">
                  {new Date(selectedElement.data.timestamp * 1000).toLocaleString()}
                </span>
              </div>
              {selectedElement.data.isError && (
                <span className="text-[#EF4444] block font-bold text-[10px]">
                  Transaction Reverted / Failed Execution
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} style={{ height, width: '100%' }} className="cyber-grid" />
    </div>
  );
};
