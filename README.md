# Code Master - Cloud-Based Coding Workspace

Code Master is a full-stack, browser-based coding environment featuring Monaco Editor, project and file management, secure sandboxed JavaScript execution, and persistent database storage.

---

## 🌟 Key Features

- **Monaco Editor Integration**: Powered by the same editor engine as VS Code, with full syntax highlighting for JavaScript, JSON, TypeScript, HTML, and CSS.
- **Project & File Explorer**: Create, rename, delete, and switch between projects and files with real-time state synchronization.
- **Sandboxed Code Execution**: Run JavaScript programs through a secure backend API featuring execution timeouts (preventing infinite loops), memory guardrails, and captured standard output and errors.
- **Terminal & Output Panel**: Real-time display of `console.log` output, runtime exceptions, syntax errors, and execution duration (in milliseconds).
- **Authentication & Security**:
  - Secure JWT authentication and bcrypt password hashing.
  - Strict resource authorization: users can only view, modify, or execute files and projects they own.
  - Node `vm` sandboxing without host filesystem or process access.
- **Responsive Developer UX**: Dark-themed IDE with keyboard shortcuts (`Ctrl+S` to save, `Ctrl+Enter` to run code), unsaved change indicators, and clear feedback states.
- **Automated Test Suite**: Comprehensive test suite covering authentication, authorization barriers, CRUD operations, and sandbox timeout safety.

---

## 🏗️ Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   React 18 + Monaco Editor  │
                          │   (Vite + Tailwind CSS UI)  │
                          └──────────────┬──────────────┘
                                         │ REST API / JWT
                                         ▼
                          ┌─────────────────────────────┐
                          │     Express.js API Server   │
                          │      (Node.js REST API)     │
                          └──────┬───────────────┬──────┘
                                 │               │
                     Prisma ORM  │               │ Isolated VM Context
                                 ▼               ▼
                      ┌──────────────────┐  ┌───────────────────────┐
                      │  SQLite Database │  │ Node.js VM Sandbox    │
                      │ (Users, Projects,│  │ (Stdout/stderr capture│
                      │      Files)      │  │  & execution timeout) │
                      └──────────────────┘  └───────────────────────┘
```

### Component Breakdown

1. **Frontend (`/client`)**:
   - **React 18 & Vite**: Fast compilation and modern React patterns.
   - **`@monaco-editor/react`**: Monaco Editor instance with automatic language detection, change detection, and shortcut listeners.
   - **Context Architecture**: `AuthContext` manages user sessions; `WorkspaceContext` manages projects, open files, unsaved changes, and execution output.
   - **Tailwind CSS & Lucide Icons**: VS Code-inspired dark theme with responsive layout.

2. **Backend (`/server`)**:
   - **Express.js**: REST API routing with structured error handling.
   - **Prisma ORM & SQLite**: File-based zero-configuration relational database with foreign-key cascade deletes.
   - **Auth Middleware**: JWT validation on protected routes (`/api/projects`, `/api/files`, `/api/execute`).
   - **Executor Engine (`src/services/executor.js`)**: Executes code inside isolated `vm` context with standard library primitives, stripped process/filesystem access, output capture, and execution timeouts.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher; tested on v22)
- npm (v9 or higher)

### 1. One-Step Setup

From the project root, run:

```bash
npm run setup
```

This command will:
1. Install server dependencies.
2. Generate Prisma Client and create the SQLite database (`server/dev.db`).
3. Run the database seed script to populate a demo account with sample code.
4. Install client dependencies.

### 2. Run in Development Mode

Start both the backend API (port 5000) and frontend client (port 3000) concurrently:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Account Credentials

A pre-seeded account is available for instant testing:

- **Email**: `demo@codemaster.dev`
- **Password**: `password123`

You can also click the **"One-Click Demo Account"** button directly inside the login modal, or register a new account.

---

## 🧪 Automated Testing

The repository includes an automated test suite verifying healthchecks, authentication flows, resource authorization barriers, CRUD operations, and execution error/timeout safety.

Run the test suite:

```bash
npm test
```

### Test Coverage Highlights:
- ✅ **Registration & Login**: Credentials validation, password hashing, duplicate email rejection (409).
- ✅ **Authorization Barriers**: Ensures User B cannot read, rename, or delete User A's projects or files (404).
- ✅ **Project & File CRUD**: Create, list, rename, and delete projects and files; duplicate file detection.
- ✅ **Code Execution**: Standard output capture (`console.log`), syntax errors, runtime exceptions (`TypeError`).
- ✅ **Sandbox Timeout Protection**: Validates that infinite loops (`while(true){}`) terminate gracefully without crashing the server.

---

## ⚙️ Environment Variables

### Server Configuration (`server/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express backend server |
| `DATABASE_URL` | `"file:./dev.db"` | SQLite database file location |
| `JWT_SECRET` | `"super-secret-jwt-key..."` | Secret key used for signing JWT tokens |
| `NODE_ENV` | `development` | Node environment |

