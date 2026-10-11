FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY frontend frontend
RUN mvn -B -ntp -f backend/pom.xml package -DskipTests
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/cabana-1.0.0.jar app.jar
USER 10001
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=supabase
ENTRYPOINT ["java","-jar","app.jar"]
