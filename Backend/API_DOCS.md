# TOC-Simulator API Documentation

**Base URLs:**
- Development: `http://localhost:8000`
- Production: `https://toc-simulator-backend.onrender.com`

---

## 🔐 Authentication Endpoints

### 1. Register
Create a new user account. Email verification required before login.

```http
POST /auth/register/
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "re_password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Success Response (201):**
```json
{
  "email": "john@example.com",
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Error Response (400):**
```json
{
  "email": ["User with this email already exists."],
  "password": ["Password must be at least 8 characters long."]
}
```

---

### 2. Verify Email
Verify email with 6-character code sent to user's email.

```http
POST /auth/verify-email/
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "ABC123"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid or expired verification code"
}
```

---

### 3. Login
Login with verified email and password to get JWT tokens.

```http
POST /auth/login/
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

**Note:** Email must be verified before login. Unverified users get 401 error.

---

### 4. Refresh Token
Get new access token using refresh token.

```http
POST /auth/token/refresh/
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🤖 Simulation Endpoints

**Authentication Required:** All simulation endpoints require Bearer token except `/shared/`

**Header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. List Sessions
Get all user's simulation sessions with pagination.

```http
GET /simulations/sessions/
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10, max: 100)
- `type` (optional): Filter by automata type (DFA, NFA, PDA, TM, REGEX)
- `is_favorite` (optional): Filter favorites (true/false)
- `search` (optional): Search in session_name or description
- `ordering` (optional): Sort by field (e.g., `-created_at`, `session_name`)

**Example Request:**
```http
GET /simulations/sessions/?page=1&page_size=10&type=DFA&ordering=-created_at
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "count": 42,
  "next": "http://localhost:8000/simulations/sessions/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "public_id": "550e8400-e29b-41d4-a716-446655440000",
      "session_name": "Email Validator DFA",
      "automata_type": "DFA",
      "is_favorite": true,
      "is_shared": false,
      "created_at": "2024-12-15T10:30:00Z",
      "last_accessed_at": "2024-12-15T14:20:00Z",
      "run_count": 15
    }
  ]
}
```

---

### 6. Create Session
Create a new simulation session.

```http
POST /simulations/sessions/
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "session_name": "Email Validator DFA",
  "description": "DFA that validates email addresses with @ and .",
  "automata_type": "DFA",
  "automata_data": {
    "states": ["q0", "q1", "q2", "q3"],
    "alphabet": ["a-z", "0-9", "@", "."],
    "transitions": [
      {"from": "q0", "to": "q1", "symbol": "a-z"},
      {"from": "q1", "to": "q1", "symbol": "a-z"},
      {"from": "q1", "to": "q2", "symbol": "@"},
      {"from": "q2", "to": "q3", "symbol": "a-z"},
      {"from": "q3", "to": "q3", "symbol": "."}
    ],
    "start_state": "q0",
    "accept_states": ["q3"]
  }
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "public_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_name": "Email Validator DFA",
  "description": "DFA that validates email addresses with @ and .",
  "automata_type": "DFA",
  "automata_data": { ... },
  "is_favorite": false,
  "is_shared": false,
  "share_url": null,
  "is_owner": true,
  "created_at": "2024-12-15T10:30:00Z",
  "updated_at": "2024-12-15T10:30:00Z",
  "last_accessed_at": "2024-12-15T10:30:00Z",
  "state_count": 4,
  "transition_count": 5,
  "runs": []
}
```

---

### 7. Get Session Details
Retrieve specific session by UUID.

```http
GET /simulations/sessions/{public_id}/
Authorization: Bearer <token>
```

**Example:**
```http
GET /simulations/sessions/550e8400-e29b-41d4-a716-446655440000/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "public_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_name": "Email Validator DFA",
  "description": "DFA that validates email addresses",
  "automata_type": "DFA",
  "automata_data": {
    "states": ["q0", "q1", "q2", "q3"],
    "transitions": [...],
    "alphabet": ["a-z", "0-9", "@", "."],
    "start_state": "q0",
    "accept_states": ["q3"]
  },
  "is_favorite": true,
  "is_shared": false,
  "share_url": null,
  "is_owner": true,
  "created_at": "2024-12-15T10:30:00Z",
  "updated_at": "2024-12-15T10:30:00Z",
  "last_accessed_at": "2024-12-15T14:20:00Z",
  "state_count": 4,
  "transition_count": 5,
  "runs": [
    {
      "id": 1,
      "input_string": "user@example.com",
      "is_accepted": true,
      "execution_time": 0.023,
      "result_steps": ["q0", "q1", "q1", "q1", "q2", "q3"],
      "created_at": "2024-12-15T10:35:00Z"
    }
  ]
}
```

---

### 8. Update Session (Full)
Full update of session (all fields required).

```http
PUT /simulations/sessions/{public_id}/
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "session_name": "Updated Email Validator",
  "description": "Updated description",
  "automata_type": "DFA",
  "automata_data": {
    "states": ["q0", "q1"],
    "transitions": [],
    "alphabet": ["a"],
    "start_state": "q0",
    "accept_states": ["q1"]
  },
  "is_favorite": true
}
```

---

### 9. Update Session (Partial)
Partial update of session (only send fields to change).

```http
PATCH /simulations/sessions/{public_id}/
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (Example - Update name only):**
```json
{
  "session_name": "New Session Name"
}
```

