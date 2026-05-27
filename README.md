<div align="center">

# 🎯 FocusFlow

### Personal Task Management System

A modern, high-performance fullstack TypeScript application for personal productivity — featuring secure authentication, full CRUD task operations, smart filtering, live search, weekly analytics, and local network support.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

### 🌐 [Live Demo → task-management-mustaqim.netlify.app](https://task-management-mustaqim.netlify.app/)

</div>

---

## 📌 Overview

FocusFlow is structured as a **monorepo** with two primary packages:

| Package | Description |
|---|---|
| `Backend/` | Node.js RESTful API — Express, Prisma, MySQL, Redis |
| `Frontend/` | React SPA — Vite, React Router 7, Lucide Icons, Custom CSS |

---

## ✨ Features

### 🔒 User Authentication
- **Register** — Name, unique email, and validated password
- **Login** — Secure login with signed JWT token
- **Logout** — Token blacklisted in Redis (1-day TTL) for server-side invalidation
- **Route Protection** — All dashboard routes and API endpoints require a valid token

### 📋 Task Management (CRUD)
- **Create** — Quick modal to create tasks with title, description, and optional due date
- **Read** — View all personal tasks with status badges and deadline alerts
- **Update** — Edit title, description, status, and deadline (cleared fields are properly nullified)
- **Delete** — Custom animated confirmation modal before permanent deletion

### 🔍 Advanced Filtering & Sorting
- **Tab Filters** — Filter by status: *All*, *Pending*, *In Progress*, *Done*
- **Deadline Filters** — Multi-select: *Overdue*, *Has Deadline*, *No Deadline*
- **Deadline Sort** — Cycle between *Ascending*, *Descending*, or *Default* order
- **Live Search** — Debounced search querying task titles in real time
- **Pagination** — Navigate results with 5 items per page

### 🎨 Responsive Design & UX
- Styled with **pure Vanilla CSS** — no heavy frameworks, full design control
- **Fluid Sidebar** — Collapses to a slide-in drawer with backdrop blur on mobile/tablet
- **Adaptive Layout** — Scales cleanly down to 320px width
- **Visual Cues** — Overdue tasks highlighted with warning borders and alert badges

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime & language |
| Express.js | HTTP framework |
| MySQL + Prisma | Database & ORM |
| Redis | JWT blacklist / session cache |
| Swagger UI | API documentation |
| Jest + Supertest | Testing |
| Docker | Containerization |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework & language |
| Vite | Build tool & dev server |
| React Router 7 | Client-side routing |
| Lucide React | Icon library |
| Custom CSS | Styling (variables, flexbox, grid) |

---

## ⚙️ Setup & Installation

### Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [MySQL Server](https://www.mysql.com/)
- [Redis Server](https://redis.io/) *(or a cloud-hosted instance like [Upstash](https://upstash.com/))*

---

### 1️⃣ Backend Setup

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install
```

Create a `.env` file inside `Backend/` (refer to `.env.example`):

```env
PORT=5000
DATABASE_URL="mysql://username:password@localhost:3306/task_management_system"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="1d"
REDIS_URL="redis://localhost:6379"
```

```bash
# Run Prisma migrations to initialize the database
npx prisma migrate dev

# Start the development server
npm run dev
```

> API runs at **http://localhost:5000/**

```bash
# Run tests
npm run test
```

---

### 2️⃣ Frontend Setup

```bash
# Navigate to the frontend directory
cd ../Frontend

# Install dependencies
npm install
```

Create a `.env` file inside `Frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the Vite development server
npm run dev

# Or expose to local network (for mobile/tablet testing)
npm run dev -- --host
```

> App runs at **http://localhost:5173/**

---

### 3️⃣ Docker Compose (Full Stack)

Spin up the entire stack — API, React app, MySQL, and Redis — in one command:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api-docs |

---

## 📖 API Documentation

With the backend running, interactive Swagger documentation is available at:

**👉 http://localhost:5000/api-docs**

### Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT |
| `POST` | `/api/auth/logout` | Invalidate current token |
| `GET` | `/api/tasks` | Get tasks (supports `page`, `status`, `limit`, `search`) |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

---

<div align="center">

Made with ❤️ using TypeScript, React, and Node.js

</div>
