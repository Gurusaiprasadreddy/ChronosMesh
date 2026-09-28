import React from 'react';
import { DAGNode, DAGEdge, Anomaly } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';

interface EventDetailsProps {
  node: DAGNode | null;
  edges: DAGEdge[];
  anomalies?: Anomaly[];
  currentTrace?: string | null;
  onRunWhatIf?: (nodeId: string) => void;
  onTraceRootCause?: (nodeId: string) => void;
  onClose?: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  node,
  edges,
  anomalies = [],
  currentTrace,
  onRunWhatIf,
  onTraceRootCause,
  onClose,
}) => {
  if (!node) {
    return (
      <div className="card" style={{ height: '100%' }}>
        <div className="card-header">
          <div className="card-title">Event Details</div>
        </div>
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👆</div>
          <p style={{ fontSize: '13px' }}>Click any event node in the DAG to inspect causal details</p>
        </div>
      </div>
    );
  }

  const svcColor = getServiceColor(node.service_id);
  const parents = edges.filter((e) => e.target === node.id).map((e) => e.source);
  const children = edges.filter((e) => e.source === node.id).map((e) => e.target);
  const nodeAnomalies = anomalies.filter(
    (a) => a.source_event_id === node.id || a.target_event_id === node.id
  );

  const vectorClock = node.vector_clock || {};
  const maxClockVal = Math.max(...Object.values(vectorClock), 1);

  return (
    <div className="card" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title">Event Details</div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {/* Header Badges */}
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
          {node.event_type}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: `${svcColor}20`,
              color: svcColor,
              border: `1px solid ${svcColor}50`,
            }}
          >
            {getServiceLabel(node.service_id)}
          </span>
          {node.region && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              🌍 {node.region}
            </span>
          )}
          {currentTrace && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                backgroundColor: 'rgba(0,212,255,0.1)',
                color: '#00d4ff',
                border: '1px solid rgba(0,212,255,0.2)',
              }}
            >
              Trace: {currentTrace}
            </span>
          )}
        </div>

        {/* Anomaly banner if event has violations */}
        {nodeAnomalies.length > 0 && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              marginBottom: '16px',
              fontSize: '12px',
            }}
          >
            <strong>⚠️ Anomaly Flagged:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {nodeAnomalies.map((a, i) => (
                <li key={i}>{a.description} ({a.anomaly_type})</li>
              ))}
            </ul>
          </div>
        )}

        {/* Clock Info */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Logical Clocks
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#0d1526', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Lamport TS</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#00d4ff' }}>L{node.lamport_ts}</div>
            </div>
            <div style={{ background: '#0d1526', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Uncertainty</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
                ±{node.clock_uncertainty_ms ?? 5} ms
              </div>
            </div>
          </div>
        </div>

        {/* Vector Clock */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Vector Clock State
          </div>
          <div style={{ background: '#0d1526', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            {Object.keys(vectorClock).length === 0 ? (
              <div style={{ fontSize: '11px', color: '#64748b' }}>No vector clock data</div>
            ) : (
              Object.entries(vectorClock).map(([svc, count]) => (
                <div
                  key={svc}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px' }}
                >
                  <span style={{ width: '90px', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {getServiceLabel(svc)}
                  </span>
                  <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round((count / maxClockVal) * 100)}%`,
                        height: '100%',
                        background: getServiceColor(svc),
                      }}
                    />
                  </div>
                  <span style={{ width: '20px', textAlign: 'right', fontWeight: 700, color: '#f8fafc' }}>
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Physical Timestamps
          </div>
          <div style={{ background: '#0d1526', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748b' }}>Event Time:</span>
              <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
                {new Date(node.timestamp_ms).toISOString().replace('T', ' ').slice(0, 23)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Epoch (ms):</span>
              <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{node.timestamp_ms}</span>
            </div>
          </div>
        </div>

        {/* Causal Graph Neighbors */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Causal Graph Neighbors
          </div>
          <div style={{ fontSize: '12px', background: '#0d1526', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#64748b' }}>Parents (Causes): </span>
              <span style={{ color: parents.length ? '#00d4ff' : '#94a3b8', fontWeight: 600 }}>
                {parents.length ? `${parents.length} event(s)` : 'None (Root Event)'}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Children (Effects): </span>
              <span style={{ color: children.length ? '#8b5cf6' : '#94a3b8', fontWeight: 600 }}>
                {children.length ? `${children.length} event(s)` : 'None (Leaf Event)'}
              </span>
            </div>
          </div>
        </div>

        {/* Event ID */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Full Event ID
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all' }}>
            {node.id}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {onRunWhatIf && (
            <button className="btn btn-outline btn-sm" onClick={() => onRunWhatIf(node.id)}>
              🎯 Run What-If Simulation
            </button>
          )}
          {onTraceRootCause && (
            <button className="btn btn-ghost btn-sm" onClick={() => onTraceRootCause(node.id)}>
              🔭 Trace Root Cause
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
