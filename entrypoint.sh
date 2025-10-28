#!/usr/bin/env sh
set -e

# If DATABASE_URL is set, try to run prisma migrations (deploy)
if [ -n "$DATABASE_URL" ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy || true
fi

echo "Starting application"
node dist/main.js
