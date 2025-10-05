#!/bin/bash

echo "🧹 Cleaning up build artifacts..."

# Remove Next.js build artifacts
rm -rf apps/frontend/.next
rm -rf dist

# Remove node_modules if requested
if [ "$1" == "--deep" ]; then
    echo "🗑️  Removing node_modules (deep clean)..."
    rm -rf node_modules
    echo "✅ Deep clean complete!"
    echo "Run 'npm install' to reinstall dependencies."
else
    echo "✅ Clean complete!"
    echo ""
    echo "Tip: Run './clean.sh --deep' to also remove node_modules"
fi
