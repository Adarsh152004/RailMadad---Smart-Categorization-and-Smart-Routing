# Application Architecture Overview

![Application Flow Diagram](file:///C:/Users/krish/.gemini/antigravity/brain/13d8856d-5528-43e7-be18-fb1e8a166b0f/app_flow_diagram_1776445842248.png)

## 1. High‑Level Flow

1. **User Interaction** – The user interacts with the **Next.js** frontend (React) running in the browser.
2. **Authentication** – The frontend authenticates the user via **Firebase Auth**. Upon successful login, Firebase issues an **ID token** (JWT).
3. **API Calls** – The frontend includes the Firebase ID token in the `Authorization` header of every HTTP request to the backend.
4. **FastAPI Backend** – The **FastAPI** server receives the request, validates the Firebase token, and routes the request to the appropriate endpoint.
5. **Database Operations** – For CRUD operations, FastAPI communicates with the **Supabase PostgreSQL** database using the Supabase client libraries.
6. **AI Detection Service** – Certain endpoints (e.g., image or text analysis) forward data to an external **AI detection service** (a TensorFlow model hosted as a separate micro‑service). The backend sends the payload, receives the inference result, and returns it to the frontend.
7. **Response** – FastAPI returns a JSON response to the frontend, which updates the UI accordingly.

---

## 2. Technology Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | **Next.js (React)** | UI, client‑side routing, server‑side rendering (SSR) |
| | **Tailwind CSS** (optional) | Styling (if used) |
| | **Axios / fetch** | HTTP client for API calls |
| **Authentication** | **Firebase Auth** | User sign‑in, token issuance, session management |
| **Backend** | **FastAPI (Python)** | RESTful API server, request validation, business logic |
| | **Pydantic** | Data validation & serialization |
| | **uvicorn** | ASGI server running FastAPI |
| **Database** | **Supabase PostgreSQL** | Persistent data storage, real‑time subscriptions |
| | **Supabase Python client** | DB interaction from FastAPI |
| **AI Detection** | **TensorFlow (served via REST)** | Performs image/text detection, returns inference results |
| **DevOps** | **npm** / **pnpm** | Frontend dependency management |
| | **Python v3.11** | Backend runtime |
| | **Docker (optional)** | Containerisation for reproducible environments |

---

## 3. Detailed API Call Sequence

### 3.1. Authenticated Request Example (Fetching User Profile)

1. **Frontend** calls `GET /api/profile` with header `Authorization: Bearer <Firebase_ID_Token>`.
2. **FastAPI** middleware validates the token against Firebase public keys.
3. Upon validation, FastAPI extracts the user UID and queries **Supabase**:
   ```python
   profile = supabase.from_('profiles').select('*').eq('uid', uid).single()
   ```
4. FastAPI returns the profile JSON to the frontend.

### 3.2. AI Detection Request Example (Image Analysis)

1. User uploads an image via the UI; the frontend sends `POST /api/detect` with the image file and the Firebase token.
2. FastAPI validates the token, stores the image temporarily, and forwards it to the AI service:
   ```python
   response = httpx.post('http://ai-service/detect', files={'file': open(path, 'rb')})
   result = response.json()
   ```
3. FastAPI may persist the detection result in Supabase for later retrieval.
4. The detection result is sent back to the frontend, which displays the outcome.

---

## 4. How Components Interact

- **Next.js ↔ FastAPI** – Pure HTTP/HTTPS REST calls (JSON payloads). All calls are protected by Firebase JWTs.
- **FastAPI ↔ Supabase** – Direct SQL‑like queries via Supabase client; Supabase also provides real‑time listeners that FastAPI can subscribe to if needed.
- **FastAPI ↔ AI Service** – Internal network call (usually HTTP) to a TensorFlow‑served model; this service is stateless and can be scaled independently.
- **Frontend ↔ Firebase Auth** – Uses Firebase SDK to sign‑in users, refresh tokens, and handle logout.

---

## 5. Monitoring & Debugging

- **Backend logs** – `uvicorn` logs are streamed to the console; errors are captured by Sentry (if configured).
- **Frontend console** – Network tab shows request/response cycles; any 401/403 indicates token validation failures.
- **Supabase dashboard** – Provides query logs and real‑time activity.
- **AI Service metrics** – TensorFlow serving exposes Prometheus metrics for latency and request counts.

---

## 6. Future Enhancements

- **Rate limiting** on API endpoints using `slowapi`.
- **Caching** of frequent detection results with Redis.
- **CI/CD pipelines** to automatically build and deploy both frontend and backend.
- **GraphQL layer** on top of FastAPI for more flexible data fetching.

---

*This document provides a concise yet comprehensive view of the Mini Project’s architecture, illustrating how each technology fits into the overall system flow.*
