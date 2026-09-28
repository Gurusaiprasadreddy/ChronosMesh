import React, { useState } from 'react';
import { WhatIfResult, DAGNode } from '../types';

interface WhatIfPanelProps {
  nodes: DAGNode[];
  selectedEventId: string;
  result: WhatIfResult | null;
  loading: boolean;
  onSelectEvent: (eventId: string) => void;
  onRunSimulation: (eventId: string) => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  nodes,
  selectedEventId,
  result,
  loading,
  onSelectEvent,
  onRunSimulation,
}) => {
  const [modificationType, setModificationType] = useState<'remove' | 'delay' | 'failure'>('remove');
  const [delayMs, setDelayMs] = useState<number>(500);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-header">
        <div className="card-title">What-If Causal Replay & Blast Radius Lab</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          Simulate counterfactual events: "If event X had not occurred, what downstream effects cascade?"
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Select Event to Modify:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
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

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Modification Strategy:
            </label>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mod"
                  checked={modificationType === 'remove'}
                  onChange={() => setModificationType('remove')}
                />
                Remove Event (Blast Radius)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mod"
                  checked={modificationType === 'delay'}
                  onChange={() => setModificationType('delay')}
                />
                Simulate Clock Drift / Delay
              </label>
            </div>
          </div>

          {modificationType === 'delay' && (
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Injected Latency: {delayMs} ms
              </label>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={delayMs}
                onChange={(e) => setDelayMs(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => onRunSimulation(selectedEventId)}
            disabled={!selectedEventId || loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Simulating…' : '🎯 Run Simulation'}
          </button>
        </div>

        {/* Results Overview */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0d1526', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
              Simulation Outcome:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Blast Radius:</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>
                  {result.blast_radius_pct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Cascade Depth:</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00d4ff' }}>
                  {result.cascade_depth} hops
                </div>
              </div>
            </div>

            {/* Affected Services */}
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Affected Services ({result.affected_services.length}):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {result.affected_services.map((svc) => (
                  <span
                    key={svc}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Invalidated Count */}
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Invalidated Events ({result.invalidated_count}):
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', maxHeight: '80px', overflowY: 'auto' }}>
                {result.invalidated_events.map((id) => {
                  const node = nodes.find((n) => n.id === id);
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: '#ef4444' }}>✕ {node?.event_type || id.slice(0, 8)}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{node?.service_id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
