# ChainForensics 🔍⚡
### AI-Powered Blockchain Transaction Intelligence & Forensics Platform

[![Node Version](https://img.shields.io/badge/Node.js-v24.x-blue.svg)](https://nodejs.org)
[![Python Version](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.115-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"Every Transaction Leaves a Trail."**
> Investigate blockchain activity, trace multi-hop wallet relationships, and uncover suspicious transaction patterns with explainable AI-powered analytics.

---

## 🌟 Core Principles & Identity

- **Mission**: Assist human investigators, compliance analysts, security researchers, and students in analyzing cryptocurrency transaction topologies, identifying anomalies, and understanding the evidence behind automated risk assessments.
- **Core Forensic Principle**: The platform assists investigations. It **never** presents an automated risk score as definitive legal proof of criminal activity. Every risk score is explainable, documented, and decomposed into measurable evidence.

---

## 🏗️ Technical Architecture

ChainForensics utilizes a robust three-tier microservices architecture:

1. **Frontend (Port 3210)**:
   - React 18 + Vite + TypeScript + Tailwind CSS
   - Cytoscape.js interactive directed network graph
   - Recharts visual telemetry
   - Lucide React iconography & custom geometric typography wordmark
2. **Backend Server (Port 4321)**:
   - Node.js + Express.js + TypeScript
   - Configurable Ethereum JSON-RPC provider abstraction with failover
   - Zod request schema validation & JWT authentication
   - MongoDB Atlas Mongoose persistence with in-memory fallback
   - Helmet security headers & rate limiting
3. **AI & Forensics Engine (Port 8000)**:
   - Python FastAPI + pandas + NumPy + scikit-learn
   - 17-dimensional behavioral feature vector extractor
   - 6 transparent, configurable heuristic rules
   - Unsupervised Isolation Forest multivariate anomaly isolation
   - Supervised Random Forest Classifier with balanced class weighting
   - Explainable Multi-Factor Risk Assessment Engine

---

## 🚀 Quickstart Guide

### 1. Start Python AI Service (Port 8000)
```powershell
# Navigate and activate virtual environment
python -m venv ai-service/venv
.\ai-service\venv\Scripts\activate

# Install dependencies
pip install -r ai-service/requirements.txt

# Train reference ML classifier
python ai-service/training/train_model.py

# Launch FastAPI server
python -m uvicorn app.main:app --app-dir ai-service --port 8000 --reload
```

### 2. Start Express Backend Server (Port 4321)
```powershell
cd server
npm install
npm run dev
```

### 3. Start React Frontend (Port 3210)
```powershell
cd client
npm install
npm run dev
```
Open **`http://localhost:3210`** in your browser.

---

## 🧪 Automated Testing & QA

Run all test suites across all tiers:

```powershell
# 1. Python AI Engine Pytest Suite (6 Tests)
.\ai-service\venv\Scripts\pytest ai-service/tests

# 2. Server Vitest & Supertest API Suite (5 Tests)
npm --prefix server test

# 3. Client Vitest Component & Utility Suite (3 Tests)
npm --prefix client test
```

---

## 📚 Detailed Documentation

- [System Architecture Specification](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [AI & ML Model Methodology](docs/MODEL_METHODOLOGY.md)
- [Setup & Deployment Guide](docs/SETUP.md)

---

## ⚖️ Legal & Educational Disclaimer

ChainForensics provides statistical heuristics, explainable machine learning predictions, and rule-based anomaly detection to assist human investigators. Automated risk classifications must never be presented as definitive proof of criminal activity.
