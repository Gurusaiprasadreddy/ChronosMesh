import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { LatencyHistogramReport, TopologyStatsReport, EventReplayReport } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latency' | 'topology' | 'replay'>('latency');

  const [latencyData, setLatencyData] = useState<LatencyHistogramReport | null>(null);
  const [latencyLoading, setLatencyLoading] = useState<boolean>(false);
  const [latencyError, setLatencyError] = useState<string | null>(null);

  const [topologyData, setTopologyData] = useState<TopologyStatsReport | null>(null);
  const [topologyLoading, setTopologyLoading] = useState<boolean>(false);
  const [topologyError, setTopologyError] = useState<string | null>(null);

  const [replayData, setReplayData] = useState<EventReplayReport | null>(null);
  const [replayLoading, setReplayLoading] = useState<boolean>(false);
  const [replayError, setReplayError] = useState<string | null>(null);

  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  const fetchLatency = useCallback(async () => {
    setLatencyLoading(true);
    setLatencyError(null);
    try {
      const res = await api.getLatencyHistogram(6);
      setLatencyData(res);
    } catch (e: any) {
      setLatencyError(e.message || 'Failed to fetch latency data');
    } finally {
      setLatencyLoading(false);
    }
  }, []);

  const fetchTopology = useCallback(async () => {
    setTopologyLoading(true);
    setTopologyError(null);
    try {
      const res = await api.getTopologyStats();
      setTopologyData(res);
    } catch (e: any) {
      setTopologyError(e.message || 'Failed to fetch topology stats');
    } finally {
      setTopologyLoading(false);
    }
  }, []);

  const fetchReplay = useCallback(async () => {
    setReplayLoading(true);
    setReplayError(null);
    try {
      const res = await api.getEventReplay();
      setReplayData(res);
      setSelectedLayerIndex(0);
    } catch (e: any) {
      setReplayError(e.message || 'Failed to fetch replay data');
    } finally {
      setReplayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'latency') fetchLatency();
    else if (activeTab === 'topology') fetchTopology();
    else if (activeTab === 'replay') fetchReplay();
  }, [activeTab, fetchLatency, fetchTopology, fetchReplay]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tab Navigation Header */}
      <div className="cm-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`cm-btn ${activeTab === 'latency' ? 'cm-btn-primary' : ''}`}
            onClick={() => setActiveTab('latency')}
          >
            ⏱️ Latency Analysis
          </button>
          <button
            className={`cm-btn ${activeTab === 'topology' ? 'cm-btn-primary' : ''}`}
            onClick={() => setActiveTab('topology')}
          >
            🕸️ Topology Analysis
          </button>
          <button
            className={`cm-btn ${activeTab === 'replay' ? 'cm-btn-primary' : ''}`}
            onClick={() => setActiveTab('replay')}
          >
            ⏯️ Event Replay (Causal Layers)
          </button>
        </div>

        <button
          className="cm-btn"
          onClick={() => {
            if (activeTab === 'latency') fetchLatency();
            else if (activeTab === 'topology') fetchTopology();
            else if (activeTab === 'replay') fetchReplay();
          }}
        >
          ↻ Refresh Analysis
        </button>
      </div>

      {/* ── 1. Latency Tab ──────────────────────────────────────────────── */}
      {activeTab === 'latency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {latencyLoading ? (
            <div className="cm-card cm-loading-box">
              <div className="cm-spinner" />
              <span>Calculating edge latency distribution...</span>
            </div>
          ) : latencyError ? (
            <div className="cm-card cm-error-box">
              <span>{latencyError}</span>
              <button className="cm-btn cm-btn-primary" onClick={fetchLatency}>Retry</button>
            </div>
          ) : latencyData && latencyData.sample_size > 0 ? (
            <>
              {/* Percentile Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>p50 (Median)</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-accent)', marginTop: '6px' }}>
                    {latencyData.p50_ms !== null ? `${latencyData.p50_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>p95</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                    {latencyData.p95_ms !== null ? `${latencyData.p95_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>p99</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
                    {latencyData.p99_ms !== null ? `${latencyData.p99_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Min</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-success)', marginTop: '6px' }}>
                    {latencyData.min_ms !== null ? `${latencyData.min_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Max</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#ec4899', marginTop: '6px' }}>
                    {latencyData.max_ms !== null ? `${latencyData.max_ms} ms` : 'N/A'}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Mean</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-text-primary)', marginTop: '6px' }}>
                    {latencyData.mean_ms !== null ? `${latencyData.mean_ms} ms` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Histogram Bins Visualization */}
              <div className="cm-card">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '4px' }}>
                  Edge Latency Distribution (Histogram)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginBottom: '16px' }}>
                  Distribution of positive edge transit times across {latencyData.sample_size} causal edges
                  {latencyData.inversion_edge_count > 0 && ` (${latencyData.inversion_edge_count} inverted edges excluded)`}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {latencyData.bins.map((bin, i) => {
                    const maxBinCount = Math.max(...latencyData.bins.map((b) => b.count), 1);
                    const pct = Math.round((bin.count / maxBinCount) * 100);

                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                        <div style={{ width: '130px', color: 'var(--cm-text-muted)', fontFamily: 'monospace', textAlign: 'right' }}>
                          {bin.bin_start_ms} – {bin.bin_end_ms} ms
                        </div>
                        <div style={{ flex: 1, background: 'var(--cm-bg-elevated)', height: '24px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <div style={{ width: '50px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
                          {bin.count} edge{bin.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="cm-card cm-empty-state">
              <h4>No Latency Measurements Recorded</h4>
              <p>Load a trace or workflow to calculate causal edge transit latencies.</p>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Topology Tab ─────────────────────────────────────────────── */}
      {activeTab === 'topology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {topologyLoading ? (
            <div className="cm-card cm-loading-box">
              <div className="cm-spinner" />
              <span>Analyzing DAG topology...</span>
            </div>
          ) : topologyError ? (
            <div className="cm-card cm-error-box">
              <span>{topologyError}</span>
              <button className="cm-btn cm-btn-primary" onClick={fetchTopology}>Retry</button>
            </div>
          ) : topologyData && topologyData.node_count > 0 ? (
            <>
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div className="cm-card">
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Node Count</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cm-accent)', marginTop: '4px' }}>
                    {topologyData.node_count}
                  </div>
                </div>
                <div className="cm-card">
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Edge Count</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cm-accent)', marginTop: '4px' }}>
                    {topologyData.edge_count}
                  </div>
                </div>
                <div className="cm-card">
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Graph Density</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cm-text-primary)', marginTop: '4px' }}>
                    {topologyData.density}
                  </div>
                </div>
                <div className="cm-card">
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Coupling Metric</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cm-text-primary)', marginTop: '4px' }}>
                    {topologyData.coupling_metric}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>Avg degree (2E/V)</div>
                </div>
                <div className="cm-card">
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Concurrency Factor</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cm-info)', marginTop: '4px' }}>
                    {Math.round(topologyData.concurrency_ratio * 100)}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
                    {topologyData.concurrency_pairs_count} concurrent pair(s)
                  </div>
                </div>
                <div className="cm-card">
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Weakly Connected</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: topologyData.is_connected ? 'var(--cm-success)' : '#f59e0b', marginTop: '4px' }}>
                    {topologyData.is_connected ? 'Yes' : `${topologyData.connected_components} Comp.`}
                  </div>
                </div>
              </div>

              {/* Longest Causal Path (Critical Path) */}
              <div className="cm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
                    Longest Causal Path (Critical Path)
                  </div>
                  <span className="cm-badge cm-badge-info">
                    Length: {topologyData.longest_causal_path.length} hops
                    {topologyData.longest_causal_path.duration_ms !== null && ` (${topologyData.longest_causal_path.duration_ms} ms)`}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginBottom: '14px' }}>
                  Sequential dependency chain determining the minimum execution latency
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {topologyData.longest_causal_path.path.map((nodeId, idx) => (
                    <React.Fragment key={nodeId}>
                      <span
                        className="cm-badge cm-badge-info"
                        style={{ fontFamily: 'monospace', fontSize: '11px', padding: '6px 10px' }}
                      >
                        {nodeId}
                      </span>
                      {idx < topologyData.longest_causal_path.path.length - 1 && (
                        <span style={{ color: 'var(--cm-text-muted)' }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Roots and Leaves */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="cm-card">
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '8px' }}>
                    Root Events (In-degree = 0)
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {topologyData.root_nodes.map((r) => (
                      <span key={r} className="cm-badge cm-badge-success" style={{ fontFamily: 'monospace' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="cm-card">
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '8px' }}>
                    Leaf Events (Out-degree = 0)
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {topologyData.leaf_nodes.map((l) => (
                      <span key={l} className="cm-badge cm-badge-warning" style={{ fontFamily: 'monospace' }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="cm-card cm-empty-state">
              <h4>No DAG Topology Available</h4>
              <p>Load a trace to analyze graph metrics.</p>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Event Replay (Causal Layers) Tab ─────────────────────────── */}
      {activeTab === 'replay' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {replayLoading ? (
            <div className="cm-card cm-loading-box">
              <div className="cm-spinner" />
              <span>Constructing topological causal replay layers...</span>
            </div>
          ) : replayError ? (
            <div className="cm-card cm-error-box">
              <span>{replayError}</span>
              <button className="cm-btn cm-btn-primary" onClick={fetchReplay}>Retry</button>
            </div>
          ) : replayData && replayData.layers.length > 0 ? (
            <>
              {/* Overview Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Causal Layers</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-accent)', marginTop: '4px' }}>
                    {replayData.total_layers}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Total Events</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-text-primary)', marginTop: '4px' }}>
                    {replayData.total_events}
                  </div>
                </div>
                <div className="cm-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Max Parallelism</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-info)', marginTop: '4px' }}>
                    {replayData.max_parallelism} concurrent
                  </div>
                </div>
              </div>

              {/* Layer Stepper & Concurrent Events */}
              <div className="cm-card">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '4px' }}>
                  Topological Generations Replay
                </div>
                <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginBottom: '14px' }}>
                  Events within the same layer share no happens-before dependency and execute concurrently in parallel.
                </div>

                {/* Layer Badges */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {replayData.layers.map((layer, idx) => (
                    <button
                      key={idx}
                      className={`cm-btn ${selectedLayerIndex === idx ? 'cm-btn-primary' : ''}`}
                      onClick={() => setSelectedLayerIndex(idx)}
                      style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                    >
                      Layer {layer.layer_index} ({layer.concurrent_count} ev)
                    </button>
                  ))}
                </div>

                {/* Active Layer Details */}
                {replayData.layers[selectedLayerIndex] && (
                  <div style={{ marginTop: '16px', background: 'var(--cm-bg-elevated)', borderRadius: '6px', padding: '16px', border: '1px solid var(--cm-border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--cm-text-primary)' }}>
                        Layer {replayData.layers[selectedLayerIndex].layer_index}: {replayData.layers[selectedLayerIndex].concurrent_count} Concurrent Event(s)
                      </span>
                      <span className="cm-badge cm-badge-info">
                        ⚡ Parallel Execution
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                      {replayData.layers[selectedLayerIndex].events.map((evt) => (
                        <div
                          key={evt.event_id}
                          className="cm-card"
                          style={{
                            borderLeft: `4px solid ${getServiceColor(evt.service_id)}`,
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: 'var(--cm-text-primary)', fontSize: '12px' }}>
                              {evt.event_type}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--cm-accent)', fontFamily: 'monospace' }}>
                              L{evt.lamport_ts}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--cm-text-secondary)', marginTop: '4px' }}>
                            Service: {getServiceLabel(evt.service_id)}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                            ID: {evt.event_id}
                          </div>
                          {evt.parents.length > 0 && (
                            <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '4px' }}>
                              Parents: {evt.parents.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cm-card cm-empty-state">
              <h4>No Event Replay Data</h4>
              <p>Load a scenario trace to reconstruct topological generations.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