**Request Body (Example - Toggle favorite):**
```json
{
  "is_favorite": true
}
```

---

### 10. Delete Session
Delete a simulation session permanently.

```http
DELETE /simulations/sessions/{public_id}/
Authorization: Bearer <token>
```

**Success Response (204):**
```
No Content
```

---

### 11. Save Simulation Run
Save a test run result for a session.

```http
POST /simulations/sessions/{public_id}/save_run/
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "input_string": "user@example.com",
  "is_accepted": true,
  "execution_time": 0.023,
  "result_steps": ["q0", "q1", "q1", "q1", "q2", "q3", "q3", "q3", "q3"]
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "input_string": "user@example.com",
  "is_accepted": true,
  "execution_time": 0.023,
  "result_steps": ["q0", "q1", "q1", "q1", "q2", "q3", "q3", "q3", "q3"],
  "created_at": "2024-12-15T10:35:00Z"
}
```

---

### 12. Duplicate Session
Create a copy of existing session.

```http
POST /simulations/sessions/{public_id}/duplicate/
Authorization: Bearer <token>
```

**Success Response (201):**
```json
{
  "id": 2,
  "public_id": "660e8400-e29b-41d4-a716-446655440001",
  "session_name": "Email Validator DFA (Copy)",
  "description": "DFA that validates email addresses",
  "automata_type": "DFA",
  "automata_data": { ... },
  "is_favorite": false,
  "is_shared": false,
  "created_at": "2024-12-15T15:00:00Z",
  "runs": []
}
```

---

### 13. Toggle Favorite
Toggle favorite status of session.

```http
POST /simulations/sessions/{public_id}/toggle_favorite/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "is_favorite": true,
  "message": "Session marked as favorite"
}
```

---

### 14. Generate Share Link
Enable sharing and get shareable URL. Only owner can generate.

```http
POST /simulations/sessions/{public_id}/generate_share_link/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Share link generated successfully",
  "share_url": "/shared/550e8400-e29b-41d4-a716-446655440000",
  "public_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_shared": true,
  "full_url": "http://localhost:8000/shared/550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 15. Revoke Share Link
Disable sharing. Only owner can revoke.

```http
POST /simulations/sessions/{public_id}/revoke_share_link/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Share link revoked successfully",
  "is_shared": false
}
```

---

### 16. View Shared Session (PUBLIC)
View shared session without authentication.

```http
GET /simulations/sessions/{public_id}/shared/
```

**No Authorization Required!**

**Success Response (200):**
```json
{
  "id": 1,
  "public_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_name": "Email Validator DFA",
  "description": "DFA that validates email addresses",
  "automata_type": "DFA",
  "automata_data": { ... },
  "is_favorite": false,
  "is_shared": true,
  "share_url": "http://localhost:8000/shared/550e8400-e29b-41d4-a716-446655440000",
  "is_owner": false,
  "created_at": "2024-12-15T10:30:00Z",
  "updated_at": "2024-12-15T10:30:00Z",
  "state_count": 4,
  "transition_count": 5,
  "runs": [...],
  "shared_by": {
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Session not found or not shared"
}
```

---

### 17. List Favorites
Get all favorite sessions.

```http
GET /simulations/sessions/favorites/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [...]
}
```

---

### 18. List Recent Sessions
Get recently accessed sessions (last 7 days by default).

```http
GET /simulations/sessions/recent/
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7)

**Example:**
```http
GET /simulations/sessions/recent/?days=30
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [...]
}
```

---

### 19. Get Statistics
Get user's simulation statistics.

```http
GET /simulations/sessions/statistics/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "total_sessions": 42,
  "favorites_count": 8,
  "shared_count": 3,
  "recent_count": 12
}
```

---

### 20. List All Runs
Get all simulation runs from user's sessions.

