#!/usr/bin/env bash
# Compila as três APIs da Calculadora RTC a partir dos submódulos em upstream/.
# Saída: dist/ com os dois JARs, o binário e o WASM do DANFSe e o banco em dist/calculadora/db/.
#
# Requisitos: Java 25 (JAVA_HOME ou .tools/jdk-25*), Go 1.27+, git submodules inicializados.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
UP="$ROOT/upstream"

# Usa o JDK local em .tools/ quando o JAVA_HOME não aponta para Java 25+.
if ! "${JAVA_HOME:-/nonexistent}/bin/java" -version 2>&1 | grep -qE 'version "(2[5-9]|[3-9][0-9])'; then
  LOCAL_JDK=""
  for cand in "$ROOT"/.tools/jdk-25*/Contents/Home "$ROOT"/.tools/jdk-25*; do
    if [ -x "$cand/bin/java" ]; then LOCAL_JDK="$cand"; break; fi
  done
  if [ -n "$LOCAL_JDK" ]; then
    export JAVA_HOME="$LOCAL_JDK"
  else
    echo "ERRO: Java 25 não encontrado. Defina JAVA_HOME ou coloque um JDK 25 em .tools/." >&2
    exit 1
  fi
fi
export PATH="$JAVA_HOME/bin:$PATH"
echo ">> Java: $(java -version 2>&1 | head -1)"

git -C "$ROOT" submodule update --init --recursive
mkdir -p "$DIST/calculadora/db"

echo ">> [1/4] Banco de dados (Flyway, a partir do regime-regular)"
(
  cd "$UP/regime-regular"
  rm -rf ./calculadora/db && mkdir -p ./calculadora/db
  ./mvnw -q flyway:migrate -Dflyway.configFiles=./flyway/flyway-pro.conf --batch-mode --errors
  cp ./calculadora/db/calculadora-pro.db "$DIST/calculadora/db/calculadora-pro.db"
)

echo ">> [2/4] JAR regime-regular"
(cd "$UP/regime-regular" && ./mvnw -q clean package -DskipTests --batch-mode && cp target/api-regime-geral.jar "$DIST/")

echo ">> [3/4] JAR simples-nacional"
(cd "$UP/simples-nacional" && ./mvnw -q clean package -DskipTests --batch-mode && cp target/api-simples-nacional.jar "$DIST/")

echo ">> [4/4] Binário e WASM do gerador de DANFSe"
(
  cd "$UP/gerador-danfse"
  go build -ldflags="-s -w" -o "$DIST/danfse-service" ./cmd/danfse
  GOOS=js GOARCH=wasm CGO_ENABLED=0 go build -ldflags="-s -w" -o "$DIST/danfse.wasm" ./cmd/danfse-wasm
  GOROOT="$(go env GOROOT)"
  cp "$GOROOT/lib/wasm/wasm_exec.js" "$DIST/" 2>/dev/null || cp "$GOROOT/misc/wasm/wasm_exec.js" "$DIST/"
)

echo ">> Pronto:"
ls -lh "$DIST" "$DIST/calculadora/db"
