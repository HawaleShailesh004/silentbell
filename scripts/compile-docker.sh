#!/usr/bin/env bash
# Compile Compact using the Linux toolchain inside Docker.
# Git-bash on Windows shadows `compact` with compact.exe — do not use the host binary.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export MSYS_NO_PATHCONV=1
docker run --rm --platform linux/amd64 \
  -v compact-toolchain:/root/.compact \
  -v "$ROOT/../tools/compact-x86_64-unknown-linux-musl:/opt/compact" \
  -v "$ROOT/../tools/zk-params:/params:ro" \
  -v "$ROOT:/work" \
  -w /work \
  debian:bookworm-slim \
  bash -lc 'export HOME=/root COMPACT_DIRECTORY=/root/.compact MIDNIGHT_PP=/root/pp
    mkdir -p /root/pp
    cp /params/bls_midnight_2p* /root/pp/ 2>/dev/null || true
    chmod +x /opt/compact/compact
    /opt/compact/compact compile contracts/silent-bell.compact contracts/managed/silent-bell'
