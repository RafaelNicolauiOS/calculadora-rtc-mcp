# Imagem para as APIs Java da Calculadora RTC (regime-regular e simples-nacional).
# Contexto de build: raiz deste repositório.
#   docker build -f docker/java.Dockerfile --build-arg MODULE=regime-regular   --build-arg JAR=api-regime-geral.jar     -t rtc-regime .
#   docker build -f docker/java.Dockerfile --build-arg MODULE=simples-nacional --build-arg JAR=api-simples-nacional.jar -t rtc-simples .

# --- Banco SQLite gerado pelas migrations Flyway do regime-regular (compartilhado pelos dois módulos)
FROM eclipse-temurin:25-jdk AS db
WORKDIR /src
COPY upstream/regime-regular/ ./
RUN mkdir -p calculadora/db \
 && ./mvnw -q flyway:migrate -Dflyway.configFiles=./flyway/flyway-pro.conf --batch-mode --errors

# --- JAR do módulo
FROM eclipse-temurin:25-jdk AS build
ARG MODULE
ARG JAR
WORKDIR /src
COPY upstream/${MODULE}/ ./
RUN ./mvnw -q clean package -DskipTests --batch-mode && cp target/${JAR} /app.jar

# --- Runtime
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --uid 10001 rtc
COPY --from=db /src/calculadora/db/calculadora-pro.db /app/calculadora/db/calculadora-pro.db
COPY --from=build /app.jar /app/app.jar
USER rtc
ENV JAVA_TOOL_OPTIONS="-XX:-UseBASE64Intrinsics -XX:MaxRAMPercentage=75"
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=offline", "-Dserver.port=8080", "-jar", "/app/app.jar"]
