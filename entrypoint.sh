#!/bin/sh
set -e

echo "==== EventSnap entrypoint started ===="

# Check DB connection variable
if [ -n "$DATABASE_URL" ]; then
  echo "Generating Prisma client..."
  npx prisma generate || echo "⚠️ Prisma generate failed (non-fatal)"

  echo "Running Prisma migrations..."
  npx prisma migrate deploy || echo "⚠️ No pending migrations or failed silently"
else
  echo "⚠️ DATABASE_URL not set, skipping Prisma commands"
fi

echo "Starting NestJS application..."
exec node dist/main.js
