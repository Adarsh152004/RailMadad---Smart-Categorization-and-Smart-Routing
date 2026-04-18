# FastAPI Backend API Reference

This document lists the public HTTP endpoints exposed by the FastAPI backend, their purpose, request/response schemas, and authentication requirements.

---

## Authentication
All endpoints (except health checks) require a valid **Firebase ID token** passed in the `Authorization` header as a Bearer token:

```
Authorization: Bearer <Firebase_ID_Token>
```

The token is verified against Firebase public keys. Unauthorized requests receive a **401 Unauthorized** response.

---

## Endpoints

| Method | Path | Description | Request Body | Response | Auth Required |
|--------|------|-------------|--------------|----------|---------------|
| `GET` | `/api/health` | Simple health check for the service. | *None* | `{ "status": "ok" }` | No |
| `GET` | `/api/profile` | Retrieves the authenticated user's profile from Supabase. | *None* | ```json
{ "uid": "string", "email": "string", "name": "string", "created_at": "datetime" }
``` | Yes |
| `POST` | `/api/detect` | Accepts an image (or text) payload, forwards it to the AI detection micro‑service, and returns the inference result. | `multipart/form-data` with field `file` (binary) | ```json
{ "prediction": "string", "confidence": 0.0, "metadata": { ... } }
``` | Yes |
| `POST` | `/api/items` | Creates a new item in the Supabase `items` table. | ```json
{ "title": "string", "description": "string", "owner_uid": "string" }
``` | ```json
{ "id": 123, "title": "...", "description": "...", "owner_uid": "...", "created_at": "datetime" }
``` | Yes |
| `GET` | `/api/items/{item_id}` | Retrieves a specific item by its ID. | *None* | Same as create response (single item) | Yes |
| `PUT` | `/api/items/{item_id}` | Updates an existing item. | ```json
{ "title": "string", "description": "string" }
``` | Updated item JSON | Yes |
| `DELETE` | `/api/items/{item_id}` | Deletes an item. | *None* | `{ "deleted": true }` | Yes |
| `GET` | `/api/search?q={query}` | Performs a semantic search over stored items using Supabase's full‑text search or custom embeddings. | *None* | ```json
[ { "id": 123, "title": "...", "snippet": "..." }, ... ]
``` | Yes |

---

## Example Request Flow

### Fetching a User Profile
```http
GET /api/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij... (Firebase ID token)
```
**Response** (200 OK):
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-07-01T12:34:56Z"
}
```

### Performing AI Detection
```http
POST /api/detect HTTP/1.1
Host: api.example.com
Authorization: Bearer <Firebase_ID_Token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="image.jpg"
Content-Type: image/jpeg

<binary image data>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```
**Response** (200 OK):
```json
{
  "prediction": "cat",
  "confidence": 0.97,
  "metadata": { "model_version": "v1.2" }
}
```

---

## Error Handling
- **401 Unauthorized** – Missing or invalid Firebase token.
- **404 Not Found** – Requested resource (e.g., item ID) does not exist.
- **422 Unprocessable Entity** – Request payload fails Pydantic validation.
- **500 Internal Server Error** – Unexpected server error; check backend logs for stack trace.

---

*All endpoints are version‑agnostic for now; consider prefixing with `/v1` in future releases to enable backward‑compatible API evolution.*
