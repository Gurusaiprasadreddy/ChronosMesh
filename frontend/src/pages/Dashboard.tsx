import React, { useEffect, useState, useCallback } from 'react';
import { MetricCard } from '../components/MetricCard';
import { ServiceHealthMap } from '../components/ServiceHealthMap';
import { SystemMetrics, Event, Scenario, ServiceHealthReport, LatencyHistogramReport, AnomalyReport } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';
import api from '../services/api';

interface DashboardPageProps {
  metrics: SystemMetrics | null;
  scenarios: Scenario[];
  currentScenario: string | null;
  events: Event[];
  liveEvents: Event[];
  onLoadScenario: (scenarioId: string) => void;
  onNavigateToDag: () => void;
  loading: boolean;
  anomalyReport?: AnomalyReport | null;
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
  anomalyReport,
}) => {
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthReport | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [latencyData, setLatencyData] = useState<LatencyHistogramReport | null>(null);
  const [latencyLoading, setLatencyLoading] = useState<boolean>(false);

  const fetchHealthAndLatency = useCallback(async () => {
    setHealthLoading(true);
    setLatencyLoading(true);
    setHealthError(null);
    try {
      const [h, l] = await Promise.allSettled([
        api.getServiceHealth(),
        api.getLatencyHistogram(5),
      ]);
      if (h.status === 'fulfilled') {
        setServiceHealth(h.value);
      } else {
        setHealthError((h.reason as Error)?.message || 'Failed to fetch service health');
      }
      if (l.status === 'fulfilled') {
        setLatencyData(l.value);
      }
    } finally {
      setHealthLoading(false);
      setLatencyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthAndLatency();
  }, [fetchHealthAndLatency, currentScenario, events.length]);

  const displayEvents = liveEvents.length > 0 ? liveEvents : events;

  // Determine overall system health deterministically from real data
  const overallHealth = serviceHealth
    ? serviceHealth.critical_count > 0
      ? 'Critical'
      : serviceHealth.degraded_count > 0
      ? 'Degraded'
      : serviceHealth.total_services > 0
      ? 'Healthy'
      : 'N/A'
    : 'N/A';

  const healthColor =
    overallHealth === 'Healthy'
      ? '#10b981'
      : overallHealth === 'Degraded'
      ? '#f59e0b'
      : overallHealth === 'Critical'
      ? '#ef4444'
      : '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Top Section: Key System Indicators ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <MetricCard
          icon="🛡️"
          label="System Health"
          value={overallHealth}
          color={healthColor}
        />
        <MetricCard
          icon="🧭"
          label="Active Traces"
          value={currentScenario ? 1 : 0}
          color="#38bdf8"
        />
        <MetricCard
          icon="📨"
          label="Events Ingested"
          value={metrics?.event_count ?? events.length}
          color="#00d4ff"
        />
        <MetricCard
          icon="⚠️"
          label="Anomalies"
          value={anomalyReport?.total ?? 0}
          color={anomalyReport?.total && anomalyReport.total > 0 ? '#ef4444' : '#10b981'}
        />
        <MetricCard
          icon="🌐"
          label="Services Tracked"
          value={serviceHealth?.total_services ?? metrics?.services_tracked ?? 0}
          color="#8b5cf6"
        />
        <MetricCard
          icon="⚡"
          label="Processing Rate"
          value="N/A"
          color="#94a3b8"
        />
      </div>

      {/* ── Middle Section: Latency & Service Health Map ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Dynamic Service Health Map */}
        <div className="cm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
                Deterministic Service Health Map
              </div>
              <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)' }}>
                Derived in real-time from active DAG events and detected anomalies
              </div>
            </div>
            <button
              className="cm-btn"
              onClick={fetchHealthAndLatency}
              disabled={healthLoading}
              style={{ fontSize: '11px' }}
            >
              ↻ Refresh Health
            </button>
          </div>

          <ServiceHealthMap
            services={serviceHealth?.services || []}
            loading={healthLoading}
            error={healthError}
            onRetry={fetchHealthAndLatency}
          />
        </div>

        {/* Latency & Recent Anomalies Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Latency Distribution Summary */}
          <div className="cm-card">
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '8px' }}>
              Causal Transit Latency Summary
            </div>
            <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginBottom: '16px' }}>
              Real edge transit timings across causal parent-child dependencies
            </div>

            {latencyLoading ? (
              <div className="cm-loading-box">
                <div className="cm-spinner" />
                <span>Computing edge latencies...</span>
              </div>
            ) : latencyData && latencyData.sample_size > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="cm-card-elevated" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>p50 (Median)</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                    {latencyData.p50_ms !== null ? `${latencyData.p50_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card-elevated" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>p95</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
                    {latencyData.p95_ms !== null ? `${latencyData.p95_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card-elevated" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Max</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#ec4899', marginTop: '4px' }}>
                    {latencyData.max_ms !== null ? `${latencyData.max_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 3', fontSize: '11px', color: 'var(--cm-text-muted)', marginTop: '4px' }}>
                  Sample size: {latencyData.sample_size} valid causal edge(s)
                  {latencyData.inversion_edge_count > 0 && ` (${latencyData.inversion_edge_count} time-inversion edges detected)`}
                </div>
              </div>
            ) : (
              <div className="cm-empty-state">
                <h4>No Edge Latencies Available</h4>
                <p>Causal edge timings appear when a multi-node workflow is loaded.</p>
              </div>
            )}
          </div>

          {/* Recent Anomalies Panel */}
          <div className="cm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
                Recent Causal Anomalies
              </div>
              <span className={`cm-badge cm-badge-${anomalyReport?.total ? 'critical' : 'healthy'}`}>
                {anomalyReport?.total ? `${anomalyReport.total} Anomaly` : 'Clean'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginBottom: '12px' }}>
              Cycles, physical clock inversions, and vector clock inconsistencies
            </div>

            {anomalyReport && anomalyReport.anomalies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '170px', overflowY: 'auto' }}>
                {anomalyReport.anomalies.slice(0, 4).map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: 'var(--cm-bg-elevated)',
                      border: '1px solid var(--cm-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: a.severity === 'CRITICAL' ? 'var(--cm-critical)' : 'var(--cm-warning)' }}>
                        {a.anomaly_type}
                      </span>
                      <span style={{ color: 'var(--cm-text-muted)', marginLeft: '8px' }}>
                        {a.source_event_id} {a.target_event_id ? `→ ${a.target_event_id}` : ''}
                      </span>
                    </div>
                    <span className={`cm-badge cm-badge-${a.severity.toLowerCase()}`}>
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cm-empty-state" style={{ padding: '20px' }}>
                <h4>No Anomalies in Current State</h4>
                <p>The active DAG satisfies causal consistency constraints.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Workflow Trace Selector with TRACE-DEMO-001 ───────────────── */}
      <div className="cm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
              Observability Scenarios & Traces
            </div>
            <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)' }}>
              Select a trace to reconstruct causal DAG, inspect clock drift, and evaluate anomalies
            </div>
          </div>
          {/* Prominent TRACE-DEMO-001 Action */}
          <button
            className="cm-btn cm-btn-primary"
            onClick={() => onLoadScenario('TRACE-DEMO-001')}
            disabled={loading}
            style={{ fontWeight: 600, padding: '8px 16px' }}
          >
            ⚡ Load TRACE-DEMO-001
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
          {scenarios.map((sc) => {
            const isCurrent = currentScenario === sc.id || currentScenario === sc.trace_id;
            return (
              <div
                key={sc.id}
                onClick={() => onLoadScenario(sc.id)}
                className={`cm-card ${isCurrent ? 'cm-card-elevated' : ''}`}
                style={{
                  cursor: 'pointer',
                  border: isCurrent ? '1px solid var(--cm-accent)' : '1px solid var(--cm-border-subtle)',
                  boxShadow: isCurrent ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="cm-badge cm-badge-info">
                    {sc.trace_id || sc.pattern}
                  </span>
                  {isCurrent && (
                    <span style={{ fontSize: '10px', color: 'var(--cm-success)', fontWeight: 700 }}>
                      ● Active
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginTop: '8px' }}>
                  {sc.name}
                </div>

                <p style={{ fontSize: '11px', color: 'var(--cm-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                  {sc.description}
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', fontSize: '10px', color: 'var(--cm-text-muted)' }}>
                  <span>~{sc.expected_nodes} nodes</span>
                  <span>•</span>
                  <span>{sc.services?.length || 4} services</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Event Feed & Quick Navigation ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <div className="cm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
              Ingested Event Stream
            </div>
            <span style={{ fontSize: '11px', color: 'var(--cm-text-muted)' }}>
              {displayEvents.length} events
            </span>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {displayEvents.length === 0 ? (
              <div className="cm-empty-state">
                <p>No events in stream. Load a scenario above.</p>
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
                    borderRadius: '4px',
                    background: 'var(--cm-bg-elevated)',
                    border: '1px solid var(--cm-border-subtle)',
                    borderLeft: `3px solid ${getServiceColor(e.service_id)}`,
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--cm-text-primary)' }}>{e.event_type}</span>
                    <span style={{ color: 'var(--cm-text-muted)', fontSize: '10px' }}>
                      ({getServiceLabel(e.service_id)})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--cm-accent)', fontFamily: 'monospace' }}>
                      L{e.lamport_ts}
                    </span>
                    <span style={{ color: 'var(--cm-text-muted)', fontSize: '10px' }}>
                      {e.region || e.metadata?.region || 'local'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cm-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '8px' }}>
              Causal Graph & Distributed Analysis
            </div>
            <div style={{ color: 'var(--cm-text-secondary)', fontSize: '12px', lineHeight: 1.6 }}>
              ChronosMesh processes out-of-order event streams across distributed cloud services,
              computing happens-before relations and transitive reductions to reconstruct true causality.
              <ul style={{ paddingLeft: '16px', margin: '8px 0', fontSize: '11px', color: 'var(--cm-text-muted)' }}>
                <li><strong>Vector Clocks:</strong> Disambiguate causal order vs genuine concurrency</li>
                <li><strong>Hybrid Logical Clocks:</strong> Bound physical clock skew across regions</li>
                <li><strong>Causal Anomaly Detection:</strong> Detect cycles, inversions, and duplicates</li>
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--cm-border-subtle)' }}>
            <button
              className="cm-btn cm-btn-primary"
              style={{ width: '100%', padding: '10px' }}
              onClick={onNavigateToDag}
              disabled={loading || !currentScenario}
            >
              Explore Reconstructed Causal Graph →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
