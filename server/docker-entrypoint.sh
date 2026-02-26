#!/bin/sh
set -e
# Give MongoDB a moment to accept connections
sleep 3
# Skip seed when using real/production data (set SKIP_SEED=true or 1)
if [ "$SKIP_SEED" = "true" ] || [ "$SKIP_SEED" = "1" ]; then
  echo "SKIP_SEED set: using existing database (no seed)."
else
  SEEDED_FILE="/app/uploads/.seeded"
  if [ ! -f "$SEEDED_FILE" ]; then
    echo "First run: seeding database (admin user + sample books)..."
    node seed.js && touch "$SEEDED_FILE"
    echo "Seed done."
  fi
fi
exec node index.js
