# TaskFlow

A modern, full-stack project management application with Role-Based Access Control (RBAC). Designed for teams to collaborate on projects, manage tasks, and track progress efficiently.

Live URL: https://taskflow-0pm2.onrender.com/

## 🎯 Features

- **Project Management**: Create, organize, and manage multiple projects
- **Task Management**: Kanban-style task boards with drag-and-drop support
- **User Management**: Team member management with role-based permissions
- **Dashboard**: Real-time analytics and project statistics
- **Authentication**: JWT-based secure authentication with refresh tokens
- **Role-Based Access Control**: Admin, Manager, and Member roles
- **User Profiles**: Customizable user settings and preferences
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Rate Limiting**: Built-in API rate limiting for security
- **Database Migrations**: Version-controlled schema management

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite (fast build tool)
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: React Context + TanStack Query
- **Drag & Drop**: dnd-kit
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (Access & Refresh tokens)
- **Security**: Helmet.js, CORS, Cookie Parser
- **Rate Limiting**: express-rate-limit

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier available at https://supabase.com)

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/KRSNA568/Task.git
cd Task
```

### 2. Backend Setup

```bash
cd server

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Apply database migrations (in order: 001, 002, 003, 004, 005)
# Login to your Supabase console and run migrations from server/migrations/ folder

# Seed database with sample data (optional)
node scripts/seed.js

# Start the server
node server.js
# Server runs at http://localhost:3001
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs at http://localhost:5173
```

## 🔐 Environment Variables

### Server (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Secrets (use strong, random 32+ character strings)
JWT_ACCESS_SECRET=your_access_secret_32_chars_minimum
JWT_REFRESH_SECRET=your_refresh_secret_32_chars_minimum

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

## 👥 Test Accounts

Use these credentials to test the application:

| Email | Password | Role |
|---|---|---|
| admin@taskflow.dev | Admin@123 | Admin |
| member@taskflow.dev | Member@123 | Member |

> **Note**: Credentials are available after running `npm run seed` in the server directory.

## 📁 Project Structure

```
Task/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # API integration (axios instances)
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Common components (Button, Input, etc.)
│   │   │   ├── layout/       # Layout components (Sidebar, TopBar)
│   │   │   ├── projects/     # Project-specific components
│   │   │   └── tasks/        # Task-specific components
│   │   ├── context/          # React Context (Auth)
│   │   ├── guards/           # Route guards (PrivateRoute, AdminRoute)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   └── data/             # Constants and metadata
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── dashboard/    # Dashboard stats
│   │   │   ├── projects/     # Project management
│   │   │   ├── tasks/        # Task management
│   │   │   └── users/        # User management
│   │   ├── middleware/       # Express middleware
│   │   ├── config/           # Configuration
│   │   └── utils/            # Utility functions
│   ├── migrations/           # Database migrations
│   ├── scripts/              # Utility scripts
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Projects
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id` - Update user profile

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## 🧪 Development Commands

### Frontend
```bash
cd client

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
cd server

# Start development server
node server.js

# Seed database (creates test data)
node scripts/seed.js
```

## 🚢 Deployment

This project is configured for deployment on **Render** using the `render.yaml` configuration file.

### Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render (https://render.com)
3. Create a new Web Service
4. Render will automatically detect `render.yaml` and configure:
   - Build command: `cd client && npm install && npm run build && cd ../server && npm install`
   - Start command: `node server/server.js`

### Environment Variables on Render

Set these in your Render dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET` (auto-generated)
- `JWT_REFRESH_SECRET` (auto-generated)
- `NODE_ENV=production`

## 🔒 Security Features

- **HTTPS Only**: Helmet.js headers for security
- **CORS Protection**: Configured origin validation
- **Rate Limiting**: 
  - Global: 200 requests per 15 minutes
  - Auth: 20 requests per 15 minutes
