# ChronosMesh — Core Algorithm Engine

> **Distributed Causality Reconstruction and Temporal Anomaly Detection for Multi-Cloud Microservices**

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)]()
[![Tests](https://img.shields.io/badge/tests-162%20passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-86%25-green.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

## What Is This?

Microservices across cloud regions emit events that arrive **out of order** due to network latency, clock drift, and async messaging. ChronosMesh ingests these disordered event streams and reconstructs the **true causal execution graph** — answering **"what caused what"** rather than "what arrived when."

### The Problem

```
Cloud receives events in this order:      But the ACTUAL causality was:
                                          
  5. STOCK RESERVED                                    E1 (Order Created)
  4. PAYMENT SUCCESS                                   /              \
  6. SHIPPING START                              E2 (Payment)    E3 (Inventory)
  1. ORDER CREATED                                 |                  |
  3. STOCK CHECK                              E4 (Pay Success)  E5 (Stock Reserved)
  2. PAYMENT START                                  \              /
                                                    E6 (Shipping Start)
Arrival order is NONSENSE.
ChronosMesh reconstructs the TRUTH.
```

### The Solution: This Engine

This repository implements **Akshith's Core Algorithm Engine** — the technical heart of ChronosMesh covering:

1. **Pluggable Clock Systems** — Lamport, Vector, and Hybrid Logical Clocks with a swappable strategy interface
2. **Causal Reconstruction Engine** — Happens-before detection, concurrency analysis, DAG construction with transitive reduction
3. **Advanced Analysis** — Confidence-scored causal edges (TrueTime-style), anomaly detection, root-cause tracing, what-if replay, clock benchmarking, graph diffing
4. **Stream Processing** — Kafka consumer, stateful DAG processor, event windowing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHRONOSMESH CORE ENGINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │  Clock        │   │  Causal           │   │  Advanced      │  │
│  │  Systems      │   │  Reconstruction   │   │  Analysis      │  │
│  │              │   │                  │   │                │  │
│  │  • Lamport   │──▶│  • Happens-Before│──▶│  • Confidence  │  │
│  │  • Vector    │   │  • Concurrency   │   │  • Anomaly     │  │
│  │  • HLC       │   │  • DAG Builder   │   │  • Root Cause  │  │
│  │  • Factory   │   │  • Buffer        │   │  • What-If     │  │
│  │              │   │  • Transitive    │   │  • Benchmark   │  │
│  │              │   │    Reduction     │   │  • Graph Diff  │  │
│  └──────────────┘   └──────────────────┘   └────────────────┘  │
│                                                                 │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │  Event       │   │  Stream           │   │  Examples      │  │
│  │  Model       │   │  Processing       │   │                │  │
│  │              │   │                  │   │  • Reconstruct │  │
│  │  • Event     │──▶│  • Consumer      │   │  • Anomaly     │  │
│  │  • Generator │   │  • Processor     │   │  • What-If     │  │
│  │  • Schemas   │   │  • Windowing     │   │                │  │
│  └──────────────┘   └──────────────────┘   └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ChronosMesh

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install with dev dependencies
pip install -e ".[dev]"
```

### Run the Demos

```bash
# Demo 1: Scrambled events → Reconstructed causal DAG
python examples/demo_reconstruction.py

# Demo 2: Detect causality violations (time inversions, duplicates)
python examples/demo_anomaly_detection.py

# Demo 3: What-if causal replay (blast radius analysis)
python examples/demo_what_if.py
```

### Run the Tests

```bash
# Run all 162 tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=chronosmesh --cov-report=term-missing

# Run specific test categories
pytest tests/unit/ -v              # Unit tests only
pytest tests/integration/ -v       # Integration tests
pytest tests/correctness/ -v       # Correctness validation
```

---

## Core Algorithms Implemented

### 1. Lamport Logical Clocks (`chronosmesh/clocks/lamport.py`)

Scalar counter that establishes a **total order** on events:

```
a → b  ⟹  L(a) < L(b)     (but NOT the converse)
```

- **Tick**: `counter += 1`
- **Send**: Increment, attach counter to message
- **Receive**: `counter = max(local, remote) + 1`
- **Limitation**: Cannot detect true concurrency

### 2. Vector Clocks (`chronosmesh/clocks/vector.py`)

Per-node counter vectors that capture **both causality AND concurrency**:

```
a → b  ⟺  V(a) < V(b)     (element-wise ≤, at least one <)
a ∥ b  ⟺  ¬(V(a) ≤ V(b)) ∧ ¬(V(b) ≤ V(a))
```

This is the **primary clock** for causal reconstruction — it provides bidirectional mapping between timestamps and happens-before.

### 3. Hybrid Logical Clocks (`chronosmesh/clocks/hlc.py`)

Based on [Kulkarni et al. 2014](https://cse.buffalo.edu/tech-reports/2014-04.pdf), HLC combines physical time with logical counters:

```
HLC = (l, c)  where l = max(local_physical, remote_l, local_l)
```

- **O(1) space** (vs O(N) for vector clocks)
- **Bounded drift**: `|l - physical_time| ≤ ε`
- **Clock drift detection**: Raises `ClockDriftError` when `msg_l - local_physical > max_skew`

### 4. Pluggable Clock Strategy (`chronosmesh/clocks/factory.py`)

All three clocks implement the same `ClockStrategy` interface:

```python
from chronosmesh.clocks import ClockFactory

# Swap strategies at runtime
lamport = ClockFactory.create("lamport", "node-1")
vector  = ClockFactory.create("vector",  "node-1")
hlc     = ClockFactory.create("hlc",     "node-1", max_skew_ns=500_000_000)
```

### 5. Causal DAG Construction (`chronosmesh/causality/dag_builder.py`)

Builds a **directed acyclic graph** from out-of-order events:

1. Compare all event pairs using vector clocks
2. Add edges for happens-before relationships
3. Apply **transitive reduction** to get the minimal DAG
4. Supports incremental construction (event-by-event)

### 6. Confidence-Scored Causal Edges (`chronosmesh/analysis/confidence.py`)

TrueTime-style probabilistic ordering using clock uncertainty intervals:

```
P(A before B) = Φ((μ_B - μ_A) / √(σ_A² + σ_B²))
```

Where `σ = ε/3` (3-sigma bound on clock uncertainty).

### 7. What-If Causal Replay (`chronosmesh/analysis/what_if.py`)

"If event X had NOT happened, what downstream events would be invalidated?"

- An event is **invalidated** if ALL its causal parents are removed/invalidated
- An event **survives** if at least one parent survives
- Computes **blast radius** = fraction of events invalidated

---

## Project Structure

```
ChronosMesh/
├── chronosmesh/
│   ├── __init__.py
│   ├── clocks/                       # Clock Systems
│   │   ├── base.py                   #   Abstract ClockStrategy interface
│   │   ├── lamport.py                #   Lamport logical clock
│   │   ├── vector.py                 #   Vector clock
│   │   ├── hlc.py                    #   Hybrid Logical Clock
│   │   └── factory.py                #   Pluggable clock factory
│   ├── events/                       # Event Model
│   │   ├── event.py                  #   Core Event dataclass
│   │   ├── generator.py              #   Event generator + scenario builder
│   │   └── schemas.py                #   Pydantic validation + serialization
│   ├── causality/                    # Causal Reconstruction Engine
│   │   ├── happens_before.py         #   Happens-before relation computation
│   │   ├── concurrency.py            #   Concurrency detection
│   │   ├── dag_builder.py            #   Causal DAG construction (NetworkX)
│   │   ├── buffer.py                 #   Out-of-order event buffering
│   │   └── transitive_reduction.py   #   DAG transitive reduction
│   ├── analysis/                     # Advanced Analysis
│   │   ├── confidence.py             #   TrueTime-style confidence scoring
│   │   ├── anomaly.py                #   Causal anomaly detection
│   │   ├── root_cause.py             #   Root-cause tracing via DAG traversal
│   │   ├── what_if.py                #   What-if causal replay simulation
│   │   ├── benchmarking.py           #   Clock strategy benchmarking
│   │   └── graph_diff.py             #   Causal graph diffing
│   └── stream/                       # Stream Processing
│       ├── consumer.py               #   Kafka + in-memory event consumer
│       ├── processor.py              #   Stateful DAG construction processor
│       └── windowing.py              #   Tumbling/sliding/session windows
├── tests/
│   ├── unit/                         # 18 unit test files (130+ tests)
│   ├── integration/                  # End-to-end + pipeline tests
│   └── correctness/                  # Clock invariant + known graph validation
├── examples/
│   ├── demo_reconstruction.py        # Scrambled → reconstructed DAG
│   ├── demo_anomaly_detection.py     # Detect causality violations
│   └── demo_what_if.py              # What-if blast radius analysis
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## Key Differentiators

| Feature | Description | Why It Matters |
|---------|-------------|---------------|
| **Hybrid Logical Clocks** | HLC instead of plain Lamport clocks | Human-readable ordering + causal correctness |
| **Confidence-Scored Edges** | Probabilistic causal links using uncertainty intervals | Statistical rigor beyond binary happens-before |
| **Causal Anomaly Detection** | Flags impossible orderings as first-class alerts | Observability/security angle |
| **Root-Cause Tracing** | Backward DAG traversal from failure events | Genuine distributed debugging use case |
| **What-If Replay** | "If event X hadn't happened, what breaks?" | Novel feature not in Jaeger/Zipkin |
| **Pluggable Clock Strategy** | Swap Lamport/Vector/HLC and benchmark side-by-side | Research/comparative evaluation |
| **Causal Graph Diffing** | Compare two workflow runs for behavioral drift | Regression testing distributed systems |
| **Transitive Reduction** | Minimal DAG with redundant edges removed | Clean, correct causality visualization |

---

## Usage Examples

### Reconstruct a Causal DAG

```python
from chronosmesh.events.event import Event
from chronosmesh.causality.dag_builder import CausalDAGBuilder

# Events arrive out of order with vector clock metadata
events = [
    Event(event_id="E1", vector_clock={"order": 1}),
    Event(event_id="E2", vector_clock={"order": 1, "payment": 1}),
    Event(event_id="E3", vector_clock={"order": 1, "inventory": 1}),
    Event(event_id="E4", vector_clock={"order": 1, "payment": 2}),
]

builder = CausalDAGBuilder()
builder.build(events)
dag = builder.get_dag()

# Query the DAG
print(builder.topological_order())   # Causal order
print(builder.get_roots())           # Root events
print(builder.get_ancestors("E4"))   # What caused E4?
```

### Detect Anomalies

```python
from chronosmesh.analysis.anomaly import CausalAnomalyDetector

detector = CausalAnomalyDetector(clock_skew_tolerance_ms=50.0)
anomalies = detector.detect_all(dag, events)

for a in anomalies:
    print(f"[{a.severity}] {a.anomaly_type}: {a.description}")
```

### What-If Analysis

```python
from chronosmesh.analysis.what_if import WhatIfSimulator

simulator = WhatIfSimulator()
result = simulator.simulate_removal(dag, "E1")

print(f"Blast radius: {result.blast_radius:.1%}")
print(f"Invalidated: {result.invalidated_events}")
print(f"Affected services: {result.affected_services}")
```

### Compare Clock Strategies

```python
from chronosmesh.clocks import ClockFactory

for strategy in ClockFactory.available_strategies():
    clock = ClockFactory.create(strategy, "node-1")
    ts = clock.tick()
    print(f"{strategy}: {ts}")
```

---

## Testing

```
162 tests passing | 86% code coverage

├── tests/unit/                    # 18 files
│   ├── test_lamport.py            # 15 tests — Lamport clock correctness
│   ├── test_vector.py             # 16 tests — Vector clock + concurrency
│   ├── test_hlc.py                # 17 tests — HLC + drift detection
│   ├── test_clock_factory.py      #  6 tests — Factory pattern
│   ├── test_happens_before.py     #  8 tests — Happens-before detection
│   ├── test_concurrency.py        #  5 tests — Concurrency detection
│   ├── test_dag_builder.py        # 10 tests — DAG construction
│   ├── test_buffer.py             #  7 tests — Event buffering
│   ├── test_transitive_reduction  #  6 tests — DAG reduction
│   ├── test_confidence.py         #  8 tests — Confidence scoring
│   ├── test_anomaly.py            #  6 tests — Anomaly detection
│   ├── test_root_cause.py         #  6 tests — Root cause tracing
│   ├── test_what_if.py            #  7 tests — What-if simulation
│   ├── test_benchmarking.py       #  5 tests — Clock benchmarking
│   ├── test_graph_diff.py         #  8 tests — Graph diffing
│   ├── test_consumer.py           #  6 tests — Event consumer
│   ├── test_processor.py          #  7 tests — Stream processor
│   └── test_windowing.py          #  7 tests — Window strategies
├── tests/integration/             # 2 files
│   ├── test_end_to_end_recon...   # Full Order→Payment→Shipping scenario
│   └── test_stream_pipeline.py    # 20-event pipeline test
└── tests/correctness/             # 2 files
    ├── test_known_graphs.py       # Ground-truth DAG validation
    └── test_clock_invariants.py   # Clock mathematical invariants
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.10+ |
| Graph Engine | NetworkX |
| Validation | Pydantic |
| Numerics | NumPy |
| Event Bus | confluent-kafka (with in-memory fallback) |
| Serialization | Protobuf/JSON |
| Testing | pytest + pytest-cov + pytest-mock |

---

## Academic Context

**Project Title:** *ChronosMesh: Confidence-Aware Causal Reconstruction and Anomaly Detection for Multi-Cloud Microservice Architectures*

**Core Problem:** Distributed systems generate events out of order. ChronosMesh reconstructs the actual causal timeline using logical clocks, vector clocks, and DAG algorithms.

**Key Keywords:** Distributed causality, logical clocks, vector clocks, happens-before, temporal anomalies, causal DAG, multi-cloud, microservices

---

## Author

**Akshith** — Core Algorithm Engine & Distributed Systems Logic (~45% of ChronosMesh)

## License

MIT
