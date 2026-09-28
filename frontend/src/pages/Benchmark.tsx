import React, { useState, useEffect } from 'react';
import { BenchmarkPanel } from '../components/BenchmarkPanel';
import { BenchmarkReport } from '../types';
import api from '../services/api';

export const BenchmarkPage: React.FC = () => {
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmark = async (packetLoss: number = 0, clockDrift: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBenchmark(packetLoss, clockDrift);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to execute clock benchmark');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark(0, 0);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '13px' }}>
          {error}
        </div>
      )}
      <BenchmarkPanel
        report={report}
        loading={loading}
        onRunBenchmark={(loss, drift) => fetchBenchmark(loss, drift)}
      />
    </div>
  );
};
