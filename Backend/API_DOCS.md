# Authentication API Documentation

Base URL: `http://localhost:8000` (dev) | `https://your-backend.vercel.app` (prod)

## Endpoints

### 1. Register
```http
POST /auth/register/
Content-Type: application/json
```

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "re_password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  },
  "refresh": "jwt_token",
  "access": "jwt_token",
  "message": "Registration successful"
}
```

---

### 2. Login
```http
POST /auth/login/
Content-Type: application/json
```

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "refresh": "jwt_token",
  "access": "jwt_token"
}
```

---

### 3. Refresh Token
```http
POST /auth/token/refresh/
Content-Type: application/json
```

**Request:**
```json
{
  "refresh": "jwt_token"
}
```

**Response (200):**
```json
{
  "access": "jwt_token",
  "refresh": "jwt_token"
}
```

---

## Authentication

For protected endpoints, include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## Token Lifecycle

- **Access Token:** 60 minutes
- **Refresh Token:** 7 days
- Refresh tokens rotate on use (new refresh token returned)

## Error Responses

```json
{
  "field_name": ["error message"],
  "detail": "error description"
}
```

Common status codes: `400` (validation error), `401` (unauthorized), `404` (not found)
