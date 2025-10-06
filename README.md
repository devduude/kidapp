# Kidapp Microservice Architecture

A full-stack microservice application built with **Nx monorepo**, **NestJS**, **Next.js**, **TypeScript**, and **PostgreSQL**, orchestrated with Docker.

## 🏗️ Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Monorepo**: Nx workspace for efficient development
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Node.js 20+ (for local development)
- Git (optional)

```bash
cp .env.example .env
```

### Option 1: Docker (Recommended)

Start everything with one command:

```bash
npm run docker:up
# or
docker compose up -d
```

This starts:
- **PostgreSQL** on `http://localhost:5432`
- **Backend API** on `http://localhost:3000/api/v1/docs`
- **Frontend** on `http://localhost:4200`

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start database:**
   ```bash
   npm run dev
   ```

3. **Seed database:**
   ```bash
   npm run db:setup 
   ```

4. **Run backend** (in new terminal):
   ```bash
   npm run dev:backend
   ```

5. **Run frontend** (in new terminal):
   ```bash
   npm run dev:frontend
   ```


## 📄 License
MIT
