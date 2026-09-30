import React, { useState, useMemo } from 'react';
import { Anomaly } from '../types';
import { SEVERITY_COLORS } from '../utils/colors';

interface AnomalyPanelProps {
  anomalies: Anomaly[];
  total: number;
  severitySummary?: {
    CRITICAL: number;
    WARNING: number;
    INFO: number;
  };
  loading?: boolean;
  error?: string | null;
  onSelectAnomalyEvent?: (eventId: string) => void;
}

export const AnomalyPanel: React.FC<AnomalyPanelProps> = ({
  anomalies,
  total,
  severitySummary,
  loading = false,
  error = null,
  onSelectAnomalyEvent,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const filtered = useMemo(() => {
    return anomalies.filter((a) => {
      const matchSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.anomaly_type.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.source_event_id.toLowerCase().includes(q) ||
        (a.target_event_id && a.target_event_id.toLowerCase().includes(q));
      return matchSev && matchSearch;
    });
  }, [anomalies, filterSeverity, searchQuery]);

  if (loading) {
    return (
      <div className="cm-card">
        <div className="cm-loading-box">
          <div className="cm-spinner" />
          <span>Analyzing causal graph for anomalies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cm-card">
        <div className="cm-error-box">
          <span>Failed to load anomalies: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
            Causal Anomaly Center
          </div>
          <div style={{ fontSize: '11px', color: 'var(--cm-text-muted)', marginTop: '2px' }}>
            Detected causality violations, cycles, clock drift, and temporal inversions
          </div>
        </div>

        {/* Severity Summary Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`cm-badge ${filterSeverity === 'ALL' ? 'cm-badge-info' : 'cm-badge-unavailable'}`}
            style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => setFilterSeverity('ALL')}
          >
            All ({total})
          </button>
          <button
            className={`cm-badge ${filterSeverity === 'CRITICAL' ? 'cm-badge-critical' : 'cm-badge-unavailable'}`}
            style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => setFilterSeverity('CRITICAL')}
          >
            Critical ({severitySummary?.CRITICAL || 0})
          </button>
          <button
            className={`cm-badge ${filterSeverity === 'WARNING' ? 'cm-badge-warning' : 'cm-badge-unavailable'}`}
            style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => setFilterSeverity('WARNING')}
          >
            Warning ({severitySummary?.WARNING || 0})
          </button>
          <button
            className={`cm-badge ${filterSeverity === 'INFO' ? 'cm-badge-info' : 'cm-badge-unavailable'}`}
            style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => setFilterSeverity('INFO')}
          >
            Info ({severitySummary?.INFO || 0})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search by anomaly type, description, or event ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--cm-bg-elevated)',
            border: '1px solid var(--cm-border-default)',
            color: 'var(--cm-text-primary)',
            borderRadius: 'var(--cm-radius-sm)',
            padding: '6px 12px',
            fontSize: '12px',
          }}
        />
        {searchQuery && (
          <button className="cm-btn" onClick={() => setSearchQuery('')}>
            Clear
          </button>
        )}
      </div>

      {/* Anomaly List & Details Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedAnomaly ? '1.3fr 1fr' : '1fr', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div className="cm-empty-state">
            <h4>No Anomalies Match Filter</h4>
            <p>
              {anomalies.length === 0
                ? 'All loaded events satisfy happens-before invariants.'
                : 'No anomalies found matching the current search criteria.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {filtered.map((anom, idx) => {
              const sev = SEVERITY_COLORS[anom.severity] || SEVERITY_COLORS.INFO;
              const isSelected = selectedAnomaly === anom;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedAnomaly(anom)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--cm-bg-surface-hover)' : 'var(--cm-bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--cm-accent)' : 'var(--cm-border-subtle)'}`,
                    borderLeft: `4px solid ${sev.text}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px' }}>{sev.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
                        {anom.anomaly_type}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--cm-text-secondary)', marginTop: '2px' }}>
                        {anom.description}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', marginTop: '4px' }}>
                        Source: <span style={{ color: 'var(--cm-accent)', fontFamily: 'monospace' }}>{anom.source_event_id}</span>
                        {anom.target_event_id && (
                          <span> → Target: <span style={{ color: 'var(--cm-accent)', fontFamily: 'monospace' }}>{anom.target_event_id}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`cm-badge cm-badge-${anom.severity.toLowerCase()}`}>
                    {anom.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Details Drawer */}
        {selectedAnomaly && (
          <div className="cm-card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cm-text-primary)' }}>
                Anomaly Diagnosis
              </div>
              <button
                className="cm-btn"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                onClick={() => setSelectedAnomaly(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--cm-text-secondary)', lineHeight: 1.5 }}>
              <div><strong>Type:</strong> <span style={{ color: 'var(--cm-text-primary)' }}>{selectedAnomaly.anomaly_type}</span></div>
              <div style={{ marginTop: '4px' }}><strong>Severity:</strong> <span className={`cm-badge cm-badge-${selectedAnomaly.severity.toLowerCase()}`}>{selectedAnomaly.severity}</span></div>
              <div style={{ marginTop: '4px' }}><strong>Explanation:</strong> {selectedAnomaly.description}</div>
              <div style={{ marginTop: '4px' }}><strong>Source Event:</strong> <code>{selectedAnomaly.source_event_id}</code></div>
              {selectedAnomaly.target_event_id && (
                <div style={{ marginTop: '4px' }}><strong>Target Event:</strong> <code>{selectedAnomaly.target_event_id}</code></div>
              )}
            </div>

            {selectedAnomaly.details && Object.keys(selectedAnomaly.details).length > 0 && (
              <div style={{ background: 'var(--cm-bg-base)', padding: '10px', borderRadius: '4px', border: '1px solid var(--cm-border-subtle)', fontSize: '11px' }}>
                <div style={{ fontWeight: 600, color: 'var(--cm-text-muted)', marginBottom: '4px' }}>Technical Details:</div>
                <pre style={{ margin: 0, color: 'var(--cm-text-secondary)', overflowX: 'auto', fontFamily: 'monospace' }}>
                  {JSON.stringify(selectedAnomaly.details, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              {onSelectAnomalyEvent && selectedAnomaly.source_event_id && (
                <button
                  className="cm-btn cm-btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => onSelectAnomalyEvent(selectedAnomaly.source_event_id)}
                >
                  Inspect in Causal Graph →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
