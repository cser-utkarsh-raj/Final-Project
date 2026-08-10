# Stage 1: Build all Maven backend modules
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /project
COPY backend ./backend
RUN mvn -f backend/pom.xml clean package -DskipTests

# Stage 2: Single Unified Microservices Runtime Container
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /project/backend/auth-service/target/*.jar auth-service.jar
COPY --from=builder /project/backend/inventory-service/target/*.jar inventory-service.jar
COPY --from=builder /project/backend/request-service/target/*.jar request-service.jar
COPY --from=builder /project/backend/api-gateway/target/*.jar api-gateway.jar

# Entrypoint script to launch all 4 microservices together in 1 container
RUN echo '#!/bin/sh\n\
java -jar /app/auth-service.jar &\n\
java -jar /app/inventory-service.jar &\n\
java -jar /app/request-service.jar &\n\
sleep 6\n\
exec java -jar /app/api-gateway.jar\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
