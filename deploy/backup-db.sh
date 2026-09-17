#!/usr/bin/env bash
# Single-threaded pg_dump (no -j — that adds memory/connection overhead this
# 4GB box doesn't need to spend), gzip'd, rotated locally. Meant to run via
# cron on the VPS. See the deploy runbook for the crontab line.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

set -a
source .env
set +a

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/chezarnaud-$TIMESTAMP.sql.gz"

find "$BACKUP_DIR" -name "chezarnaud-*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

echo "Backup complete: $BACKUP_DIR/chezarnaud-$TIMESTAMP.sql.gz"
