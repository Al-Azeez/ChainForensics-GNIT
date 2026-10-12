# ChainForensics Setup & Local Deployment Guide

## 1. Prerequisites
- **Node.js**: v20+ (v24 recommended)
- **npm**: v10+
- **Python**: v3.10+ (v3.14 compatible)
- **MongoDB Atlas** or Local MongoDB (Optional; app has automatic in-memory fallback for offline testability)

---

## 2. Quickstart Execution (3 Commands)

### Step 1: Python AI Service (Port 8000)
```bash
# In terminal 1:
python -m venv ai-service/venv
# Windows:
.\ai-service\venv\Scripts\activate
# macOS/Linux:
source ai-service/venv/bin/activate

pip install -r ai-service/requirements.txt
# Train reference model
python ai-service/training/train_model.py
# Start AI server
python -m uvicorn app.main:app --app-dir ai-service --port 8000 --reload
```

### Step 2: Express Backend Server (Port 4321)
```bash
# In terminal 2:
cd server
npm install
npm run dev
```

### Step 3: React Vite Frontend (Port 3210)
```bash
# In terminal 3:
cd client
npm install
npm run dev
```
Open **`http://localhost:3210`** in your browser.

---

## 3. Environment Variables Configuration

### Server (`server/.env`):
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Express REST API port | `4321` |
| `MONGODB_URI` | MongoDB Atlas Connection URI | `mongodb://localhost:27017/chainforensics` |
| `ETHEREUM_RPC_URL` | Configurable Ethereum JSON-RPC endpoint | `https://cloudflare-eth.com` |
| `AI_SERVICE_URL` | Fast API Engine URL | `http://localhost:8000` |
| `JWT_SECRET` | Secret token signing key | `chainforensics_super_secret...` |

### Client (`client/.env`):
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for API requests | `http://localhost:4321/api` |

---

## 4. Running the Complete Automated Test Suites

- **Python AI Engine Pytest Suite**:
  ```bash
  .\ai-service\venv\Scripts\pytest ai-service/tests
  ```
- **Backend Express Vitest & Supertest Suite**:
  ```bash
  npm --prefix server test
  ```
- **Frontend React Unit Test Suite**:
  ```bash
  npm --prefix client test
  ```
