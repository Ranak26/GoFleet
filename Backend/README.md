# User Registration API Documentation

## Endpoints

### POST /users/register

User registration endpoint that creates a new user account and returns an authentication token.

---

## Description

This endpoint allows users to register a new account by providing their personal information (first name, last name, email) and a password. The password is hashed using bcrypt before being stored in the database, and upon successful registration, a JWT authentication token is generated and returned to the client.

---

## Request Body

The endpoint accepts a JSON request body with the following fields:

```json
{
  "fullname": {
    "firstname": "string (required)",
    "lastname": "string (required)"
  },
  "email": "string (required)",
  "password": "string (required)"
}
```

### Required Fields

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `fullname.firstname` | string | Min 3 characters | User's first name |
| `fullname.lastname` | string | Min 3 characters | User's last name |
| `email` | string | Valid email format, min 5 characters, unique | User's email address |
| `password` | string | Min 6 characters | User's password |

---

## Response

### Success Response (201 Created)

**Status Code:** `201`

**Response Body:**
```json
{
  "user": {
    "_id": "mongodb_id",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": null
  },
  "token": "jwt_token_string"
}
```

### Error Response (400 Bad Request)

**Status Code:** `400`

**Response Body (Validation Errors):**
```json
{
  "errors": [
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "Please use a valid email address.",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## Status Codes

| Status Code | Description |
|-------------|-------------|
| `201` | User successfully created and token generated |
| `400` | Bad Request - Validation failed (missing fields, invalid format, or constraints not met) |

---

## Example Usage

### cURL
```bash
curl -X POST http://localhost:PORT/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "password": "password123"
  }'
```

### JavaScript (Fetch)
```javascript
fetch('http://localhost:PORT/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: {
      firstname: 'John',
      lastname: 'Doe'
    },
    email: 'john@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

## Validation Rules

All validations are performed using `express-validator` middleware:

- **First Name:** Must be at least 3 characters long
- **Last Name:** Must be at least 3 characters long
- **Email:** Must be a valid email address and at least 5 characters long
- **Password:** Must be at least 6 characters long
- **Email:** Must be unique (no duplicate emails allowed in the database)

---

## Notes

- Password is hashed using bcrypt with 10 salt rounds before storage
- The returned JWT token should be stored client-side and included in subsequent authenticated requests
- Email addresses are case-sensitive and must be unique in the system
- The password field is not returned in the response for security reasons

