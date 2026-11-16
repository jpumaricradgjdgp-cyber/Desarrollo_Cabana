# 1) Compila el frontend Angular
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend-angular/package.json frontend-angular/package-lock.json ./
RUN npm ci
COPY frontend-angular/ ./
RUN npm run build

# 2) Compila el backend Spring Boot y empaqueta el frontend como contenido estatico
FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY --from=web /web/dist frontend-angular/dist
RUN mvn -B -ntp -f backend/pom.xml package -DskipTests

# 3) Imagen final solo con el JRE
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/cabana-1.0.0.jar app.jar
USER 10001
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=supabase
ENTRYPOINT ["java","-jar","app.jar"]
