FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /project
COPY backend/pom.xml ./backend/
COPY backend/api-gateway/pom.xml ./backend/api-gateway/
COPY backend/auth-service/pom.xml ./backend/auth-service/
COPY backend/inventory-service/pom.xml ./backend/inventory-service/
COPY backend/request-service/pom.xml ./backend/request-service/
COPY backend/discovery-server/pom.xml ./backend/discovery-server/
COPY backend/config-server/pom.xml ./backend/config-server/
COPY backend/discovery-server/src ./backend/discovery-server/src
RUN mvn -f backend/pom.xml clean package -pl discovery-server -am -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /project/backend/discovery-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","app.jar"]
