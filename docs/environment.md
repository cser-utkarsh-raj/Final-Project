# Environment Configuration

## Development

The default `application.yml` files run each service on an in-memory H2 database.

| Service | Port |
| --- | --- |
| discovery-server | 8761 |
| config-server | 8888 |
| api-gateway | 8080 |
| auth-service | 8081 |
| inventory-service | 8082 |
| request-service | 8083 |
| frontend | 5175 |

## Test

Use:

```bash
cd backend
mvn test
```

The current tests use Mockito for service-layer logic and do not require a running database.

## Production Notes

Set these variables in Jenkins, Docker Compose, or the target platform:

| Variable | Purpose |
| --- | --- |
| JWT_SECRET | Shared HMAC signing key |
| EUREKA_URL | Service registry URL |
| AUTH_SERVICE_URL | Gateway route target |
| INVENTORY_SERVICE_URL | Gateway and request-service target |
| REQUEST_SERVICE_URL | Gateway route target |
| VITE_API_BASE_URL | Frontend API base URL |

For production databases, replace the H2 datasource URL in each service with a MySQL or PostgreSQL URL and set `spring.jpa.hibernate.ddl-auto=validate` after schema migration is introduced.
