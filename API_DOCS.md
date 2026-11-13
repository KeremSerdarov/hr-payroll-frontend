# HR Payroll API

All endpoints use the `/api/v1` prefix. Send and receive JSON with `Accept: application/json`. Authenticated requests use `Authorization: Bearer <token>`. Dates use `YYYY-MM-DD`; monetary values are decimal strings/numbers.

Validation failures return `422` with Laravel's `message` and `errors` object. Missing or invalid tokens return `401`; authenticated non-admin users receive `403` for admin endpoints. Successful list and resource responses use Laravel resource JSON (`data` for collections and single resources).

## Authentication

### `POST /api/v1/login`

Auth: none. Body: `{"email":"admin@example.com","password":"secret123"}`. Both `admin` and `employee` accounts may log in.

Example `200`:

```json
{"token":"1|plain-text-token","user":{"id":1,"name":"Admin User","email":"admin@example.com","role":"admin"}}
```

### `POST /api/v1/logout`

Auth: Bearer token, either role. Body: none. Revokes the current token only.

Example `200`: `{"message":"Ulgamdan çykdyňyz."}`

### `GET /api/v1/me`

Auth: Bearer token, either role. Body: none.

Example `200`: `{"id":1,"name":"Admin User","email":"admin@example.com","role":"admin"}`

## Employee endpoints

All employee endpoints require an employee Bearer token.

### `GET /api/v1/payrolls`

Body: none. Returns the signed-in employee's payroll history.

Example `200`: `{"data":[{"id":8,"month":5,"year":2026,"base_salary":"5000.00","bonus":"0.00","deduction":"0.00","tax":"500.00","net_salary":"4500.00","status":"paid"}]}`

### `GET /api/v1/payrolls/{payroll}`

Body: none. Returns one of the signed-in employee's payroll records; another employee's record returns `404`.

Example `200`: `{"data":{"id":8,"month":5,"year":2026,"base_salary":"5000.00","bonus":"0.00","deduction":"0.00","tax":"500.00","net_salary":"4500.00","status":"paid"}}`

### `GET /api/v1/attendances`

Body: none. Returns the signed-in employee's attendance records.

Example `200`: `{"data":[{"id":4,"date":"2026-05-05","status":"present"}]}`

### `GET /api/v1/leave-requests`

Body: none. Returns the signed-in employee's leave requests.

Example `200`: `{"data":[{"id":2,"start_date":"2026-06-10","end_date":"2026-06-12","reason":"Personal leave","status":"pending","admin_comment":null}]}`

### `POST /api/v1/leave-requests`

Body: `{"start_date":"2026-06-10","end_date":"2026-06-12","reason":"Personal leave"}`. Dates are required and end date must not precede start date; reason is required (max 5000 characters). Employee ID is taken from the token.

Example `201`: `{"data":{"id":3,"start_date":"2026-06-10","end_date":"2026-06-12","reason":"Personal leave","status":"pending","admin_comment":null}}`

## Admin endpoints

All endpoints below require an admin Bearer token.

### Departments

| Method and URL | Body | Success |
|---|---|---|
| `GET /api/v1/admin/departments` | None | `200` collection |
| `POST /api/v1/admin/departments` | `{"name":"Engineering","description":"Product team"}` | `201` resource |
| `GET /api/v1/admin/departments/{department}` | None | `200` resource |
| `PUT/PATCH /api/v1/admin/departments/{department}` | `{"name":"Engineering","description":"Updated"}` | `200` resource |
| `DELETE /api/v1/admin/departments/{department}` | None | `204` empty |

Department name is required and unique; description is optional. Example resource: `{"data":{"id":1,"name":"Engineering","description":"Product team","employees_count":4}}`.

### Employees

| Method and URL | Body | Success |
|---|---|---|
| `GET /api/v1/admin/employees` | None | `200` collection |
| `POST /api/v1/admin/employees` | See below | `201` resource |
| `GET /api/v1/admin/employees/{employee}` | None | `200` resource |
| `PUT/PATCH /api/v1/admin/employees/{employee}` | Any fields below | `200` resource |
| `DELETE /api/v1/admin/employees/{employee}` | None | `204` empty |

Create body: `{"name":"Ayna Meredova","email":"ayna@example.com","password":"secret123","department_id":1,"position":"Accountant","base_salary":5000,"hired_at":"2026-01-15"}`. Name, email, password (minimum 8 characters), department, position, salary (non-negative), and hire date are required on create. Update accepts these fields as optional; omitting password preserves the current password. Creating an employee also creates a linked `User` with role `employee`; updates synchronize name, email, and optional password.

Example: `{"data":{"id":7,"user":{"id":9,"name":"Ayna Meredova","email":"ayna@example.com","role":"employee"},"department":{"id":1,"name":"Engineering"},"position":"Accountant","base_salary":"5000.00","hired_at":"2026-01-15"}}`.

### Attendances

| Method and URL | Body | Success |
|---|---|---|
| `GET /api/v1/admin/attendances` | Optional query: `employee_id`, `date`, `from`, `to` | `200` collection |
| `POST /api/v1/admin/attendances` | `{"employee_id":7,"date":"2026-05-05","status":"present"}` | `201` resource |
| `PUT/PATCH /api/v1/admin/attendances/{attendance}` | Any fields above | `200` resource |

Status must be `present`, `absent`, or `leave`. One record per employee per date is allowed. Example: `{"data":{"id":4,"date":"2026-05-05","status":"present","employee":{"id":7,"name":"Ayna Meredova","email":"ayna@example.com"}}}`.

### Leave requests

#### `GET /api/v1/admin/leave-requests`

Body: none. Returns all requests, with employee details.

Example `200`: `{"data":[{"id":2,"start_date":"2026-06-10","end_date":"2026-06-12","reason":"Personal leave","status":"pending","admin_comment":null,"employee":{"id":7,"name":"Ayna Meredova","email":"ayna@example.com"}}]}`

#### `PATCH /api/v1/admin/leave-requests/{leaveRequest}/decide`

Body: `{"status":"approved","admin_comment":"Approved"}`. Status must be `approved` or `rejected`; comment is optional.

Example `200`: same leave request resource with its updated status and comment.

### Payrolls

#### `POST /api/v1/admin/payrolls/generate`

Body: `{"month":5,"year":2026}`. Recalculates payrolls for all employees using `PayrollCalculator` and returns the count and affected payroll resources.

Example `200`: `{"generated":12,"payrolls":[{"id":8,"month":5,"year":2026,"base_salary":"5000.00","bonus":"0.00","deduction":"0.00","tax":"500.00","net_salary":"4500.00","status":"draft","employee":{"id":7,"name":"Ayna Meredova","email":"ayna@example.com"}}]}`

#### `GET /api/v1/admin/payrolls`

Optional query: `month` (1–12), `year` (2000–2200). Returns all payrolls or matching records.

Example `200`: resource collection as in the generate response.

#### `PATCH /api/v1/admin/payrolls/{payroll}/pay`

Body: none. Marks the payroll as paid.

Example `200`: the updated payroll resource with `"status":"paid"`.
