# Database Schema

Each service owns its data. H2 is used for local development, and the JPA entities are ready to point at MySQL or PostgreSQL in a production profile.

## auth-service

`users`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint | Primary key |
| full_name | varchar | Required |
| email | varchar | Required, unique |
| password | varchar | BCrypt hash |
| role | varchar | ADMIN or STUDENT |
| created_at | timestamp | Registration time |

## inventory-service

`stationery_items`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint | Primary key |
| name | varchar | Required |
| category | varchar | PAPER, PEN, PENCIL, NOTEBOOK, MARKER, FILE, ERASER, OTHER |
| unit | varchar | piece, ream, packet |
| available_quantity | integer | Current stock |
| minimum_quantity | integer | Low-stock threshold |
| updated_at | timestamp | Last inventory change |

`audit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint | Primary key |
| action | varchar | ITEM_CREATED, ITEM_UPDATED, STOCK_DEDUCTED |
| actor_email | varchar | User responsible for change |
| item_id | bigint | Related item |
| details | varchar | Human-readable audit detail |
| created_at | timestamp | Audit time |

## request-service

`stationery_requests`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint | Primary key |
| student_id | bigint | From JWT claim |
| student_email | varchar | From JWT subject |
| status | varchar | PENDING, APPROVED, REJECTED, FULFILLED |
| rejection_reason | varchar | Filled only on rejection |
| created_at | timestamp | Request time |
| updated_at | timestamp | Last status change |

`request_lines`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint | Primary key |
| request_id | bigint | Foreign key to stationery_requests |
| item_id | bigint | Inventory item reference |
| item_name | varchar | Snapshot for request history |
| quantity | integer | Requested quantity |

`request_audit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigint | Primary key |
| request_id | bigint | Related request |
| action | varchar | REQUEST_SUBMITTED, REQUEST_APPROVED, REQUEST_REJECTED |
| actor_email | varchar | Student or admin |
| details | varchar | Status-change note |
| created_at | timestamp | Audit time |