- **JWT Authentication**: Secure token-based auth
- **Row-Level Security**: Supabase RLS policies
- **Input Validation**: Schema-based request validation

## 🐛 Troubleshooting

### Build fails with "vite: not found"
- Ensure build dependencies are installed: `npm install --include=dev`
- Check that `vite` is in `dependencies` (not just `devDependencies`)

### Database connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Ensure migrations have been applied in order
- Check Supabase project is active and accessible

### CORS errors
- Confirm `CLIENT_URL` matches your frontend URL
- In production, CORS is disabled (same-origin requests)

### Authentication failures
- Clear browser cookies and local storage
- Verify JWT secrets are 32+ characters
- Check token expiration times

## 📝 Database Migrations

Migrations are located in `server/migrations/`:

1. **001_enums.sql** - Define PostgreSQL enums (roles, statuses)
2. **002_tables.sql** - Create main database tables
3. **003_indexes.sql** - Add database indexes for performance
4. **004_triggers.sql** - Setup database triggers
5. **005_rls.sql** - Configure Row-Level Security policies

Apply them in order using Supabase SQL Editor.

## 🎨 UI Components

The project includes a reusable component library:

- **Button**: Primary, secondary, danger variants
- **Input**: Text, email, password fields
- **Badge**: Status badges with colors
- **Avatar**: User avatars with initials
- **Dropdown**: Accessible dropdown menu
- **Skeleton**: Loading placeholders
- **IconButton**: Icon-only buttons

## 🚀 Future Scope & Enhancements

### 1. **Advanced Task Management**
- Subtasks and task dependencies
- Time tracking and time estimates
- Task templates for recurring work
- Custom task fields and workflows
- Task history and activity logs

### 2. **Collaboration Features**
- Real-time collaboration (WebSocket support)
- Comments and mentions on tasks
- Activity feed and notifications
- File attachments to tasks/projects
- @mention notifications

### 3. **Reporting & Analytics**
- Advanced reporting dashboard
- Time tracking reports
- Burndown charts for sprints
- Team productivity metrics
- Custom report generation and export (PDF/CSV)

### 4. **Integration Capabilities**
- Calendar integration (Google Calendar, Outlook)
- Slack notifications and slash commands
- GitHub integration for code commits
- Email notifications
- Webhook support for external integrations
- Zapier/IFTTT automation

### 5. **Mobile Application**
- Native iOS app (React Native)
- Native Android app (React Native)
- Offline support with sync
- Push notifications

### 6. **Permission & Access Control**
- More granular permissions (view, edit, comment, delete)
- Team hierarchies
- Project permissions inheritance
- Guest access with expiry
- Audit logs for compliance

### 7. **Performance & Optimization**
- Infinite scroll/pagination
- Advanced filtering and search
- Query optimization
- Caching strategy (Redis)
- CDN for static assets

### 8. **AI-Powered Features**
- AI task suggestions and automation
- Smart task categorization
- Predictive project analytics
- Natural language task creation
- Automated task assignment

### 9. **Team Management**
- User onboarding workflow
- Team invitations with custom roles
- Single Sign-On (SSO) support
- Two-Factor Authentication (2FA)
- Organization/Workspace support

### 10. **Premium Features**
- Subscription-based pricing tiers
- Advanced analytics (premium)
- Custom branding
- Priority support
- SLA guarantees

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---



## Database migrations

Run in Supabase SQL editor in order:

1. `server/migrations/001_enums.sql`
2. `server/migrations/002_tables.sql`
3. `server/migrations/003_indexes.sql`
4. `server/migrations/004_triggers.sql`
5. `server/migrations/005_rls.sql`

## Features

- JWT auth (access token + httpOnly refresh cookie)
- RBAC: global admin / project admin / member
- Kanban board with inline task creation
- Task detail slide-over with activity log + comments
- Dashboard with stats and My Tasks table
- Projects grid with progress bars
- Admin: Members management + Project settings
