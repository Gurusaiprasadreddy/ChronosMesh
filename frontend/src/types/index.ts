/**
 * ChronosMesh — TypeScript Type Definitions
 * Directly matching Stage 2 Schemas (EVENT_SCHEMA, CAUSAL_DAG_SCHEMA, API_CONTRACT).
 * Author: Guru Sai Prasad Reddy
 */

export interface EventMetadata {
  trace_id?: string;
  span_id?: string;
  parent_span_id?: string;
  region?: string;
  zone?: string;
  cloud_provider?: string;
  clock_uncertainty_ms?: number;
  environment?: string;
  [key: string]: any;
}

export interface Event {
  event_id: string;
  service_id: string;
  event_type: string;
  timestamp_ms: number;
  lamport_ts: number;
  vector_clock: Record<string, number>;
  parent_event_ids: string[];
  payload: Record<string, any>;
  metadata: EventMetadata;
  arrival_time_ms?: number;
  region?: string;
}

export interface DAGNode {
  id: string;
  service_id: string;
  event_type: string;
  timestamp_ms: number;
  lamport_ts: number;
  vector_clock: Record<string, number>;
  region?: string;
  clock_uncertainty_ms?: number;
  parent_event_ids: string[];
}

export interface DAGEdge {
  source: string;
  target: string;
  explicit: boolean;
  confidence?: number;
  method?: string;
}

export interface DAGData {
  nodes: DAGNode[];
  edges: DAGEdge[];
  topological_order: string[];
  roots: string[];
  leaves: string[];
}

export interface Anomaly {
  anomaly_type: 'CYCLE' | 'TIME_INVERSION' | 'DUPLICATE_EVENT' | 'CLOCK_DRIFT' | 'CONCURRENT_MUTATION';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  source_event_id?: string;
  target_event_id?: string;
  description: string;
  details?: Record<string, any>;
}

export interface AnomalyReport {
  anomalies: Anomaly[];
  total: number;
  severity_summary: {
    CRITICAL: number;
    WARNING: number;
    INFO: number;
  };
}

export interface RootCauseResult {
  failure_event_id: string;
  root_causes: Array<{
    event_id: string;
    service_id?: string;
    event_type?: string;
    depth: number;
    path: string[];
    confidence: number;
  }>;
  trace_paths: string[][];
  critical_path: string[];
  root_cause_count: number;
}

export interface WhatIfResult {
  removed_event_id: string;
  blast_radius_pct: number;
  cascade_depth: number;
  invalidated_events: string[];
  surviving_events: string[];
  affected_services: string[];
  invalidated_count: number;
}

export interface ClockBenchmarkResult {
  strategy: 'vector_clock' | 'lamport_clock' | 'physical_time';
  accuracy_pct: number;
  memory_kb: number;
  computation_time_ms: number;
  correct_orderings: number;
  total_orderings: number;
  false_positives: number;
  false_negatives: number;
}

export interface BenchmarkReport {
  parameters: {
    packet_loss_pct: number;
    clock_drift_ms: number;
    event_count: number;
  };
  results: ClockBenchmarkResult[];
  winner: string;
}

export interface ConfidenceReport {
  edge_scores: Array<{
    source: string;
    target: string;
    confidence: number;
    method: string;
    uncertainty_ms: number;
  }>;
  low_confidence_edges: Array<{
    source: string;
    target: string;
    confidence: number;
  }>;
  average_confidence: number;
}

export interface Scenario {
  id: string;
  trace_id: string;
  name: string;
  description: string;
  pattern: string;
  expected_nodes: number;
  services: string[];
}

export interface User {
  username: string;
  full_name: string;
  email?: string;
  role: 'admin' | 'viewer';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SystemMetrics {
  event_count: number;
  dag_nodes: number;
  dag_edges: number;
  services_tracked: number;
  current_scenario: string | null;
  api_version: string;
}
