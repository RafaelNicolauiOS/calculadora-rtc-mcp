#!/usr/bin/env bash
# Sobe as três APIs a partir de dist/ (gerado por scripts/build.sh), sem Docker.
#   regime-regular   -> http://localhost:${RTC_REGIME_PORT:-8080}/api   (métricas 9101)
#   simples-nacional -> http://localhost:${RTC_SIMPLES_PORT:-8082}/api  (métricas 9103)
#   gerador-danfse   -> http://localhost:${RTC_DANFSE_PORT:-8090}/api
#   proxy CORS       -> http://localhost:8079/{regime,simples,danfse}/  (desligue com RTC_PROXY=0)
# Ctrl+C encerra as três.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
[ -f "$DIST/api-regime-geral.jar" ] || { echo "Rode scripts/build.sh antes." >&2; exit 1; }

if ! "${JAVA_HOME:-/nonexistent}/bin/java" -version 2>&1 | grep -qE 'version "(2[5-9]|[3-9][0-9])'; then
  for cand in "$ROOT"/.tools/jdk-25*/Contents/Home "$ROOT"/.tools/jdk-25*; do
    if [ -x "$cand/bin/java" ]; then export JAVA_HOME="$cand"; break; fi
  done
fi
JAVA="${JAVA_HOME:?Java 25 não encontrado}/bin/java"

# As APIs Java leem o banco em ./calculadora/db/ relativo ao diretório de trabalho.
cd "$DIST"

# -XX:-UseBASE64Intrinsics: mitigação recomendada no CHANGELOG do simples-nacional 1.0.1.
JOPTS=(-XX:-UseBASE64Intrinsics -Dspring.profiles.active=offline)

pids=()
trap 'kill "${pids[@]}" 2>/dev/null || true' EXIT INT TERM

"$JAVA" "${JOPTS[@]}" -Dserver.port="${RTC_REGIME_PORT:-8080}" -jar api-regime-geral.jar &
pids+=($!)
"$JAVA" "${JOPTS[@]}" -Dserver.port="${RTC_SIMPLES_PORT:-8082}" -jar api-simples-nacional.jar &
pids+=($!)
SERVER_PORT="${RTC_DANFSE_PORT:-8090}" ./danfse-service &
pids+=($!)

# Proxy com CORS na porta 8079, usado pelo site (GitHub Pages) para chamar as APIs locais.
if command -v node >/dev/null 2>&1 && [ "${RTC_PROXY:-1}" != "0" ]; then
  RTC_REGIME_URL="http://localhost:${RTC_REGIME_PORT:-8080}/api" \
  RTC_SIMPLES_URL="http://localhost:${RTC_SIMPLES_PORT:-8082}/api" \
  RTC_DANFSE_URL="http://localhost:${RTC_DANFSE_PORT:-8090}/api" \
    node "$ROOT/scripts/cors-proxy.mjs" &
  pids+=($!)
fi

wait
