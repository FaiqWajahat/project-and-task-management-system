-- Drop existing tables to allow clean re-initialization
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS task_assignees CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;

-- Create Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create Tables
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
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Join table for Many-to-Many task assignees relation
CREATE TABLE task_assignees (
  "taskId" VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  "userId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY ("taskId", "userId")
);

CREATE TABLE activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "projectId" VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "taskId" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
