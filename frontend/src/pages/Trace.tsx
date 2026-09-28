import React, { useState } from 'react';
import { CausalGraph } from '../components/CausalGraph';
import { EventDetails } from '../components/EventDetails';
import { DAGData, DAGNode, DAGEdge, Anomaly } from '../types';

interface TracePageProps {
  dagData: DAGData | null;
  anomalies: Anomaly[];
  currentTrace: string | null;
  onRunWhatIf: (nodeId: string) => void;
  onTraceRootCause: (nodeId: string) => void;
}

export const TracePage: React.FC<TracePageProps> = ({
  dagData,
  anomalies,
  currentTrace,
  onRunWhatIf,
  onTraceRootCause,
}) => {
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

  if (!dagData || !dagData.nodes.length) {
    return (
      <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔗</div>
        <h3 style={{ color: '#e2e8f0', fontSize: '18px', marginBottom: '8px' }}>No Active Trace Loaded</h3>
        <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '13px' }}>
          Select or load a trace from the sidebar or overview to generate the reconstructed causal DAG.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Causal Graph Panel */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            display: 'flex',
            gap: '8px',
            background: 'rgba(13, 21, 38, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #1e293b',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
            Nodes: {dagData.nodes.length}
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#00d4ff' }}>
            Edges: {dagData.edges.length}
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Roots: {dagData.roots?.length || 1}
          </span>
        </div>

        <CausalGraph
          dagData={dagData}
          selectedNodeId={selectedNode?.id}
          highlightedPath={highlightedPath}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      </div>

      {/* Details Sidebar */}
      <div>
        <EventDetails
          node={selectedNode}
          edges={dagData.edges}
          anomalies={anomalies}
          currentTrace={currentTrace}
          onRunWhatIf={onRunWhatIf}
          onTraceRootCause={onTraceRootCause}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
};
