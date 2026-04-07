# Use Java 17 base image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Build the project
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Run the jar file
CMD sh -c 'java -jar target/*.jar'