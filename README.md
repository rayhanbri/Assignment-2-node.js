# Issue Tracking System API

A comprehensive issue tracking REST API built with Express.js and PostgreSQL. Manage users, authenticate securely, and track issues with role-based access control.

## 📋 Project Information

- **Project Name:** Issue Tracking System API
- **Version:** 1.0.0
- **Author:** Rayhanx
- **Live URL:** http://localhost:5000 (Local Development)

---

## ✨ Features

### User Management
- User registration with secure password hashing (bcryptjs)
- User authentication with JWT tokens
- Role-based access control (Maintainer & Contributor)

### Issue Management
- Create issues (Maintainer & Contributor)
- View issue details with reporter information
- Update issues with access control:
  - **Maintainer**: Can update any issue
  - **Contributor**: Can only update their own issues with "open" status
- Delete issues (Maintainer only)
- Update issue title, description, type, and status

### Security
- JWT-based authentication
- Password encryption with bcryptjs
- Role-based authorization middleware
- Input validation and error handling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Language** | TypeScript |
| **Framework** | Express.js 5.2.1 |
| **Database** | PostgreSQL 8.21.0 |
| **Authentication** | JWT (jsonwebtoken 9.0.3) |
| **Password Hashing** | bcryptjs 3.0.3 |
| **Environment** | dotenv 17.4.2 |
| **Development** | tsx, TypeScript 6.0.3 |

---

## 🚀 Setup Steps

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=issue_tracking
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key
   ```

4. **Create PostgreSQL database**
   ```bash
   createdb issue_tracking
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user & get JWT | No |

### User Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/signup` | Create new user | No |

### Issue Routes
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|----------------|------|
| POST | `/api/issues` | Create new issue | Yes | Maintainer, Contributor |
| GET | `/api/issues/:id` | Get issue details | No | - |
| PATCH | `/api/issues/:id` | Update issue | Yes | Maintainer, Contributor |
| DELETE | `/api/issues/:id` | Delete issue | Yes | Maintainer |

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `role` - User role: `maintainer` or `contributor`
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

---

### Issues Table
```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  reporter_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

**Columns:**
- `id` - Primary key (auto-increment)
- `title` - Issue title
- `description` - Detailed issue description
- `type` - Issue type (bug, feature, etc.)
- `status` - Issue status: `open`, `in_progress`, `closed`
- `reporter_id` - User ID who reported the issue (Foreign Key)
- `created_at` - Issue creation timestamp
- `updated_at` - Last update timestamp

---

## 📝 Request/Response Examples

### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor"
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Issue
```bash
POST /api/issues
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Login button not working",
  "description": "The login button is unresponsive on mobile devices",
  "type": "bug"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Issue Created successful",
  "data": {
    "id": 1,
    "title": "Login button not working",
    "description": "The login button is unresponsive on mobile devices",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-05-23T10:30:00Z",
    "updated_at": "2026-05-23T10:30:00Z"
  }
}
```

### Get Issue
```bash
GET /api/issues/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Issues retrived successfully!",
  "data": {
    "id": 1,
    "title": "Login button not working",
    "description": "The login button is unresponsive on mobile devices",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-05-23T10:30:00Z",
    "updated_at": "2026-05-23T10:30:00Z"
  }
}
```

### Update Issue
```bash
PATCH /api/issues/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Login button not working on mobile",
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 1,
    "title": "Login button not working on mobile",
    "description": "The login button is unresponsive on mobile devices",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-05-23T10:30:00Z",
    "updated_at": "2026-05-23T11:45:00Z"
  }
}
```

### Delete Issue
```bash
DELETE /api/issues/1
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## 🔐 Access Control Rules

### Contributors
- ✅ Create issues
- ✅ Update own issues (only if status is "open")
- ❌ Update other users' issues
- ❌ Delete issues

### Maintainers
- ✅ Create issues
- ✅ Update any issue
- ✅ Delete issues
- ✅ Manage all system operations

---

## 📂 Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server startup
├── config/
│   └── index.ts          # Configuration variables
├── db/
│   └── index.ts          # Database connection
├── middleware/
│   ├── auth.ts           # JWT authentication middleware
│   └── index.d.ts        # Type definitions
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   └── auth.service.ts
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.interface.ts
│   │   ├── user.route.ts
│   │   └── user.service.ts
│   └── issues/
│       ├── issues.controller.ts
│       ├── issues.interface.ts
│       ├── issues.route.ts
│       └── issues.service.ts
└── types/
    └── index.ts          # Global type definitions
```

---

## 🐛 Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Missing/Invalid token)
- `403` - Forbidden (No permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing

Run tests:
```bash
npm test
```

---

## 📝 License

ISC

---

## 👤 Author

**Rayhanx**

For questions or support, please contact the development team.

---

## 🔗 Related Links

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)

---

**Last Updated:** May 23, 2026
