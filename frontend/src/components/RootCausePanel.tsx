import React from 'react';
import { RootCauseResult, DAGNode } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';

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
  // Extract affected services along the critical path
  const affectedServices = React.useMemo(() => {
    if (!result || !result.critical_path) return [];
    const svcs = new Set<string>();
    result.critical_path.forEach((id) => {
      const node = nodes.find((n) => n.id === id);
      if (node?.service_id) svcs.add(node.service_id);
    });
    return Array.from(svcs);
  }, [result, nodes]);

  const rootCauseNode = React.useMemo(() => {
    if (!result || !result.root_causes.length) return null;
    const rootId = result.root_causes[0]?.event_id;
    return nodes.find((n) => n.id === rootId) || null;
  }, [result, nodes]);

  const failureNode = React.useMemo(() => {
    if (!selectedFailureEventId) return null;
    return nodes.find((n) => n.id === selectedFailureEventId) || null;
  }, [selectedFailureEventId, nodes]);

  return (
    <div className="cm-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
            Root-Cause Tracing (Backward DAG Traversal)
          </div>
          <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
            Traverses backward through happens-before edges to diagnose the causal root of any failure
          </div>
        </div>
      </div>

      {/* Target Failure Event Selector */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ fontSize: '11px', color: 'var(--cm-text-secondary)', display: 'block', marginBottom: '6px' }}>
            Select Target Failure Event:
          </label>
          <select
            value={selectedFailureEventId}
            onChange={(e) => onSelectFailureEvent(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--cm-bg-elevated)',
              border: '1px solid var(--cm-border-default)',
              color: 'var(--cm-text-primary)',
              padding: '8px 12px',
              borderRadius: 'var(--cm-radius-sm)',
              fontSize: '12px',
            }}
          >
            <option value="" disabled>-- Select a Target Event to Trace --</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.event_type} ({getServiceLabel(n.service_id)}) — L{n.lamport_ts} [{n.id.slice(0, 12)}...]
              </option>
            ))}
          </select>
        </div>

        <button
          className="cm-btn cm-btn-primary"
          onClick={onRunTrace}
          disabled={!selectedFailureEventId || loading}
          style={{ height: '36px', padding: '0 16px' }}
        >
          {loading ? 'Traversing DAG…' : '🔭 Trace Root Cause'}
        </button>
      </div>

      {/* Structured Causal Diagnosis: ROOT CAUSE -> CAUSAL CHAIN -> AFFECTED SERVICES -> DOWNSTREAM IMPACT */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* 1. ROOT CAUSE */}
            <div className="cm-card-elevated" style={{ borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                1. Root Cause Origin
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginTop: '4px' }}>
                {rootCauseNode ? rootCauseNode.event_type : (result.root_causes[0]?.event_id || 'N/A')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
                Service: <strong style={{ color: 'var(--cm-text-secondary)' }}>{rootCauseNode ? getServiceLabel(rootCauseNode.service_id) : 'unknown'}</strong>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
                Depth: {result.root_causes[0]?.depth ?? 0} hops
              </div>
            </div>

            {/* 2. AFFECTED SERVICES */}
            <div className="cm-card-elevated" style={{ borderLeft: '3px solid #8b5cf6' }}>
              <div style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase' }}>
                2. Traversed Services
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                {affectedServices.map((svc) => (
                  <span
                    key={svc}
                    className="cm-badge"
                    style={{
                      background: `${getServiceColor(svc)}20`,
                      color: getServiceColor(svc),
                      border: `1px solid ${getServiceColor(svc)}40`,
                    }}
                  >
                    {getServiceLabel(svc)}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. DOWNSTREAM IMPACT */}
            <div className="cm-card-elevated" style={{ borderLeft: '3px solid #ef4444' }}>
              <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                3. Downstream Failure
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginTop: '4px' }}>
                {failureNode ? failureNode.event_type : selectedFailureEventId}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
                Critical steps: <strong style={{ color: '#38bdf8' }}>{result.critical_path?.length || 0}</strong>
              </div>
            </div>
          </div>

          {/* 4. CAUSAL PROPAGATION CHAIN */}
          {result.critical_path && result.critical_path.length > 0 && (
            <div className="cm-card-elevated">
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Causal Propagation Chain (Root Origin → Propagated Path → Terminal Impact):
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {result.critical_path.map((stepId, i) => {
                  const node = nodes.find((n) => n.id === stepId);
                  const isRoot = i === 0;
                  const isFailure = i === result.critical_path.length - 1;
                  const badgeColor = isRoot ? '#f59e0b' : isFailure ? '#ef4444' : '#38bdf8';

                  return (
                    <React.Fragment key={stepId}>
                      <div
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          background: `${badgeColor}15`,
                          border: `1px solid ${badgeColor}40`,
                          color: badgeColor,
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{isRoot ? '🌱 ' : isFailure ? '💥 ' : ''}{node?.event_type || stepId.slice(0, 8)}</span>
                        {node?.service_id && (
                          <span style={{ fontSize: '9px', opacity: 0.8, color: 'var(--cm-text-muted)' }}>
                            [{getServiceLabel(node.service_id)}]
                          </span>
                        )}
                      </div>
                      {i < result.critical_path.length - 1 && (
                        <span style={{ color: 'var(--cm-text-muted)', fontSize: '12px' }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {onHighlightPath && (
                <button
                  className="cm-btn"
                  onClick={() => onHighlightPath(result.critical_path)}
                  style={{ marginTop: '12px', fontSize: '11px' }}
                >
                  Highlight Causal Chain in Graph
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
