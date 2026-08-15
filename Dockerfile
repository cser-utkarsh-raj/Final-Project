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

# Entrypoint script with fast JVM startup flags and transparent logging
RUN echo '#!/bin/sh\n\
echo "=== Starting StoreBook Microservices Backend ==="\n\
java -Djava.net.preferIPv4Stack=true -XX:TieredStopAtLevel=1 -Xms32m -Xmx160m -jar /app/auth-service.jar > /tmp/auth.log 2>&1 &\n\
java -Djava.net.preferIPv4Stack=true -XX:TieredStopAtLevel=1 -Xms32m -Xmx160m -jar /app/inventory-service.jar > /tmp/inventory.log 2>&1 &\n\
java -Djava.net.preferIPv4Stack=true -XX:TieredStopAtLevel=1 -Xms32m -Xmx160m -jar /app/request-service.jar > /tmp/request.log 2>&1 &\n\
\n\
echo "Waiting 15s for Spring Boot microservices to initialize..."\n\
sleep 15\n\
\n\
echo "=== Auth Service Status ==="\n\
cat /tmp/auth.log\n\
\n\
echo "=== Starting API Gateway on 8080 ==="\n\
exec java -Djava.net.preferIPv4Stack=true -XX:TieredStopAtLevel=1 -Xms32m -Xmx160m -jar /app/api-gateway.jar\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
