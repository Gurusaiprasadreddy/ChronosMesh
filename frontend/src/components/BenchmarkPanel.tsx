import React, { useState } from 'react';
import { BenchmarkReport, ClockBenchmarkResult } from '../types';

interface BenchmarkPanelProps {
  report: BenchmarkReport | null;
  loading: boolean;
  onRunBenchmark: (packetLossPct: number, clockDriftMs: number) => void;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  report,
  loading,
  onRunBenchmark,
}) => {
  const [packetLoss, setPacketLoss] = useState<number>(0);
  const [clockDrift, setClockDrift] = useState<number>(0);

  const strategyMeta: Record<string, { name: string; color: string; desc: string; icon: string }> = {
    vector_clock: {
      name: 'Vector Clocks',
      color: '#00d4ff',
      desc: 'Full causal precision with concurrent event detection. Memory scales O(N) per node.',
      icon: '📐',
    },
    lamport_clock: {
      name: 'Lamport Clocks',
      color: '#8b5cf6',
      desc: 'Compact integer counter providing total causal order, but cannot distinguish concurrency.',
      icon: '⏱',
    },
    physical_time: {
      name: 'Physical Clock / NTP',
      color: '#f59e0b',
      desc: 'Wall-clock timestamps susceptible to network jitter, drift, and time inversions.',
      icon: '⏰',
    },
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Clock Strategy Comparison & Benchmark</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Empirical benchmark of Lamport vs Vector vs Physical Clocks under simulated network degradation
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onRunBenchmark(packetLoss, clockDrift)}
          disabled={loading}
        >
          {loading ? 'Benchmarking…' : '🚀 Run Benchmark'}
        </button>
      </div>

      {/* Network Degradation Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#0d1526', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
            <span>Simulated Packet Loss:</span>
            <span style={{ fontWeight: 700, color: '#ef4444' }}>{packetLoss}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={packetLoss}
            onChange={(e) => setPacketLoss(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#ef4444' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
            <span>Simulated Clock Drift:</span>
            <span style={{ fontWeight: 700, color: '#f59e0b' }}>{clockDrift} ms</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            step={10}
            value={clockDrift}
            onChange={(e) => setClockDrift(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>
      </div>

      {/* Strategy Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {report.results.map((res: ClockBenchmarkResult) => {
            const meta = strategyMeta[res.strategy] || {
              name: res.strategy,
              color: '#94a3b8',
              desc: '',
              icon: '📊',
            };
            const isWinner = res.strategy === report.winner;

            return (
              <div
                key={res.strategy}
                style={{
                  background: '#0d1526',
                  borderRadius: '10px',
                  padding: '16px',
                  border: `1px solid ${isWinner ? meta.color : '#1e293b'}`,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {isWinner && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '12px',
                      background: meta.color,
                      color: '#090d16',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    ★ Top Strategy
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: meta.color }}>
                      {meta.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{meta.desc}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Reconstruction Accuracy:</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: meta.color }}>
                      {res.accuracy_pct}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${res.accuracy_pct}%`, height: '100%', background: meta.color }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '11px' }}>
                    <div style={{ background: '#131b2e', padding: '6px 8px', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>Memory Footprint:</span>
                      <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{res.memory_kb} KB</div>
                    </div>
                    <div style={{ background: '#131b2e', padding: '6px 8px', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>Compute Latency:</span>
                      <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{res.computation_time_ms} ms</div>
                    </div>
                    <div style={{ background: '#131b2e', padding: '6px 8px', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>Correct Pairs:</span>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>{res.correct_orderings}/{res.total_orderings}</div>
                    </div>
                    <div style={{ background: '#131b2e', padding: '6px 8px', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>Violations / FP:</span>
                      <div style={{ fontWeight: 700, color: res.false_positives > 0 ? '#ef4444' : '#94a3b8' }}>
                        {res.false_positives}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
