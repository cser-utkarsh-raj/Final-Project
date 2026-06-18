# High-Level Design (HLD)

## 1. System Architecture

The Stationery Management System is designed as a microservices architecture. It contains a React frontend and several backend services coordinated via service discovery and gateway routing.

```mermaid
graph TD
    UI[React + Vite Frontend\nPort: 5175]
    GW[API Gateway\nPort: 8080]
    DS[Eureka Discovery Server\nPort: 8761]
    CS[Config Server\nPort: 8888]
    
    MS_AUTH[Auth Service\nPort: 8081]
    MS_INV[Inventory Service\nPort: 8082]
    MS_REQ[Request Service\nPort: 8083]
    
    DB_AUTH[(MySQL: authdb)]
    DB_INV[(MySQL: inventorydb)]
    DB_REQ[(MySQL: requestdb)]

    UI -->|HTTP/REST| GW
    GW -->|Route: /api/auth/**| MS_AUTH
    GW -->|Route: /api/items/**| MS_INV
    GW -->|Route: /api/requests/**| MS_REQ
    
    MS_AUTH -.->|Register/Discover| DS
    MS_INV -.->|Register/Discover| DS
    MS_REQ -.->|Register/Discover| DS
    GW -.->|Route Mapping| DS
    
    MS_AUTH -->|JDBC| DB_AUTH
    MS_INV -->|JDBC| DB_INV
    MS_REQ -->|JDBC| DB_REQ
    
    MS_REQ -->|Feign Inter-service call| MS_INV
```

## 2. Component Explanations

- **React Frontend**: A single-page application built with Vite and React that allows students to view inventory and submit requests, and admins to manage inventory and approve/reject requests.
- **API Gateway (Spring Cloud Gateway)**: Serves as the single entry point. Handles routing, cross-origin resource sharing (CORS), and load balancing to backend microservices.
- **Discovery Server (Netflix Eureka Server)**: Registers all backend services dynamically so they can locate each other using hostnames rather than hardcoded URLs.
- **Config Server (Spring Cloud Config Server)**: Centralized configuration server.
- **Auth Service**: Manages user authentication and registration. Uses BCrypt to secure passwords and generates JWTs for authentication.
- **Inventory Service**: Manages stationery catalog items.
- **Request Service**: Handles request lifecycle from submission, tracking, to stores office approval/rejection. Communicates with Inventory Service to deduct stock when approved.

## 3. Deployment Diagram

```mermaid
graph TB
    subgraph "Docker Compose Network (ci-cd_default)"
        front[frontend container\nPort: 5175]
        gw[api-gateway container\nPort: 8080]
        discovery[discovery-server container\nPort: 8761]
        config[config-server container\nPort: 8888]
        auth[auth-service container\nPort: 8081]
        inv[inventory-service container\nPort: 8082]
        req[request-service container\nPort: 8083]
        mysql[mysql-db container\nPort: 3306]
    end

    host[Host Machine] -->|Port 5175| front
    host -->|Port 8080| gw
    host -->|Port 8761| discovery
    
    front --> gw
    gw --> discovery
    gw --> auth
    gw --> inv
    gw --> req
    
    auth --> mysql
    inv --> mysql
    req --> mysql
```
