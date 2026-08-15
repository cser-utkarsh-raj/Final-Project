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

# Entrypoint script with IPv4 enforcement and memory limits
RUN echo '#!/bin/sh\n\
echo "Starting Auth Service on 8081..."\n\
java -Djava.net.preferIPv4Stack=true -Xms32m -Xmx96m -jar /app/auth-service.jar &\n\
echo "Starting Inventory Service on 8082..."\n\
java -Djava.net.preferIPv4Stack=true -Xms32m -Xmx96m -jar /app/inventory-service.jar &\n\
echo "Starting Request Service on 8083..."\n\
java -Djava.net.preferIPv4Stack=true -Xms32m -Xmx96m -jar /app/request-service.jar &\n\
echo "Waiting 12s for microservices to initialize..."\n\
sleep 12\n\
echo "Starting API Gateway on 8080..."\n\
exec java -Djava.net.preferIPv4Stack=true -Xms32m -Xmx96m -jar /app/api-gateway.jar\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
