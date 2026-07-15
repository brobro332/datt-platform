# Build stage
FROM gradle:8.5-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon

# Run stage
FROM eclipse-temurin:17-jre
EXPOSE 8080
WORKDIR /app
RUN mkdir -p /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/datt.jar
ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-jar", "/app/datt.jar", "--spring.profiles.active=prod"]
