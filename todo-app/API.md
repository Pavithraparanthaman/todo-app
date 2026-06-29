# API Documentation

## Base URL

```
http://localhost:5000/api
```

All requests and responses use **JSON** format.  
Set the header `Content-Type: application/json` on all POST, PUT, and DELETE requests with a body.

---

## Endpoints Overview

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | /api/todos                | Get all todos (filter/sort/paginate)|
| GET    | /api/todos/:id            | Get a single todo by ID            |
| POST   | /api/todos                | Create a new todo                  |
| PUT    | /api/todos/:id            | Update a todo by ID                |
| PATCH  | /api/todos/:id/toggle     | Toggle todo status                 |
| DELETE | /api/todos/:id            | Delete a single todo               |
| DELETE | /api/todos                | Bulk delete multiple todos         |

---

## 1. Get All Todos

**`GET /api/todos`**

Returns a paginated, filtered, and sorted list of todos along with aggregate stats.

### Query Parameters

| Parameter | Type   | Default     | Description                                      |
|-----------|--------|-------------|--------------------------------------------------|
| page      | number | 1           | Page number                                      |
| limit     | number | 5           | Number of items per page                         |
| search    | string | —           | Search keyword (matches title and description)   |
| status    | string | All         | Filter by status: `Pending` or `Completed`       |
| priority  | string | All         | Filter by priority: `High`, `Medium`, or `Low`   |
| category  | string | All         | Filter by category name                          |
| sort      | string | createdAt   | Sort field: `title`, `dueDate`, `priority`, `createdAt` |
| order     | string | desc        | Sort direction: `asc` or `desc`                  |

### Example Request

```
GET /api/todos?page=1&limit=5&status=Pending&priority=High&sort=dueDate&order=asc
```

### Example Response

```json
{
  "todos": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Fix Login Bug",
      "description": "Resolve the authentication token expiry issue in prod",
      "category": "Work",
      "priority": "High",
      "status": "Pending",
      "dueDate": "2026-06-04",
      "tags": ["bug", "auth"],
      "createdAt": "2026-06-01T10:00:00.000Z",
      "updatedAt": "2026-06-01T10:00:00.000Z"
    }
  ],
  "total": 3,
  "totalPages": 1,
  "page": 1,
  "stats": {
    "total": 7,
    "completed": 2,
    "pending": 5,
    "highPriority": 3
  }
}
```

---

## 2. Get Single Todo

**`GET /api/todos/:id`**

Returns a single todo by its unique ID.

### URL Parameter

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| id        | string | UUID of the todo   |

### Example Request

```
GET /api/todos/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Fix Login Bug",
  "description": "Resolve the authentication token expiry issue in prod",
  "category": "Work",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2026-06-04",
  "tags": ["bug", "auth"],
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:00:00.000Z"
}
```

### Error Response (404)

```json
{
  "error": "Todo not found"
}
```

---

## 3. Create Todo

**`POST /api/todos`**

Creates a new todo. The `title` field is required. All other fields are optional.

### Request Body

| Field       | Type     | Required | Default    | Description                                      |
|-------------|----------|----------|------------|--------------------------------------------------|
| title       | string   | ✅ Yes   | —          | Title of the todo                                |
| description | string   | No       | `""`       | Detailed description                             |
| category    | string   | No       | `Personal` | Work, Personal, Learning, Health, Other          |
| priority    | string   | No       | `Medium`   | High, Medium, Low                                |
| dueDate     | string   | No       | `null`     | Due date in `YYYY-MM-DD` format                  |
| tags        | string[] | No       | `[]`       | Array of tag strings                             |

### Example Request

```json
{
  "title": "Buy groceries",
  "description": "Vegetables and fruits for the week",
  "category": "Personal",
  "priority": "Low",
  "dueDate": "2026-07-01",
  "tags": ["errands", "shopping"]
}
```

