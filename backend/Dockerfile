# Stage 1: Build application with Maven
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and package artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:21.0.5_11-jre-alpine AS runtime

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy executable jar from build stage
COPY --from=build /workspace/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

