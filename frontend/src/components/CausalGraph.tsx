import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DAGData, DAGNode, DAGEdge } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';

interface CausalGraphProps {
  dagData: DAGData | null;
  selectedNodeId?: string | null;
  highlightedPath?: string[];
  invalidatedNodeIds?: string[];
  removedNodeId?: string | null;
  anomalyNodeIds?: string[];
  rootCauseNodeIds?: string[];
  onSelectNode: (node: DAGNode) => void;
  onSelectEdge?: (edge: DAGEdge) => void;
}

export const CausalGraph: React.FC<CausalGraphProps> = ({
  dagData,
  selectedNodeId,
  highlightedPath = [],
  invalidatedNodeIds = [],
  removedNodeId = null,
  anomalyNodeIds = [],
  rootCauseNodeIds = [],
  onSelectNode,
  onSelectEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const initialTransformRef = useRef<d3.ZoomTransform | null>(null);
  const currentTransformRef = useRef<d3.ZoomTransform | null>(null);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: DAGNode | null;
  }>({ visible: false, x: 0, y: 0, node: null });

  useEffect(() => {
    if (!containerRef.current || !dagData || !dagData.nodes.length) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;
    const NODE_R = 24;
    const COL_W = 190;
    const ROW_H = 100;
    const PADDING = 50;

    // ── 1. Calculate positions via Kahn's topological depth ──────────────────
    const nodes = dagData.nodes;
    const edges = dagData.edges;

    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      adj[e.source]?.push(e.target);
    });

    const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
    const depth: Record<string, number> = {};
    queue.forEach((id) => (depth[id] = 0));

    while (queue.length) {
      const cur = queue.shift()!;
      (adj[cur] || []).forEach((nxt) => {
        depth[nxt] = Math.max(depth[nxt] || 0, (depth[cur] || 0) + 1);
        inDegree[nxt]--;
        if (inDegree[nxt] === 0) queue.push(nxt);
      });
    }

    const services = Array.from(new Set(nodes.map((n) => n.service_id)));
    const svcColMap: Record<string, number> = {};
    services.forEach((s, idx) => (svcColMap[s] = idx));

    const bucketCounts: Record<string, number> = {};
    const positions: Record<string, { x: number; y: number }> = {};

    nodes.forEach((n) => {
      const col = svcColMap[n.service_id] || 0;
      const row = depth[n.id] || 0;
      const key = `${col}_${row}`;
      const slot = bucketCounts[key] || 0;
      bucketCounts[key] = slot + 1;

      positions[n.id] = {
        x: PADDING + col * COL_W + slot * 35,
        y: PADDING + row * ROW_H,
      };
    });

    const maxDepth = Math.max(...Object.values(depth), 0);

    // ── 2. Setup D3 SVG & Zoom ───────────────────────────────────────────────
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#060a12');
    svgRef.current = svg.node();

    const g = svg.append('g').attr('class', 'main-group');

    // Auto-center layout
    const allX = Object.values(positions).map((p) => p.x);
    const allY = Object.values(positions).map((p) => p.y);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const initialTransform = d3.zoomIdentity.translate(width / 2 - centerX, height / 2 - centerY);
    initialTransformRef.current = initialTransform;

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .clickDistance(10)
      .filter((event) => {
        const target = event.target as Element | null;
        if (target && target.closest('.node-item')) {
          return false;
        }
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      })
      .on('zoom', (event) => {
        currentTransformRef.current = event.transform;
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    if (currentTransformRef.current) {
      svg.call(zoomBehavior.transform, currentTransformRef.current);
    } else {
      svg.call(zoomBehavior.transform, initialTransform);
      currentTransformRef.current = initialTransform;
    }

    // Marker defs
    const defs = svg.append('defs');
    const markerTypes = [
      { id: 'arrow-normal', color: '#475569' },
      { id: 'arrow-explicit', color: '#00d4ff' },
      { id: 'arrow-path', color: '#f59e0b' },
      { id: 'arrow-invalidated', color: '#ef4444' },
    ];

    markerTypes.forEach((m) => {
      defs
        .append('marker')
        .attr('id', m.id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', NODE_R + 6)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', m.color);
    });

    // ── 3. Swimlanes ────────────────────────────────────────────────────────
    const laneGroup = g.append('g').attr('class', 'lanes');
    services.forEach((svc, i) => {
      const lx = PADDING + i * COL_W - COL_W / 2 + 10;
      const ly = PADDING - 30;
      const lh = PADDING + maxDepth * ROW_H + 50;

      laneGroup
        .append('rect')
        .attr('x', lx)
        .attr('y', ly)
        .attr('width', COL_W - 20)
        .attr('height', lh - ly)
        .attr('rx', 8)
        .attr('fill', `${getServiceColor(svc)}08`)
        .attr('stroke', `${getServiceColor(svc)}25`)
        .attr('stroke-width', 1);

      laneGroup
        .append('text')
        .attr('x', lx + (COL_W - 20) / 2)
        .attr('y', ly + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', getServiceColor(svc))
        .attr('letter-spacing', '0.5px')
        .text(getServiceLabel(svc));
    });

    // ── 4. Edges ────────────────────────────────────────────────────────────
    const edgeGroup = g.append('g').attr('class', 'edges');

    edges.forEach((e) => {
      const src = positions[e.source];
      const tgt = positions[e.target];
      if (!src || !tgt) return;

      const isPath =
        highlightedPath.includes(e.source) &&
        highlightedPath.includes(e.target) &&
        Math.abs(highlightedPath.indexOf(e.source) - highlightedPath.indexOf(e.target)) === 1;

      const isInvalidated =
        invalidatedNodeIds.includes(e.target) || e.source === removedNodeId;

      const strokeColor = isInvalidated
        ? '#ef4444'
        : isPath
        ? '#f59e0b'
        : e.explicit
        ? '#00d4ff'
        : '#334155';

      const strokeWidth = isPath || isInvalidated ? 3 : e.explicit ? 2 : 1.5;
      const markerId = isInvalidated
        ? 'arrow-invalidated'
        : isPath
        ? 'arrow-path'
        : e.explicit
        ? 'arrow-explicit'
        : 'arrow-normal';

      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2 - 15;

      const path = edgeGroup
        .append('path')
        .attr('d', `M${src.x},${src.y} Q${mx},${my} ${tgt.x},${tgt.y}`)
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', e.explicit || isPath || isInvalidated ? 'none' : '4,3')
        .attr('marker-end', `url(#${markerId})`)
        .attr('opacity', 0.8)
        .style('cursor', 'pointer');

      if (onSelectEdge) {
        path.on('click', () => onSelectEdge(e));
      }
    });

    // ── 5. Nodes ────────────────────────────────────────────────────────────
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const handleNodeClick = (event: any, d: DAGNode) => {
      if (event) {
        event.stopPropagation();
      }
      onSelectNode(d);
    };

    const nodeEls = nodeGroup
      .selectAll('.node-item')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .attr('transform', (d) => `translate(${positions[d.id].x},${positions[d.id].y})`)
      .style('cursor', 'pointer')
      .on('click', handleNodeClick)
      .on('pointerup', (event, d) => {
        if (event && (event.button === 0 || event.button === undefined)) {
          handleNodeClick(event, d);
        }
      })
      .on('mouseenter', (event, d) => {
        const bounds = container.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - bounds.left + 15,
          y: event.clientY - bounds.top + 15,
          node: d,
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Outer glow / anomaly / root cause ring
    nodeEls
      .append('circle')
      .attr('r', NODE_R + 5)
      .attr('fill', (d) => `${getServiceColor(d.service_id)}15`)
      .attr('stroke', (d) => {
        if (d.id === selectedNodeId) return '#f59e0b';
        if (d.id === removedNodeId) return '#ef4444';
        if (rootCauseNodeIds.includes(d.id)) return '#f43f5e';
        if (anomalyNodeIds.includes(d.id)) return '#e11d48';
        return `${getServiceColor(d.service_id)}40`;
      })
      .attr('stroke-width', (d) =>
        d.id === selectedNodeId || rootCauseNodeIds.includes(d.id) || anomalyNodeIds.includes(d.id)
          ? 3
          : 1
      );

    // Main Circle
    nodeEls
      .append('circle')
      .attr('r', NODE_R)
      .attr('fill', (d) => {
        if (d.id === removedNodeId) return '#7f1d1d';
        if (invalidatedNodeIds.includes(d.id)) return '#9a3412';
        return '#0d1526';
      })
      .attr('stroke', (d) => {
        if (d.id === removedNodeId) return '#ef4444';
        if (invalidatedNodeIds.includes(d.id)) return '#f97316';
        if (d.id === selectedNodeId) return '#f59e0b';
        if (rootCauseNodeIds.includes(d.id)) return '#f43f5e';
        return getServiceColor(d.service_id);
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3 : 2));

    // Event Type Abbreviation
    nodeEls
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '8px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#f1f5f9')
      .style('pointer-events', 'none')
      .text((d) => {
        const parts = d.event_type.split('_');
        if (parts.length === 1) return d.event_type.slice(0, 5);
        return parts.map((p) => p[0]).join('').slice(0, 4);
      });

    // Lamport clock pill
    nodeEls
      .append('rect')
      .attr('x', NODE_R - 10)
      .attr('y', NODE_R - 9)
      .attr('width', 18)
      .attr('height', 14)
      .attr('rx', 7)
      .attr('fill', '#090d16')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)
      .style('pointer-events', 'none');

    nodeEls
      .append('text')
      .attr('x', NODE_R - 1)
      .attr('y', NODE_R - 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '8px')
      .attr('font-weight', '700')
      .attr('font-family', 'monospace')
      .attr('fill', '#00d4ff')
      .style('pointer-events', 'none')
      .text((d) => `L${d.lamport_ts}`);

    // Robust transparent hit target covering the entire node
    nodeEls
      .append('circle')
      .attr('class', 'node-hitbox')
      .attr('r', NODE_R + 10)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .style('pointer-events', 'all')
      .on('click', handleNodeClick)
      .on('pointerup', (event, d) => {
        if (event && (event.button === 0 || event.button === undefined)) {
          handleNodeClick(event, d);
        }
      });

  }, [
    dagData,
    selectedNodeId,
    highlightedPath,
    invalidatedNodeIds,
    removedNodeId,
    anomalyNodeIds,
    rootCauseNodeIds,
    onSelectNode,
    onSelectEdge,
  ]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleZoomReset = () => {
    if (svgRef.current && zoomBehaviorRef.current && initialTransformRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform, initialTransformRef.current);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      {/* Zoom Toolbar */}
      <div className="cm-graph-toolbar">
        <button
          className="cm-btn"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={handleZoomIn}
          title="Zoom In"
        >
          +
        </button>
        <button
          className="cm-btn"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          −
        </button>
        <button
          className="cm-btn"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={handleZoomReset}
          title="Reset Zoom"
        >
          ⟲
        </button>
      </div>

      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '8px', overflow: 'hidden' }}
      />

      {/* Hover Tooltip */}
      {tooltip.visible && tooltip.node && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            background: 'rgba(13, 21, 38, 0.95)',
            border: '1px solid var(--cm-border-default)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '11px',
            color: 'var(--cm-text-primary)',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: 'var(--cm-shadow-md)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--cm-accent)' }}>{tooltip.node.id}</div>
          <div>Type: {tooltip.node.event_type}</div>
          <div>Service: {getServiceLabel(tooltip.node.service_id)}</div>
          <div>Lamport: L{tooltip.node.lamport_ts}</div>
        </div>
      )}

      {/* Legend */}
      <div className="cm-graph-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff' }} />
            <span>Explicit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569' }} />
            <span>Inferred</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span>Selected</span>
          </div>
          {anomalyNodeIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48' }} />
              <span>Anomaly</span>
            </div>
          )}
          {rootCauseNodeIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
              <span>Root Cause</span>
            </div>
          )}
          {invalidatedNodeIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span>Invalidated</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
