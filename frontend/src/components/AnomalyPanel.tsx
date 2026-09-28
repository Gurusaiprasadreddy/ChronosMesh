import React from 'react';
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
  onSelectAnomalyEvent?: (eventId: string) => void;
}

export const AnomalyPanel: React.FC<AnomalyPanelProps> = ({
  anomalies,
  total,
  severitySummary,
  onSelectAnomalyEvent,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Causal Anomaly Center</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Detected causality violations, clock drift, and time inversions
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {severitySummary && (
            <>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                🔴 {severitySummary.CRITICAL} Critical
              </span>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                🟠 {severitySummary.WARNING} Warning
              </span>
            </>
          )}
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>
            No Causal Anomalies Detected
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            All events satisfy happens-before constraints and physical timestamp invariants.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {anomalies.map((anom, idx) => {
            const sev = SEVERITY_COLORS[anom.severity] || SEVERITY_COLORS.INFO;
            const targetId = anom.target_event_id || anom.source_event_id;

            return (
              <div
                key={idx}
                onClick={() => targetId && onSelectAnomalyEvent && onSelectAnomalyEvent(targetId)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#0d1526',
                  border: `1px solid ${sev.border}`,
                  borderLeft: `4px solid ${sev.text}`,
                  cursor: targetId ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{sev.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {anom.anomaly_type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {anom.description}
                    </div>
                    {anom.details && (
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '4px' }}>
                        {JSON.stringify(anom.details)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: sev.bg,
                      color: sev.text,
                    }}
                  >
                    {anom.severity}
                  </span>
                  {targetId && (
                    <div style={{ fontSize: '10px', color: '#00d4ff', marginTop: '4px' }}>
                      View Event →
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