### Example Response (201 Created)

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "title": "Buy groceries",
  "description": "Vegetables and fruits for the week",
  "category": "Personal",
  "priority": "Low",
  "status": "Pending",
  "dueDate": "2026-07-01",
  "tags": ["errands", "shopping"],
  "createdAt": "2026-06-29T08:00:00.000Z",
  "updatedAt": "2026-06-29T08:00:00.000Z"
}
```

### Error Response (400)

```json
{
  "error": "Title is required"
}
```

---

## 4. Update Todo

**`PUT /api/todos/:id`**

Updates one or more fields of an existing todo. Only the fields you include in the request body will be updated.

### URL Parameter

| Parameter | Type   | Description      |
|-----------|--------|------------------|
| id        | string | UUID of the todo |

### Updatable Fields

| Field       | Type     | Description                             |
|-------------|----------|-----------------------------------------|
| title       | string   | New title                               |
| description | string   | New description                         |
| category    | string   | Work, Personal, Learning, Health, Other |
| priority    | string   | High, Medium, Low                       |
| status      | string   | Pending, Completed                      |
| dueDate     | string   | Date in `YYYY-MM-DD` format             |
| tags        | string[] | Replaces existing tags                  |

### Example Request

```json
{
  "title": "Buy groceries and cook dinner",
  "priority": "Medium",
  "status": "Completed"
}
```

### Example Response

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "title": "Buy groceries and cook dinner",
  "description": "Vegetables and fruits for the week",
  "category": "Personal",
  "priority": "Medium",
  "status": "Completed",
  "dueDate": "2026-07-01",
  "tags": ["errands", "shopping"],
  "createdAt": "2026-06-29T08:00:00.000Z",
  "updatedAt": "2026-06-29T09:30:00.000Z"
}
```

---

## 5. Toggle Todo Status

**`PATCH /api/todos/:id/toggle`**

Toggles the status of a todo between `Pending` and `Completed`. No request body needed.

### URL Parameter

| Parameter | Type   | Description      |
|-----------|--------|------------------|
| id        | string | UUID of the todo |

### Example Request

```
PATCH /api/todos/a1b2c3d4-e5f6-7890-abcd-ef1234567890/toggle
```

### Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Fix Login Bug",
  "status": "Completed",
  "updatedAt": "2026-06-29T10:00:00.000Z"
}
```

---

## 6. Delete Todo

**`DELETE /api/todos/:id`**

Permanently deletes a single todo by ID.

### URL Parameter

| Parameter | Type   | Description      |
|-----------|--------|------------------|
| id        | string | UUID of the todo |

### Example Request

```
DELETE /api/todos/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Example Response

```json
{
  "message": "Todo deleted successfully"
}
```

### Error Response (404)

```json
{
  "error": "Todo not found"
}
```

---

## 7. Bulk Delete Todos

**`DELETE /api/todos`**

Deletes multiple todos in a single request.

### Request Body

| Field | Type     | Required | Description                    |
|-------|----------|----------|--------------------------------|
| ids   | string[] | ✅ Yes   | Array of todo UUIDs to delete  |

### Example Request

```json
{
  "ids": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  ]
}
```

### Example Response

```json
{
  "message": "2 todos deleted"
}
```

### Error Response (400)

```json
{
  "error": "ids array required"
}
```

---

## Data Model

```json
{
  "id":          "string (UUID v4)   — auto-generated",
  "title":       "string             — required",
  "description": "string             — optional, default: \"\"",
  "category":    "string             — Work | Personal | Learning | Health | Other",
  "priority":    "string             — High | Medium | Low",
  "status":      "string             — Pending | Completed",
  "dueDate":     "string | null      — YYYY-MM-DD format",
  "tags":        "string[]           — array of lowercase strings",
  "createdAt":   "ISO 8601 string    — set on creation",
  "updatedAt":   "ISO 8601 string    — updated on every change"
}
```

---

## Error Codes

| Status Code | Meaning                                      |
|-------------|----------------------------------------------|
| 200         | Success                                      |
| 201         | Created successfully                         |
| 400         | Bad request (missing or invalid fields)      |
| 404         | Todo not found                               |
| 500         | Internal server error                        |

---

## Testing with curl

```bash
# Get all todos
curl http://localhost:5000/api/todos

# Get single todo
curl http://localhost:5000/api/todos/<id>

# Create todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo","priority":"High","category":"Work"}'

# Update todo
curl -X PUT http://localhost:5000/api/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"Completed"}'

# Toggle status
curl -X PATCH http://localhost:5000/api/todos/<id>/toggle

# Delete todo
curl -X DELETE http://localhost:5000/api/todos/<id>

# Bulk delete
curl -X DELETE http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"ids":["<id1>","<id2>"]}'
```
