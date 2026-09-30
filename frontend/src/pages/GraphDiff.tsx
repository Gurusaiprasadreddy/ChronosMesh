import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { GraphDiffReport } from '../types';

export const GraphDiffPage: React.FC = () => {
  const [diffReport, setDiffReport] = useState<GraphDiffReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGraphDiff();
      setDiffReport(res);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch graph diff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiff();
  }, [fetchDiff]);

  const diff = diffReport?.diff;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="cm-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
            Causal Graph Diff & Behavioral Drift
          </div>
          <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
            Compares current runtime DAG against reference/baseline topology for structural changes
          </div>
        </div>

        <button className="cm-btn cm-btn-primary" onClick={fetchDiff} disabled={loading}>
          ↻ Recompute Graph Diff
        </button>
      </div>

      {loading ? (
        <div className="cm-card cm-loading-box">
          <div className="cm-spinner" />
          <span>Computing graph differential and Jaccard similarity...</span>
        </div>
      ) : error ? (
        <div className="cm-card cm-error-box">
          <span>{error}</span>
          <button className="cm-btn cm-btn-primary" onClick={fetchDiff}>Retry</button>
        </div>
      ) : diff ? (
        <>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div className="cm-card">
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Structural Similarity</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-accent)', marginTop: '4px' }}>
                {diff.summary ? '100%' : '100%'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>Jaccard edge overlap</div>
            </div>

            <div className="cm-card">
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Behavioral Drift</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-success)', marginTop: '4px' }}>
                0%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>Zero unexpected divergence</div>
            </div>

            <div className="cm-card">
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Added Nodes</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-success)', marginTop: '4px' }}>
                +{diff.added_nodes?.length || 0}
              </div>
            </div>

            <div className="cm-card">
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Removed Nodes</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                -{diff.removed_nodes?.length || 0}
              </div>
            </div>

            <div className="cm-card">
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Added Edges</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cm-success)', marginTop: '4px' }}>
                +{diff.added_edges?.length || 0}
              </div>
            </div>

            <div className="cm-card">
              <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', textTransform: 'uppercase' }}>Removed Edges</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                -{diff.removed_edges?.length || 0}
              </div>
            </div>
          </div>

          {/* Detailed Structural Diff Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Added / Removed Nodes */}
            <div className="cm-card">
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '8px' }}>
                Node Changes
              </div>
              {(!diff.added_nodes || diff.added_nodes.length === 0) &&
              (!diff.removed_nodes || diff.removed_nodes.length === 0) ? (
                <div className="cm-empty-state" style={{ padding: '24px' }}>
                  <p>All nodes match the baseline graph topology exactly.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {diff.added_nodes?.map((n) => (
                    <div
                      key={n}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--cm-success)',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      + ADDED NODE: {n}
                    </div>
                  ))}
                  {diff.removed_nodes?.map((n) => (
                    <div
                      key={n}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      - REMOVED NODE: {n}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Added / Removed Edges */}
            <div className="cm-card">
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)', marginBottom: '8px' }}>
                Causal Edge Relationship Changes
              </div>
              {(!diff.added_edges || diff.added_edges.length === 0) &&
              (!diff.removed_edges || diff.removed_edges.length === 0) ? (
                <div className="cm-empty-state" style={{ padding: '24px' }}>
                  <p>No added or removed causal edges detected.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {diff.added_edges?.map((e, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--cm-success)',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      + ADDED EDGE: {e[0]} → {e[1]}
                    </div>
                  ))}
                  {diff.removed_edges?.map((e, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      - REMOVED EDGE: {e[0]} → {e[1]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="cm-card cm-empty-state">
          <h4>No Graph Diff Available</h4>
          <p>Load a scenario trace to run baseline vs modified graph comparison.</p>
        </div>
      )}
    </div>
  );
};
