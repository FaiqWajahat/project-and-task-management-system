# TaskFlow — Project & Team Management Platform

<div align="center">
  <h1>⚡ TaskFlow</h1>
  <p>A production-ready, full-stack project and team task management platform</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
    <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss" />
    <img src="https://img.shields.io/badge/Express.js-5-green?logo=express" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" />
    <img src="https://img.shields.io/badge/pg-Driver-blue" />
  </p>
</div>

---

## ✨ Features

- **🔐 JWT Authentication** with HttpOnly cookies and role-based access control
- **👥 Three Roles**: Admin, Project Manager, Team Member — each with a tailored dashboard
- **📊 Admin Dashboard**: User management DataTable with edit/delete/create dialogs
- **🗂 Manager Dashboard**: Project management with Recharts progress charts
- **📋 Kanban Board**: Drag-and-drop task board using `@hello-pangea/dnd`
- **📜 Activity Audit Trail**: Real-time feed of all platform actions
- **🌙 Dark/Light Mode**: Smooth theme switching with `next-themes`
- **💀 Loading Skeletons**: Shadcn skeleton components on all data-fetching states
- **✨ Beautiful Empty States**: Illustrated empty state with guided CTAs
- **⚡ React Query**: Smart caching, background refetch, optimistic UI updates

---

## 🗂 Project Structure

```
project/
├── frontend/           # Next.js 14 App Router
│   ├── src/
│   │   ├── app/        # Pages & layouts
│   │   ├── components/ # UI components
│   │   ├── hooks/      # React Query hooks
│   │   ├── lib/        # API client, utils
│   │   ├── providers/  # Context providers
│   │   └── types/      # TypeScript types
│   └── package.json
│
├── backend/            # Express.js + pg Driver
│   ├── src/
│   │   ├── config/     # db client, SQL schema, initializer
│   │   ├── controllers/# controllers (Raw SQL queries)
│   │   ├── middleware/ # auth, error handlers
│   │   ├── routes/     # endpoints
│   │   ├── schemas/    # Zod body validation
│   │   └── utils/      # JWT, password utilities
│   └── package.json
│
└── .github/
    └── workflows/
        └── main.yml   # CI/CD pipeline
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (e.g. Neon Cloud Database)
- npm

### Backend Setup

1. **Configuration**:
   Copy `.env.example` to `.env` inside the `backend/` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and insert your Neon cloud database connection string in the `DATABASE_URL` variable:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
   ```

2. **Initialize Database Tables & Seed**:
   Initialize all database tables and seed mock data directly in Neon with the following command:
   ```bash
   npm run db:init
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@taskflow.com        | password123 |
| Manager | manager@taskflow.com      | password123 |
| Member  | member@taskflow.com       | password123 |

---

## 🗄️ Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'MEMBER'::user_role,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "managerId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Join table for Many-to-Many project members relation
CREATE TABLE project_members (
  "projectId" VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
  "userId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY ("projectId", "userId")
);

CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'TODO'::task_status,
  priority priority_level DEFAULT 'MEDIUM'::priority_level,
  "projectId" VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "assigneeId" VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "projectId" VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "taskId" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/users` | Admin |
| POST | `/api/users` | Admin |
| PUT | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |
| GET | `/api/projects` | Admin/Manager |
| POST | `/api/projects` | Admin/Manager |
| GET | `/api/projects/:id` | Authenticated |
| PUT | `/api/projects/:id` | Admin/Manager |
| DELETE | `/api/projects/:id` | Admin/Manager |
| GET | `/api/tasks` | Authenticated |
| POST | `/api/tasks` | Admin/Manager |
| PUT | `/api/tasks/:id` | Admin/Manager/Member |
| DELETE | `/api/tasks/:id` | Admin/Manager |
| GET | `/api/projects/:id/activity` | Authenticated |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS v4 |
| UI Components | Shadcn UI (New York style) |
| Animations | Framer Motion |
| State/Data | TanStack React Query v5 |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + pg Driver (Neon Cloud) |
| Auth | JWT + HttpOnly cookies |
| Validation | Zod |
| CI/CD | GitHub Actions |

---

## 📄 License

MIT
