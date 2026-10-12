# ChainForensics System Architecture

```
+-------------------------------------------------------------------------------+
|                             CHAINFORENSICS PLATFORM                           |
|                  AI-Powered Blockchain Intelligence & Forensics               |
+-------------------------------------------------------------------------------+
```

## 1. Executive Architectural Overview

ChainForensics is built on a clean three-tier distributed architecture designed for forensic accuracy, resilience, and strict separation of concerns:

1. **Frontend Presentation Tier (Port 3210)**:
   - React 18 + Vite + TypeScript + Tailwind CSS
   - High-performance Cytoscape.js interactive network graph engine
   - Recharts analytical visualization layer
   - Fully responsive, accessible, dark cybersecurity UI with zero static mocks

2. **Backend Orchestration Tier (Port 4321)**:
   - Node.js + Express.js + TypeScript
   - Ethers.js JSON-RPC provider abstraction with automatic public failover pool
   - Zod schema validation & JWT authentication
   - Mongoose data layer (MongoDB Atlas) with automatic in-memory fallback cache
   - Helmet security headers & rate limiting

3. **AI & Forensics Engine Tier (Port 8000)**:
   - Python 3.14 + FastAPI + uvicorn
   - 17-dimensional behavioral and temporal feature extraction engine
   - 6 configurable deterministic heuristic rules
   - Unsupervised Isolation Forest multivariate anomaly isolation
   - Supervised Random Forest Classifier with precision/recall metrics
   - Multi-factor explainable risk synthesis layer

---

## 2. End-to-End Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Forensic Analyst
    participant UI as React Frontend (:3210)
    participant API as Express Server (:4321)
    participant RPC as Ethereum JSON-RPC
    participant AI as Python AI Service (:8000)
    participant DB as MongoDB Atlas

    Analyst->>UI: Submit Target (Address or Tx Hash)
    UI->>API: POST /api/investigations/analyze
    API->>API: Zod Syntax Validation
    
    alt Live RPC Mode
        API->>RPC: eth_getTransactionByHash / eth_getBalance
        RPC-->>API: Raw Blockchain Telemetry & Receipts
    else Demo Benchmark Mode
        API->>API: Load Deterministic Benchmark Dataset
    end

    API->>API: Normalize Transfers & Timestamp Units
    API->>AI: POST /analyze (Normalized Records)
    AI->>AI: Extract 17-D Feature Vector
    AI->>AI: Evaluate 6 Heuristic Rules
    AI->>AI: Run Isolation Forest Anomaly Isolation
    AI->>AI: Run Random Forest Classifier (if trained)
    AI->>AI: Synthesize Explainable Risk Assessment
    AI-->>API: Full Forensic Assessment Payload

    API->>API: Construct Cytoscape Graph Nodes & Edges
    API->>DB: Persist Case Dossier (or Memory Store)
    API-->>UI: Return Comprehensive Investigation Object
    UI-->>Analyst: Render Interactive Graphs, Rules & Risk Dossier
```

---

## 3. Component Directory Structure

```
d:/ChainForensics/
├── client/                     # React + Vite + Tailwind + Cytoscape
│   ├── src/
│   │   ├── components/         # CytoscapeGraph, RiskScoreBadge, TransactionTable, etc.
│   │   ├── context/            # AuthContext, Global state
│   │   ├── layouts/            # AppLayout with collapsible sidebar
│   │   ├── pages/              # Landing, Dashboard, Investigate, Results, Network, History
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interfaces
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Config & env validation
│   │   ├── controllers/        # Auth, Health, Investigation
│   │   ├── middleware/         # Auth, Helmet, RateLimit, Error handling
│   │   ├── models/             # User, Investigation (Mongoose)
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # BlockchainService (RPC), AIService, DemoService
│   │   └── validators/         # Zod schemas
│   ├── tests/                  # Supertest integration test suite
│   └── package.json
│
├── ai-service/                 # Python FastAPI Engine
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── schemas.py          # Pydantic data contracts
│   │   ├── features.py         # 17-Dimensional feature extraction
│   │   ├── rules.py            # Heuristic rule evaluation
│   │   ├── anomaly_service.py  # Isolation Forest anomaly isolation
│   │   ├── model_service.py    # Random Forest inference & availability
│   │   └── risk.py             # Risk assessment synthesis
│   ├── training/               # Train & evaluate scripts
│   ├── tests/                  # Pytest test suite
│   └── requirements.txt
│
└── docs/                       # Architectural & Technical Documentation
```
