#!/bin/bash

echo "🚀 Starting Kidapp Microservice Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✨ All services are ready!"
echo ""
echo "You can now run:"
echo "  • Backend:  npx nx serve backend"
echo "  • Frontend: npx nx serve frontend"
echo ""
echo "Or run everything with Docker:"
echo "  docker-compose up --build"
echo ""
