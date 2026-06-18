# College University Stationery Management System

This project is a five-day capstone build for a college stationery store. It uses Spring Boot microservices, Spring Cloud, JWT security, a React UI, Docker, and a Jenkins pipeline.

## Modules

```text
backend/
  discovery-server
  config-server
  api-gateway
  auth-service
  inventory-service
  request-service
frontend/


ci-cd/
docs/
```

## Main Features

- Student and admin registration/login with BCrypt and JWT.
- Role-based API access for ADMIN and STUDENT.
- Inventory catalog with pagination and low-stock flags.
- Admin item creation and updates with audit logs.
- Student request submission with multiple request lines.
- Student request tracking by status.
- Admin approval/rejection. Approval deducts stock through Feign-based inter-service communication.
- Service registry, gateway routing, Dockerfiles, Docker Compose, and Jenkins CI/CD pipeline.

## Demo Users

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@college.edu | Admin@123 |
| Student | student@college.edu | Student@123 |

## Run Backend Locally

Start services in this order:

```bash
cd backend
mvn clean package
mvn -pl discovery-server spring-boot:run
mvn -pl config-server spring-boot:run
mvn -pl auth-service spring-boot:run
mvn -pl inventory-service spring-boot:run
mvn -pl request-service spring-boot:run
mvn -pl api-gateway spring-boot:run
```

Gateway URL:

```text
http://localhost:8080
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

React UI:

```text
http://localhost:5175
```

## Run With Docker

Package backend jars first:

```bash
cd backend
mvn clean package
```

Then:

```bash
docker compose -f ci-cd/docker-compose.yml up --build
```

## Tests

```bash
cd backend
mvn test
```

The service-layer tests use JUnit 5 and Mockito.

## Documentation

- API endpoints: `docs/api-contract.md`
- Database schema: `docs/database-schema.md`
- Environment setup: `docs/environment.md`
