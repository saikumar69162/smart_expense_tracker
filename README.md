# React + Express + MySQL + Docker

This project contains:

- `frontend`: React website built with Vite
- `backend`: Express API connected to MySQL
- `database`: MySQL initialization script
- `docker-compose.yml`: Runs the full stack

## Run With Docker

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/api/health`

## Run Without Docker

### 1. Start MySQL

Create a MySQL database named `appdb` and run the SQL in `database/init.sql`.

### 2. Start backend

```bash
cd backend
npm install
npm run dev
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

- The frontend calls `/api` by default in Docker via Nginx reverse proxy.
- For local development, create `frontend/.env` with:

```bash
VITE_API_URL=http://localhost:5000/api
```

