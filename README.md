# ChronosMesh
> **Distributed Causal Reconstruction and Observability for Multi-Region Microservices**

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)]()
[![Node.js 20+](https://img.shields.io/badge/node.js-20%2B-green.svg)]()
[![Tests](https://img.shields.io/badge/tests-204%20Python%20%7C%204%20Vitest%20passing-brightgreen.svg)]()
[![Docker](https://img.shields.io/badge/docker-compose%20ready-blue.svg)]()
[![Observability](https://img.shields.io/badge/prometheus%20%26%20grafana-integrated-orange.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

---

## 1. Problem Statement
Modern microservice architectures span multiple cloud regions and availability zones. Under variable network transmission delays, asynchronous message broker queues, and unavoidable physical clock drift (NTP desynchronization), events frequently arrive at monitoring sinks **completely out of order**:

```text
What the monitoring sink receives (Arrival Order):    The TRUE Causal Ordering (Happens-Before):

  1. E1: ORDER_CREATED (Mumbai)                               E1: ORDER_CREATED
  2. E3: PAYMENT_COMPLETED (Singapore)                         /              \
  3. E2: PAYMENT_STARTED (Singapore) [LATE!]           E2: PAYMENT_STARTED    E4: INVENTORY_RESERVED
  4. E5: SHIPMENT_CREATED (Singapore)                          |                      |
  5. E4: INVENTORY_RESERVED (GCP Mumbai) [LATE!]      E3: PAYMENT_COMPLETED           |
  6. E6: NOTIFICATION_SENT (Mumbai)                            \                      /
                                                                E5: SHIPMENT_CREATED
                                                                         |
                                                                E6: NOTIFICATION_SENT
```

Relying on wall-clock timestamps (`timestamp_ms`) to diagnose incidents causes phantom causal inversions, false alerts, and misleading trace graphs. ChronosMesh reconstructs the **true happens-before causal execution graph**, answering **"what actually caused what"** regardless of physical arrival time or clock skew.

---

## 2. Project Objectives
1. **Mathematical Causal Ordering:** Implement Lamport, Vector, and Hybrid Logical Clocks (HLC) to enforce strict partial ordering and detect true concurrency ($E_a \parallel E_b$).
2. **Distributed Stream Processing:** Ingest unordered streams via Kafka/streaming interfaces, apply event-time watermarking with tumbling reordering windows in a Flink-compatible event-time pipeline, and persist causal topologies to Neo4j.
3. **Anomaly & Root-Cause Detection:** Detect clock drift, cycle violations, and causal latency spikes with TrueTime-style confidence scoring ($P(A \to B)$) and automated root-cause graph traversal.
4. **Interactive Observability & Simulation:** Deliver a real-time React 18 + TypeScript + D3.js causal DAG dashboard with live Server-Sent Events (SSE), what-if forward fault simulation, and Prometheus/Grafana operations telemetry.

---

## 3. Key Features
- **Logical Clock Strategies:** Lamport Logical Clocks, Vector Clocks, and Hybrid Logical Clocks (HLC) with swappable runtime strategies.
- **Incremental Transitive Reduction:** Localized neighbor pruning reducing DAG construction complexity from $O(N^3)$ to $O(k \cdot |V|)$, delivering a **3.1x speedup at 1,000 events**.
- **Anomaly Detection:** Identifies retrograde clocks, causal inversions, cycles, orphan events, and TrueTime confidence drops.
- **Root-Cause Analysis:** Automated backward graph traversal isolating origin failure nodes.
- **What-If Forward Replay:** Forward graph simulator computing blast radius % and invalidated downstream events.
- **Full Pipeline Architecture:** Mock Microservices $\to$ Kafka Streaming $\to$ Event-Time Flink Processing $\to$ Neo4j $\to$ FastAPI $\to$ SSE $\to$ React 18 / D3.
- **Production Hardening:** Lightweight RBAC (`viewer`, `operator`, `admin`), JWT authentication, strict CORS whitelist, HTTP security headers, and structured JSON logs.
- **Telemetry & Monitoring:** Built-in Prometheus `/metrics` exporter, Grafana dashboard configs, and documented alerting thresholds.

---

## 4. End-to-End System Architecture

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CHRONOSMESH PIPELINE                                        │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                   │
│   [ Microservices ] ──▶ [ Kafka Streaming ] ──▶ [ Flink Pipeline ] ──▶ [ Causal Engine & Neo4j ]  │
│   (Mumbai / Singapore)   Topic: events.raw        Event-Time Windows     DAG Transitive Reduction │
│                                                                                 │                 │
│                                                                                 ▼                 │
│   [ React 18 + D3 UI ] ◀── [ Server-Sent Events ] ◀── [ FastAPI REST & GraphQL ] ◀┘              │
│   Interactive Causal DAG   Real-time Push Stream      JWT & RBAC Gatekeeper                       │
│                                                                                                   │
│   [ Grafana Dashboard ] ◀── [ Prometheus Scraper ] ◀── /metrics & Structured JSON Logs            │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Canonical Developer & Demo Setup

### One-Click Canonical Startup Path

```bash
# 1. Start the FastAPI Backend & Integrated Production Frontend
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
# (Or on Windows: run .\start_guru.bat)

# 2. Open the Application in your Browser
# Production React Application: http://localhost:8000
# Interactive API Swagger Docs : http://localhost:8000/api/docs
# GraphQL Endpoint             : http://localhost:8000/graphql
# Prometheus Scrape Telemetry  : http://localhost:8000/metrics

# 3. Optional: Frontend Hot-Reload Development Server
cd frontend
npm run dev
# Vite Dev Server runs at: http://localhost:3000 (proxied to API on port 8000)
```

---

## 6. Deterministic Demo Sequence (`TRACE-DEMO-001`)

1. Open `http://localhost:8000` (or `http://localhost:3000` in dev mode) in your browser.
2. Sign in with default credentials:
   - **Admin:** `guru` / `chronosmesh` (Full configuration, scenario triggering, and resets)
   - **Analyst/Operator:** `analyst` / `analyst123` (Analysis, what-if, benchmarks)
   - **Viewer:** `demo` / `demo123` (Read-only view)
3. Under **Scenarios**, select **Deterministic E-Commerce Order Flow (`TRACE-DEMO-001`)**.
4. Observe the dynamic results:
   - **Raw Arrival Order:** Events arrive inverted due to network delay:
     `ORDER_CREATED -> PAYMENT_COMPLETED -> PAYMENT_STARTED -> SHIPMENT_CREATED -> INVENTORY_RESERVED -> NOTIFICATION_SENT`
   - **Reconstructed Causal DAG:** ChronosMesh mathematically reorders them:
     `ORDER_CREATED -> PAYMENT_STARTED -> PAYMENT_COMPLETED -> INVENTORY_RESERVED -> SHIPMENT_CREATED -> NOTIFICATION_SENT`
   - **Concurrency:** `payment-svc` and `inventory-svc` execute concurrently ($E_2 \parallel E_4$).
   - **Anomalies Panel:** Inspect cross-region clock drift and TrueTime confidence scores.
   - **What-If Simulation:** Invalidate an event to view downstream cascade blast radius and graph diffs.

---

## 7. Local Implementation vs. Cloud Deployment Status

ChronosMesh clearly distinguishes between components **locally implemented & verified** and **cloud deployment architectures**:

| Subsystem | Local Environment Status | Cloud Architecture Target |
|---|---|---|
| **Clock Algorithms** | ✅ Fully Implemented & Tested (Lamport, Vector, HLC) | Universal / Cloud-Agnostic |
| **Causal Engine** | ✅ Fully Implemented (Happens-Before, Concurrency, DAG) | Universal / Cloud-Agnostic |
| **Kafka Ingestion** | ✅ Local Verified with Transparent In-Memory Fallback | AWS MSK Cluster (`docs/CLOUD_DEPLOYMENT.md`) |
| **Stream Processing** | ✅ Python Flink-Compatible Event-Time Watermarking | Apache Flink on EMR / Managed Flink |
| **Graph Persistence** | ✅ Neo4j Driver Implemented with In-Memory Fallback | Neo4j Aura / Amazon Neptune |
| **Audit Store** | ✅ TimescaleDB Storage Model (Tested via In-Memory SQLite) | TimescaleDB Cloud / AWS RDS PostgreSQL |
| **Metadata Store** | ✅ PostgreSQL Metadata Model (Tested via In-Memory SQLite) | Amazon DynamoDB / PostgreSQL |
| **Lambda Enrichment** | ✅ Serverless Event Decorator Handler Tested Locally | AWS Lambda Event Source Mapping |
| **gRPC Interface** | ✅ Client SDK & In-Memory Transport Implemented | Containerized gRPC Server on Port 50051 |
| **Serialization** | ✅ Protobuf (`.proto`) & Avro (`.avsc`) Defined; Local uses JSON | Confluent Schema Registry |
| **Frontend** | ✅ React 18 + TypeScript + Vite + D3.js (Built & Served) | S3 + CloudFront / Container Static Hosting |
| **Kubernetes (K8s)** | ✅ Manifests Validated (`deployment.yaml`, `service.yaml`, `hpa.yaml`) | AWS EKS / GCP GKE Cluster Deployment |
| **Observability** | ✅ Prometheus `/metrics` Scraped & Alert Rules Configured | Managed Prometheus & Grafana Cloud |

---

## 8. Verification & Test Matrix

ChronosMesh maintains an automated regression suite across backend and frontend:

```bash
# Run all Python tests (from repository root)
python -m pytest tests/ -v
# Result: 204 passed, 1 warning (100% green in 26.59s)

# Run Frontend Vitest tests (from frontend/)
cd frontend && npm run test
# Result: 4 passed (100% green in 1.31s)

# Production Frontend Build (from frontend/)
cd frontend && npm run build
# Result: 619 modules transformed -> dist/index.html (1.20 kB), dist/assets/ (289 kB)
```

---

## 9. Performance Benchmarks

| Metric | Measured Value | Benchmark Scope & Measurement Boundary |
| :--- | :--- | :--- |
| **Generation Rate** | **3,602.3 events/sec** | In-memory synthetic event generation (`load_test.py`) |
| **Stream Processing Rate** | **211.7 events/sec** | Event-time windowed pipeline with out-of-order buffering |
| **Persistence Rate** | **4,044.5 events/sec** | In-memory property graph node/edge batch ingestion |
| **Generation Latency (p50)**| **0.518 ms** | In-memory event creation & enqueue median latency |
| **Pipeline Latency (p95)**| **35.349 ms** | End-to-end stream window flush interval |
| **Pipeline Latency (p99)**| **62.222 ms** | Tail latency under burst queueing |
| **Causal Reduction Speedup**| **3.1x faster** (at 1,000 ev)| Localized incremental pruning (288.58ms) vs global (890.22ms) |
| **Event Loss / Duplicates**| **0 / 0** | Zero dropped events; idempotent graph writes |

---

## 10. Security Architecture
- **Authentication:** JWT tokens signed with HMAC-SHA256 (`HS256`) with configurable expiration.
- **Role-Based Access Control:** Strict 3-tier hierarchy (`viewer`, `operator`, `admin`).
- **CORS Whitelist:** Explicit local origins (`http://localhost:3000`, `http://localhost:8000`, `http://localhost:5173`); wildcard `*` forbidden.
- **Security Headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Credential Protection:** Automatic log masking of secrets; `.env` excluded from version control.

---

## 11. Known Limitations
1. **External Services Fallback:** When external Kafka brokers or Neo4j databases are offline, ChronosMesh automatically falls back to in-memory queues and in-memory graph stores so that demo execution is never blocked.
2. **Cloud Infrastructure Blueprint:** AWS MSK, Managed Flink, and Neo4j Aura are documented as cloud deployment blueprints in `docs/CLOUD_DEPLOYMENT.md` for production cloud rollout without incurring cloud hosting costs during local academic review.

---

## 12. Team Contributions & Division of Responsibility

- **B. Guru Sai Prasad Reddy:**
  - Full-Stack Integration, FastAPI Architecture, REST & GraphQL Endpoints, and SSE Stream Subsystem.
  - React 18 + TypeScript + Vite Dashboard, D3.js Causal DAG Visualization, Dual Arrival vs Causal Timeline.
  - Security Hardening (JWT, RBAC, CORS, HTTP Headers), Prometheus Metrics & Grafana Dashboard.
  - DevOps, Docker Compose Hardening, GitHub Actions CI/CD, Documentation Package, End-to-End Integration.

- **Akshith:**
  - Stage 1 Core Algorithm Engine: Lamport Logical Clocks, Vector Clocks, Hybrid Logical Clocks (HLC).
  - Causal Reconstruction, Happens-Before Detectors, Concurrency Analysis, and Initial Transitive Reduction.
  - TrueTime Confidence Scoring, Anomaly Detection Foundation, Root-Cause Tracing, and What-If Simulator.

- **Surya:**
  - Backend Infrastructure, Event Ingestion (Kafka/AWS MSK design), Avro & Protobuf Schemas.
  - Multi-Region Mock Microservice Cluster (AWS & GCP Mumbai/Singapore with injected skew).
  - Storage Layer Design: Neo4j Causal DAG, TimescaleDB Audit Trail Model, PostgreSQL Metadata Model.
  - Chaos Engineering Fault Injection Suite, Load Testing Script, and Kubernetes Manifests.
