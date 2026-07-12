# Build stage
FROM gradle:8.5-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon

# Run stage
FROM openjdk:17-slim
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/datt.jar
ENTRYPOINT ["java", "-jar", "/app/datt.jar", "--spring.profiles.active=prod"]
