# ChainForensics REST API Specification

Base URL: `http://localhost:4321/api`

## 1. System Health

### `GET /api/health`
Returns the operational connectivity status of all backend subsystems.
- **Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-09T14:30:00.000Z",
  "services": {
    "backend": {
      "status": "healthy",
      "uptimeSeconds": 142,
      "nodeVersion": "v24.14.1"
    },
    "database": {
      "status": "healthy",
      "connectionState": "connected",
      "host": "cluster0.mongodb.net"
    },
    "aiEngine": {
      "status": "healthy",
      "url": "http://localhost:8000",
      "latencyMs": 8,
      "details": {
        "status": "healthy",
        "model_loaded": true,
        "rules_count": 6
      }
    },
    "ethereumRpc": {
      "status": "healthy",
      "rpcUrl": "https://cloudflare-eth.com",
      "blockNumber": 21500450,
      "latencyMs": 142
    }
  }
}
```

---

## 2. Authentication

### `POST /api/auth/register`
- **Request Body:**
```json
{
  "name": "Alex Vance",
  "email": "investigator@agency.io",
  "password": "securePassword123!"
}
```
- **Response (201):**
```json
{
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "6705...",
    "email": "investigator@agency.io",
    "name": "Alex Vance",
    "role": "investigator"
  }
}
```

### `POST /api/auth/login`
- **Request Body:**
```json
{
  "email": "investigator@agency.io",
  "password": "securePassword123!"
}
```

### `POST /api/auth/demo-login`
Creates an instant guest analyst demo session.

---

## 3. Investigation Endpoints

### `POST /api/investigations/analyze`
Executes complete cryptographic analysis pipeline.
- **Request Body:**
```json
{
  "identifier": "0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8",
  "title": "Operation Layering Audit",
  "network": "ethereum",
  "analysisScope": "standard",
  "demoMode": false
}
```

### `GET /api/investigations`
Retrieves past case records with optional query parameters:
- `search`: Filter by identifier or title
- `classification`: Filter by classification
- `limit`: Number of records (default: 50)

### `GET /api/investigations/:id`
Returns a specific completed investigation dossier.

### `PATCH /api/investigations/:id`
Updates case title, investigator notes, or tags.

### `DELETE /api/investigations/:id`
Deletes a case dossier from the repository.

### `GET /api/investigations/demo-scenarios`
Returns the list of deterministic benchmark scenarios for judge testing.
