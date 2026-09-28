import React, { useState } from 'react';
import { WhatIfPanel } from '../components/WhatIfPanel';
import { CausalGraph } from '../components/CausalGraph';
import { WhatIfResult, DAGData, DAGNode } from '../types';

interface WhatIfPageProps {
  dagData: DAGData | null;
  nodes: DAGNode[];
  onRunWhatIfSimulation: (eventId: string) => Promise<WhatIfResult>;
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({
  dagData,
  nodes,
  onRunWhatIfSimulation,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunSimulation = async (eventId: string) => {
    setLoading(true);
    try {
      const res = await onRunWhatIfSimulation(eventId);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <WhatIfPanel
        nodes={nodes}
        selectedEventId={selectedEventId}
        result={result}
        loading={loading}
        onSelectEvent={(id) => setSelectedEventId(id)}
        onRunSimulation={handleRunSimulation}
      />

      {dagData && (
        <div className="card" style={{ height: '420px', padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
            <div className="card-title">Blast Radius Causal Overlay</div>
          </div>
          <CausalGraph
            dagData={dagData}
            removedNodeId={result?.removed_event_id}
            invalidatedNodeIds={result?.invalidated_events || []}
            onSelectNode={() => {}}
          />
        </div>
      )}
    </div>
  );
};
