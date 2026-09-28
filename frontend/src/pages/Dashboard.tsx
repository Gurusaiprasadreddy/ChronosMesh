import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { SystemMetrics, Event, Scenario } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';

interface DashboardPageProps {
  metrics: SystemMetrics | null;
  scenarios: Scenario[];
  currentScenario: string | null;
  events: Event[];
  liveEvents: Event[];
  onLoadScenario: (scenarioId: string) => void;
  onNavigateToDag: () => void;
  loading: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  scenarios,
  currentScenario,
  events,
  liveEvents,
  onLoadScenario,
  onNavigateToDag,
  loading,
}) => {
  const displayEvents = liveEvents.length > 0 ? liveEvents : events;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <MetricCard
          icon="📨"
          label="Events Ingested"
          value={metrics?.event_count ?? events.length}
          color="#00d4ff"
        />
        <MetricCard
          icon="⬤"
          label="Causal DAG Nodes"
          value={metrics?.dag_nodes ?? 0}
          color="#8b5cf6"
        />
        <MetricCard
          icon="🔗"
          label="Causal Edges"
          value={metrics?.dag_edges ?? 0}
          color="#f59e0b"
        />
        <MetricCard
          icon="🌐"
          label="Tracked Services"
          value={metrics?.services_tracked ?? 4}
          color="#10b981"
        />
      </div>

      {/* Scenario / Trace Cards */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
          Select Workflow Scenario / Trace
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {scenarios.map((sc) => {
            const isCurrent = currentScenario === sc.id || currentScenario === sc.trace_id;
            return (
              <div
                key={sc.id}
                onClick={() => onLoadScenario(sc.id)}
                style={{
                  background: '#0d1526',
                  borderRadius: '10px',
                  padding: '16px',
                  border: `1px solid ${isCurrent ? '#00d4ff' : '#1e293b'}`,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrent ? '0 0 16px rgba(0,212,255,0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      background: 'rgba(0,212,255,0.1)',
                      color: '#00d4ff',
                    }}
                  >
                    {sc.trace_id || sc.pattern}
                  </span>
                  {isCurrent && (
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                      ● Active
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                  {sc.name}
                </div>

                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  {sc.description}
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
                  <span>~{sc.expected_nodes} nodes</span>
                  <span>•</span>
                  <span>{sc.services?.length || 4} services</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Event Feed & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Event Feed */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">Live Ingested Event Feed</div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Showing {displayEvents.length} events
            </span>
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px' }}>
            {displayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '12px' }}>
                Load a scenario above to stream events
              </div>
            ) : (
              displayEvents.map((e, idx) => (
                <div
                  key={e.event_id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#0d1526',
                    border: '1px solid #1e293b',
                    borderLeft: `4px solid ${getServiceColor(e.service_id)}`,
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>{e.event_type}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      ({getServiceLabel(e.service_id)})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#00d4ff', fontFamily: 'monospace', fontSize: '11px' }}>
                      L{e.lamport_ts}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>
                      {e.region || e.metadata?.region || 'local'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launch & Status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">Causal Graph & Replay</div>
            </div>
            <div style={{ padding: '16px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>
              <p>
                ChronosMesh processes out-of-order events from multi-cloud regions, computing happens-before
                partial orders and transitive reductions to reveal true causality.
              </p>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div>✓ <strong>Vector Clocks:</strong> Detect concurrent branches (E₂ ∥ E₃)</div>
                <div>✓ <strong>HLC / Physical:</strong> Bounds clock drift across AWS/GCP regions</div>
                <div>✓ <strong>Anomalies:</strong> Identifies time inversions and cyclic locks</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onNavigateToDag}
              disabled={loading || !currentScenario}
            >
              🔗 View Reconstructed Causal Graph →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