```http
GET /simulations/runs/
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `page_size` (pagination)

**Success Response (200):**
```json
{
  "count": 150,
  "next": "http://localhost:8000/simulations/runs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "input_string": "user@example.com",
      "is_accepted": true,
      "execution_time": 0.023,
      "result_steps": [...],
      "created_at": "2024-12-15T10:35:00Z"
    }
  ]
}
```

---

### 21. Get Run Details
Get specific run details.

```http
GET /simulations/runs/{id}/
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "input_string": "user@example.com",
  "is_accepted": true,
  "execution_time": 0.023,
  "result_steps": ["q0", "q1", "q1", "q1", "q2", "q3"],
  "created_at": "2024-12-15T10:35:00Z"
}
```

---

## 📋 General Information

### Authentication Header
For all protected endpoints (except PUBLIC ones):

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle
- **Access Token Expiry:** 60 minutes
- **Refresh Token Expiry:** 7 days
- Refresh tokens rotate on use (new refresh token returned)

### Email Verification
- Verification codes: **6 characters** (alphanumeric, no ambiguous chars like 0, O, 1, l)
- Code expiry: **10 minutes**
- Single-use codes (cannot be reused)
- Email sent immediately after registration

### Pagination
All list endpoints support pagination:
- Default page size: 10
- Max page size: 100
- Query params: `page`, `page_size`

### Filtering & Search
Sessions can be filtered/searched:
- `type`: Filter by automata type (DFA, NFA, PDA, TM, REGEX)
- `is_favorite`: Filter favorites (true/false)
- `search`: Search in session_name or description
- `ordering`: Sort by field (prefix with `-` for descending)

### Automata Types
Supported values for `automata_type`:
- `DFA` - Deterministic Finite Automaton
- `NFA` - Nondeterministic Finite Automaton
- `PDA` - Pushdown Automaton
- `TM` - Turing Machine
- `REGEX` - Regular Expression

### Error Responses

**Validation Error (400):**
```json
{
  "field_name": ["Error message here"],
  "detail": "Additional error details"
}
```

**Unauthorized (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Forbidden (403):**
```json
{
  "error": "Only the owner can perform this action"
}
```

**Not Found (404):**
```json
{
  "detail": "Not found."
}
```

**Server Error (500):**
```json
{
  "detail": "Internal server error"
}
```

---

## 🧪 Postman Collection Tips

### Environment Variables
Set these in Postman environment:
- `base_url`: `http://localhost:8000` or `https://toc-simulator-backend.onrender.com`
- `access_token`: Your JWT access token (auto-updated via scripts)
- `refresh_token`: Your JWT refresh token

### Pre-request Script (for auto-token refresh)
Add to collection level:
```javascript
// Check if access token is about to expire
const tokenExp = pm.environment.get('token_expiry');
if (tokenExp && Date.now() > tokenExp - 60000) {
    // Refresh token
    pm.sendRequest({
        url: pm.environment.get('base_url') + '/auth/token/refresh/',
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                refresh: pm.environment.get('refresh_token')
            })
        }
    }, (err, res) => {
        if (!err) {
            const data = res.json();
            pm.environment.set('access_token', data.access);
            pm.environment.set('refresh_token', data.refresh);
            pm.environment.set('token_expiry', Date.now() + 3600000);
        }
    });
}
```

### Tests Script (for login endpoint)
Save tokens automatically:
```javascript
if (pm.response.code === 200) {
    const data = pm.response.json();
    pm.environment.set('access_token', data.access);
    pm.environment.set('refresh_token', data.refresh);
    pm.environment.set('token_expiry', Date.now() + 3600000);
}
```

---

## 🚀 Quick Start Guide

### 1. Register & Verify
```bash
# 1. Register
POST /auth/register/
Body: { "username": "test", "email": "test@example.com", ... }

# 2. Check email for code (e.g., "ABC123")

# 3. Verify
POST /auth/verify-email/
Body: { "email": "test@example.com", "code": "ABC123" }

# Save the tokens from response!
```

### 2. Create First Session
```bash
POST /simulations/sessions/
Headers: Authorization: Bearer <access_token>
Body: {
  "session_name": "My First DFA",
  "automata_type": "DFA",
  "automata_data": {
    "states": ["q0", "q1"],
    "alphabet": ["a", "b"],
    "transitions": [{"from": "q0", "to": "q1", "symbol": "a"}],
    "start_state": "q0",
    "accept_states": ["q1"]
  }
}

# Note the public_id from response
```

### 3. Test Simulation
```bash
POST /simulations/sessions/{public_id}/save_run/
Headers: Authorization: Bearer <access_token>
Body: {
  "input_string": "aaa",
  "is_accepted": true,
  "execution_time": 0.01,
  "result_steps": ["q0", "q1", "q1", "q1"]
}
```

### 4. Share Session
```bash
POST /simulations/sessions/{public_id}/generate_share_link/
Headers: Authorization: Bearer <access_token>

# Copy the full_url from response and share with anyone!
```

---

## 📊 Common Use Cases

### Use Case 1: Get User's DFA Sessions
```http
GET /simulations/sessions/?type=DFA&ordering=-created_at
Authorization: Bearer <token>
```

### Use Case 2: Search Sessions
```http
GET /simulations/sessions/?search=email&page_size=20
Authorization: Bearer <token>
```

### Use Case 3: Get Recent Activity
```http
GET /simulations/sessions/recent/?days=14
Authorization: Bearer <token>
```

### Use Case 4: Get Dashboard Stats
```http
GET /simulations/sessions/statistics/
Authorization: Bearer <token>
```

### Use Case 5: View Someone's Shared Automaton
```http
GET /simulations/sessions/{uuid}/shared/
# No auth needed!
```