*(A template is provided in `server/.env.example`)*

---

## 📡 REST API Documentation

All protected routes require the `Authorization: Bearer <token>` header.

### Authentication

#### `POST /api/auth/register`
Creates a new user account and generates a welcome project.
- **Request Body**: `{ "email": "user@example.com", "password": "password123", "name": "Alice" }`
- **Response `201`**: `{ "token": "...", "user": { "id": "...", "email": "...", "name": "..." } }`

#### `POST /api/auth/login`
Authenticates user and returns JWT token.
- **Request Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response `200`**: `{ "token": "...", "user": { ... } }`

#### `GET /api/auth/me`
Returns details of the currently authenticated user.

---

### Projects

#### `GET /api/projects`
Lists all projects belonging to the authenticated user.
- **Response `200`**: `{ "projects": [ { "id": "...", "name": "...", "_count": { "files": 2 } } ] }`

#### `POST /api/projects`
Creates a new project with an initial `index.js`.
- **Request Body**: `{ "name": "Algorithms", "description": "Lab work" }`
- **Response `201`**: `{ "project": { ... } }`

#### `GET /api/projects/:id`
Returns project details along with all files.

#### `PUT /api/projects/:id`
Renames or updates project details.
- **Request Body**: `{ "name": "Updated Name", "description": "New description" }`

#### `DELETE /api/projects/:id`
Deletes a project and all associated files (cascade delete).

---

### Files

#### `POST /api/projects/:projectId/files`
Creates a new file in the specified project.
- **Request Body**: `{ "name": "helper.js", "content": "console.log('test');" }`
- **Response `201`**: `{ "file": { ... } }`

#### `GET /api/files/:id`
Retrieves a specific file by ID.

#### `PUT /api/files/:id`
Updates file name (rename) and/or file content (saving).
- **Request Body**: `{ "name": "newname.js", "content": "console.log('saved');" }`

#### `DELETE /api/files/:id`
Permanently deletes a file.

---

### Code Execution

#### `POST /api/execute`
Executes JavaScript code in the sandboxed environment.
- **Request Body**:
  ```json
  {
    "code": "const a = 10; const b = 20; console.log(a + b);",
    "language": "javascript"
  }
  ```
- **Response `200` (Success)**:
  ```json
  {
    "success": true,
    "output": "30",
    "error": null,
    "executionTimeMs": 4
  }
  ```
- **Response `200` (Runtime / Timeout Error)**:
  ```json
  {
    "success": false,
    "output": "",
    "error": "Execution Timeout: Code took longer than 4000ms to complete.",
    "executionTimeMs": 4015
  }
  ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + S` / `Cmd + S` | Save current file content to database |
| `Ctrl + Enter` / `Cmd + Enter` | Run JavaScript code in Monaco Editor |

---

## 🔒 Security & Code Execution Details

- **Execution Isolation**: Code runs within Node.js `vm.createContext()` with restricted globals. Access to `process`, `require`, `fs`, `child_process`, and the host environment is completely omitted.
- **Execution Timeouts**: A hard limit (default 4000ms) terminates infinite loops and runaway code safely without impacting the API server.
- **Output Guardrails**: Output log arrays and character lengths are capped to prevent memory exhaustion from runaway loops.
- **Strict Tenant Isolation**: All file and project queries check `userId === req.user.id`, ensuring users cannot read or modify another user's work.

---

## 📁 Project Structure

```
trialproj/
├── client/                     # Frontend React + Vite + Monaco Editor
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, MonacoWorkspace, TerminalPanel, Modals
│   │   ├── context/            # AuthContext and WorkspaceContext
│   │   ├── api.js              # API fetch service
│   │   ├── App.jsx             # Main IDE layout & landing page
│   │   └── main.jsx            # React root
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Project, File)
│   │   └── dev.db              # SQLite database (auto-generated)
│   ├── src/
│   │   ├── middleware/         # JWT authentication middleware
│   │   ├── routes/             # Auth, Projects, Files, and Execution endpoints
│   │   ├── services/           # Prisma client & sandboxed executor
│   │   ├── app.js              # Express app configuration
│   │   ├── server.js           # Server listen entrypoint
│   │   └── seed.js             # Database seeder (demo account)
│   ├── tests/
│   │   └── api.test.js         # Vitest + Supertest automated tests
│   └── package.json
├── package.json                # Root package with unified scripts
├── .gitignore
└── README.md
```
