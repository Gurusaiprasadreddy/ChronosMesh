import React from 'react';
import { RootCauseResult, DAGNode } from '../types';

interface RootCausePanelProps {
  nodes: DAGNode[];
  selectedFailureEventId: string;
  result: RootCauseResult | null;
  loading: boolean;
  onSelectFailureEvent: (eventId: string) => void;
  onRunTrace: () => void;
  onHighlightPath?: (path: string[]) => void;
}

export const RootCausePanel: React.FC<RootCausePanelProps> = ({
  nodes,
  selectedFailureEventId,
  result,
  loading,
  onSelectFailureEvent,
  onRunTrace,
  onHighlightPath,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-header">
        <div className="card-title">Root-Cause Tracing (Backward Traversal)</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          Traverse backward through happens-before edges to find root origins of failure events
        </div>
      </div>

      {/* Selector */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Select Target Failure Event:
          </label>
          <select
            value={selectedFailureEventId}
            onChange={(e) => onSelectFailureEvent(e.target.value)}
            style={{
              width: '100%',
              background: '#0d1526',
              border: '1px solid #334155',
              color: '#e2e8f0',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            <option value="" disabled>-- Choose an Event --</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.event_type} ({n.service_id}) — L{n.lamport_ts}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={onRunTrace}
          disabled={!selectedFailureEventId || loading}
          style={{ marginTop: '18px' }}
        >
          {loading ? 'Tracing…' : '🔭 Trace Origin'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: '#0d1526', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Root Causes Found</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {result.root_cause_count}
              </div>
            </div>
            <div style={{ background: '#0d1526', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Critical Path Steps</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#00d4ff', marginTop: '4px' }}>
                {result.critical_path?.length || 0}
              </div>
            </div>
            <div style={{ background: '#0d1526', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Causal Traversal Depth</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {result.root_causes[0]?.depth ?? 0}
              </div>
            </div>
          </div>

          {/* Critical Path Flow */}
          {result.critical_path && result.critical_path.length > 0 && (
            <div style={{ background: '#0d1526', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', marginBottom: '8px' }}>
                Critical Causal Path (Root → Failure):
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {result.critical_path.map((stepId, i) => {
                  const node = nodes.find((n) => n.id === stepId);
                  const isFailure = i === result.critical_path.length - 1;
                  return (
                    <React.Fragment key={stepId}>
                      <div
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: isFailure ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 212, 255, 0.1)',
                          border: `1px solid ${isFailure ? '#ef4444' : '#00d4ff'}`,
                          color: isFailure ? '#ef4444' : '#00d4ff',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {node?.event_type || stepId.slice(0, 8)} {isFailure && '❌'}
                      </div>
                      {i < result.critical_path.length - 1 && (
                        <span style={{ color: '#64748b', fontSize: '12px' }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {onHighlightPath && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onHighlightPath(result.critical_path)}
                  style={{ marginTop: '12px' }}
                >
                  ✨ Highlight Path in DAG
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
