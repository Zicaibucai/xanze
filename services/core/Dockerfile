FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml maven-settings.xml ./
RUN mvn -s maven-settings.xml -B -q dependency:go-offline
COPY src ./src
RUN mvn -s maven-settings.xml -B -q package -DskipTests

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app
COPY --from=build /workspace/target/xanze-core-*.jar app.jar
EXPOSE 8080
USER 10001
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
