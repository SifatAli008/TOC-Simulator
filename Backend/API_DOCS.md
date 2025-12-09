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
  "email": "string",
  "message": "Registration successful. Please check your email to verify your account."
}
```

---

### 2. Verify Email
```http
POST /auth/verify-email/
Content-Type: application/json
```

**Request:**
```json
{
  "email": "string",
  "code": "string"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "access": "jwt_token",
  "refresh": "jwt_token",
  "user": {
    "id": 1,
    "email": "string",
    "username": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

---

### 3. Login
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

**Note:** User must verify email before login. Unverified accounts will receive `401 Unauthorized`.

---

### 4. Refresh Token
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

## Email Verification

- Verification codes are **6 characters** (alphanumeric, excluding ambiguous characters)
- Codes expire after **10 minutes**
- Codes are **single-use** and cannot be reused
- Users receive verification email immediately after registration

## Error Responses

```json
{
  "field_name": ["error message"],
  "detail": "error description"
}
```

Common status codes: `400` (validation error), `401` (unauthorized), `404` (not found), `500` (server error)
