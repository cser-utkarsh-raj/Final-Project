# API Contract

Base URL through gateway: `http://localhost:8080`

## Authentication

`POST /api/auth/register`

```json
{
  "fullName": "Student User",
  "email": "student@college.edu",
  "password": "Student@123",
  "role": "STUDENT"
}
```

`POST /api/auth/login`

```json
{
  "email": "admin@college.edu",
  "password": "Admin@123"
}
```

The response contains a JWT token valid for 24 hours. Use it as:

`Authorization: Bearer <token>`

## Inventory

`GET /api/items?page=0&size=20&sort=name`

Accessible to ADMIN and STUDENT.

`POST /api/items`

ADMIN only.

```json
{
  "name": "Blue Ball Pen",
  "category": "PEN",
  "unit": "piece",
  "availableQuantity": 100,
  "minimumQuantity": 20
}
```

`PUT /api/items/{id}`

ADMIN only. Uses the same body as item creation.

## Requests

`POST /api/requests`

STUDENT only.

```json
{
  "items": [
    { "itemId": 1, "itemName": "Blue Ball Pen", "quantity": 2 }
  ]
}
```

`GET /api/requests/mine?status=PENDING`

STUDENT only.

`GET /api/requests`

ADMIN only.

`POST /api/requests/{id}/approve`

ADMIN only. Deducts inventory through the inventory service.

`POST /api/requests/{id}/reject`

ADMIN only.

```json
{
  "reason": "Stock reserved for examination department"
}
```
