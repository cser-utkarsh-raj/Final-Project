# Low-Level Design (LLD)

## 1. Sequence Diagram: Student Request & Admin Approval Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    actor Admin
    participant Gateway as API Gateway (8080)
    participant Auth as Auth Service (8081)
    participant Req as Request Service (8083)
    participant Inv as Inventory Service (8082)
    participant DB as MySQL Database
    
    Student->>Gateway: POST /api/auth/login
    Gateway->>Auth: Forward LoginRequest
    Auth->>DB: Find user by email
    DB-->>Auth: User Entity (hashed password)
    Auth->>Auth: Verify password (BCrypt) & Generate JWT
    Auth-->>Gateway: AuthResponse (JWT + details)
    Gateway-->>Student: AuthResponse (JWT + details)
    
    Student->>Gateway: GET /api/items (with JWT)
    Gateway->>Gateway: Validate routing
    Gateway->>Inv: Forward Request (Authorization Header)
    Inv->>Inv: JwtAuthFilter extracts credentials
    Inv->>DB: Query items page
    DB-->>Inv: Page<StationeryItem>
    Inv-->>Gateway: Page<ItemResponse>
    Gateway-->>Student: Page<ItemResponse>
    
    Student->>Gateway: POST /api/requests (with JWT)
    Gateway->>Req: Forward SubmitRequest
    Req->>Req: JwtAuthFilter extracts Student email/ID
    Req->>DB: Save new StationeryRequest (PENDING)
    DB-->>Req: Saved Request Entity
    Req-->>Gateway: RequestResponse
    Gateway-->>Student: RequestResponse
    
    Admin->>Gateway: POST /api/requests/{id}/approve (with JWT)
    Gateway->>Req: Forward Approve Request
    Req->>Req: Validate Admin permissions
    Req->>Inv: Feign Client call: POST /api/items/deduct (Forward Auth Header)
    Inv->>Inv: Validate Admin role
    Inv->>DB: Deduct available quantity from item
    DB-->>Inv: Save updated item
    Inv-->>Req: HTTP 204 No Content
    Req->>DB: Update request status to APPROVED
    DB-->>Req: Save request
    Req-->>Gateway: RequestResponse (APPROVED)
    Gateway-->>Admin: RequestResponse (APPROVED)
```

## 2. Security Design (JWT Validation)

All secured requests require a valid JSON Web Token (JWT) in the HTTP `Authorization` header under the `Bearer ` format.

- The gateway intercepts requests and forwards the `Authorization` header.
- Each downstream microservice contains a `JwtAuthFilter` extending Spring's `OncePerRequestFilter`.
- `JwtAuthFilter` parses and verifies the JWT signature against the configured `jwt.secret`.
- Roles (`ROLE_STUDENT` or `ROLE_ADMIN`) and student metadata (`userId`, `actorEmail`) are extracted from the claims and set in the Spring `SecurityContextHolder`.

## 3. Inter-service Communication

- The `Request Service` communicates with the `Inventory Service` using **Spring Cloud OpenFeign**.
- Feign clients are configured with a `RequestInterceptor` (`FeignConfig.java`) that automatically copy the `Authorization` header from the current incoming controller thread context to the outgoing Feign request. This preserves the security context of the user (specifically the Administrator role required for stock deduction).
