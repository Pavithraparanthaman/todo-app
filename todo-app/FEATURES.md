# Features & Functionality Documentation

## Table of Contents
1. [Frontend Features](#frontend-features)
2. [Backend API](#backend-api)
3. [Data Model](#data-model)
4. [Pages](#pages)

---

## Frontend Features

### Page 1 — Todos List (`/`)

#### Stats Dashboard
Four real-time summary cards at the top of the page:
- **Total Todos** — count of all todos in the system
- **Completed** — count of todos with status "Completed"
- **Pending** — count of todos with status "Pending"
- **High Priority** — count of todos marked as High priority

#### Search
- Live search bar filters todos by **title** or **description**
- Resets to page 1 automatically on new search

#### Filtering
- **Filter by Status** — All / Pending / Completed
- **Filter by Priority** — All / High / Medium / Low
- Filters can be combined

#### Sorting
- Sort by: Created Date, Due Date, Title, Priority
- Toggle ascending/descending order with the arrow button

#### Sidebar Navigation Quick Filters
Clicking a sidebar item (All Todos / Completed / Pending / High Priority) immediately applies the corresponding filter to the list. Sidebar badges show live counts.

#### Todos Table
Each row shows:
- Checkbox for multi-select
- **Title** + truncated description
- **Category** badge (color-coded: Work=blue, Personal=green, Learning=indigo, Health=pink)
- **Priority** (color-coded text: High=red, Medium=amber, Low=green)
- **Due Date** with calendar icon; overdue dates shown in red
- **Status** badge — clickable to toggle Pending ↔ Completed instantly
- **Action buttons**: View, Edit, Delete

#### Bulk Actions
- Select multiple todos using checkboxes (or "select all")
- A bulk action bar appears with:
  - **Mark Complete** — marks all selected as Completed
  - **Delete Selected** — deletes all selected (with confirmation)
  - **Deselect All**

#### Pagination
- 5 todos per page
- Shows "Showing X to Y of Z todos"
- First / Previous / numbered pages / Next / Last buttons
- Page resets to 1 when filters change

#### Add Todo
- "+ Add Todo" button opens a modal form
- Fields: Title (required), Description, Category, Priority, Due Date, Tags
- Tags can be added by typing and pressing Enter or clicking "Add"

#### Edit Todo
- Edit button on each row opens the same modal pre-filled with existing data
- Save updates the todo in-place

#### Delete Todo
- Delete button shows a confirmation dialog before deleting
- Prevents accidental data loss

#### Toast Notifications
- Non-blocking toast messages appear bottom-right for: create, update, delete, bulk actions, errors

---

### Page 2 — Todo Detail (`/todo/:id`)

Accessed via the View button or directly via URL '#/todo/<id>'.

#### Hero Section
- Full-width gradient header showing: Category badge, Priority badge, Status badge, Title, Description

#### Detail Fields (grid layout)
- Due Date (with "Overdue" warning if past due)
- Status (badge)
- Created timestamp + relative time (e.g. "2d ago")
- Last Updated timestamp + relative time
- Category badge
- Priority with color icon

#### Todo ID
- Displays the unique UUID for the todo (useful for API testing)

#### Tags
- All associated tags displayed as chips

#### Action Bar
- **Mark Complete / Mark Pending** — toggles status with visual feedback
- **Edit Todo** — opens the edit modal
- **Delete** — confirms then deletes and redirects to the list

#### Back Navigation
- "← Back to Todos" link returns to the list page

---

## Backend API

Base URL: `http://localhost:5000/api`

### Endpoints

#### `GET /api/todos`
Returns a paginated, filtered, sorted list of todos plus aggregate stats.

**Query Parameters:**

| Parameter | Type   | Default     | Description                          |
|-----------|--------|-------------|--------------------------------------|
| page      | number | 1           | Page number                          |
| limit     | number | 5           | Items per page                       |
| search    | string | —           | Search in title and description      |
| status    | string | All         | Filter: Pending \| Completed         |
| priority  | string | All         | Filter: High \| Medium \| Low        |
| category  | string | All         | Filter by category name              |
| sort      | string | createdAt   | Sort field: title, dueDate, priority |
| order     | string | desc        | asc \| desc                          |

**Response:**
```json
{
  "todos": [...],
  "total": 12,
  "totalPages": 3,
  "page": 1,
  "stats": {
    "total": 12,
    "completed": 5,
    "pending": 7,
    "highPriority": 3
  }
}
```

---

#### "GET /api/todos/:id"
Returns a single todo by ID.

**Response:** Todo object or `404 { "error": "Todo not found" }`

---

#### `POST /api/todos`
Creates a new todo.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Vegetables and fruits",
  "category": "Personal",
  "priority": "Low",
  "dueDate": "2025-06-15",
  "tags": ["errands", "shopping"]
}
```
- `title` is required; all other fields are optional.
- `status` defaults to `"Pending"`.

**Response:** Created todo object with `201` status.

---

#### `PUT /api/todos/:id`
Updates a todo by ID.

**Request Body:** Any combination of: `title`, `description`, `category`, `priority`, `status`, `dueDate`, `tags`

**Response:** Updated todo object.

---

#### `PATCH /api/todos/:id/toggle`
Toggles the status of a todo between `Pending` and `Completed`.

**Response:** Updated todo object.

---

#### `DELETE /api/todos/:id`
Deletes a single todo by ID.

**Response:** `{ "message": "Todo deleted successfully" }`

---

#### 'DELETE /api/todos'
Bulk deletes multiple todos.

**Request Body:**
```json
{ "ids": ["uuid1", "uuid2", "uuid3"] }
```

**Response:** `{ "message": "3 todos deleted" }`

---

## Data Model

Each todo stored in `backend/data/todos.json`:

```json
{
  "id": "uuid-v4",
  "title": "Complete React Assignment",
  "description": "Implement the todo application UI",
  "category": "Work",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2025-06-05",
  "tags": ["react", "frontend"],
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-06-01T10:00:00.000Z"
}
```

| Field       | Type             | Values                          |
|-------------|------------------|---------------------------------|
| id          | string (UUID v4) | Auto-generated                  |
| title       | string           | Required                        |
| description | string           | Optional, defaults to ""        |
| category    | string           | Work, Personal, Learning, Health, Other |
| priority    | string           | High, Medium, Low               |
| status      | string           | Pending, Completed              |
| dueDate     | string (date)    | YYYY-MM-DD or null              |
| tags        | string[]         | Array of lowercase tag strings  |
| createdAt   | ISO 8601 string  | Set on creation                 |
| updatedAt   | ISO 8601 string  | Updated on every change         |

---

## Pages

| URL Pattern      | Page        | Description                           |
|------------------|-------------|---------------------------------------|
| `#/`             | TodoList    | Main list with stats, filters, table  |
| `#/todo/:id`     | TodoDetail  | Full detail view for one todo         |

Routing is implemented with **URL hash** (`window.location.hash`) for full browser back/forward support without needing a server-side router.
