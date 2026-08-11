#!/usr/bin/env bash
# Stage 7 — THE canonical catalog fingerprint command.
#
# Two different invocations produced 663 and 664 lines for what was believed to
# be the same schema, so the invocation itself is now pinned. Anything not
# produced by this script is not a fingerprint.
#
# Defined behaviour:
#   * stdout ONLY — stderr is discarded, so a NOTICE can never enter the digest
#   * psql runs unaligned with tuples-only OFF, pager off, footer off, and an
#     explicit field separator, so no terminal or locale setting can shift it
#   * the byte stream is digested EXACTLY as psql emits it, including its
#     trailing newline; nothing is trimmed, normalised or re-wrapped
#   * "lines" means `wc -l`, i.e. the count of newline characters — a trailing
#     blank line therefore counts, which is the difference the two earlier
#     numbers disagreed about
#   * the SHA-256 is AUTHORITATIVE; the line count is a human sanity check only
#
# Usage:  scripts/db/fingerprint.sh [outfile]
set -euo pipefail

CONTAINER="${FM_DB_CONTAINER:-supabase_db_fightmetrics}"
SRC="$(cd "$(dirname "$0")" && pwd)/catalog_snapshot.sql"
OUT="${1:-/tmp/fm-fingerprint.txt}"

docker cp "$SRC" "$CONTAINER:/tmp/fm_catalog_snapshot.sql" >/dev/null

docker exec "$CONTAINER" psql \
  --username postgres --dbname postgres \
  --no-psqlrc --quiet \
  --pset=pager=off --pset=footer=off --pset=null='<NULL>' \
  --file /tmp/fm_catalog_snapshot.sql \
  2>/dev/null > "$OUT"

LINES="$(wc -l < "$OUT" | tr -d ' ')"
SHA="$(shasum -a 256 "$OUT" | awk '{print $1}')"

printf 'file   %s\nlines  %s\nsha256 %s\n' "$OUT" "$LINES" "$SHA"
