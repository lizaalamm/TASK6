# U Devs Car Showroom Management System

React frontend + Express/Sequelize API with JWT login, matching the intern Backend + Frontend + Redux guide.

```
React UI → Redux Toolkit → Axios → Express Route → Middleware → Controller → Sequelize → PostgreSQL/SQLite
```

## Folder structure

```
TASK6/
├── backend/
│   ├── src/
│   │   ├── config/           # env.js (typed env) · db.js (Sequelize instance)
│   │   ├── constants/        # roles.js — role hierarchy + canManageRole()
│   │   ├── controllers/      # userController.js · adminController.js (superadmin stats)
│   │   ├── models/           # userModel.js · index.js (relations + PG ENUM safety)
│   │   ├── routes/           # userRoutes.js (/api/users) · adminRoutes.js (/api/admin)
│   │   ├── middleware/       # auth (isAuthenticated/requireAdmin/requireSuperAdmin/requireRoles)
│   │   ├── validators/       # express-validator chains per endpoint
│   │   ├── services/         # tokenService.js (JWT + cookie)
│   │   ├── utils/            # apiResponse.js (envelope) · sanitizeUser.js
│   │   ├── seeders/          # seedUsers.js — 6 demo accounts (idempotent)
│   │   ├── app.js            # Express pipeline (no listen() — test-friendly)
│   │   └── server.js         # Boot: connect → sync → seed → listen
│   ├── .env / .env.example
│   └── package.json
├── src/                      # React frontend
│   ├── app/store.js          # Redux store (auth + users slices)
│   ├── assets/theme/         # brownTheme.js — espresso & gold design system
│   ├── components/           # layout/ · users/ · dashboard/ · customers/
│   ├── constants/            # roles.js — role groups + helpers (single source of truth)
│   ├── context/              # AuthContext.jsx · ThemeContext.jsx
│   ├── data/                 # seedData.js — local demo catalogue
│   ├── hooks/                # useRole.js — role flags for any component
│   ├── pages/                # auth/ · admin/ · superadmin/ · staff/ · customer/
│   │                         # inventory/ · management/ · reports/
│   ├── redux/auth/           # authSlice.js — session thunks + selectors
│   ├── redux/users/          # userSlice.js + userActions.js — user CRUD state
│   ├── routes/               # AppRoutes.jsx · PrivateRoute.jsx · RoleRoute.jsx
│   ├── services/             # api.js (Axios) · authService.js · userApi.js · …
│   ├── styles/global.css     # ambient gradients, animations, glass utilities
│   └── utils/                # calculations.js · validation.js
├── package.json
└── vite.config.js            # proxies /api → :5000
```

## Roles & permissions

| Role | Home page | Powers |
|------|-----------|--------|
| Superadmin | `/superadmin` | Platform owner. Passes every guard, manages admins, sees system stats (`/api/admin/*`). |
| Admin | `/dashboard` | Manages staff + customers + users, but **cannot** touch superadmin accounts or mint admins. |
| Team lead | `/dashboard` | Sales screens + own team members. |
| Sales / Employee | `/dashboard` | Customers + applications + reports. |
| Inventory | `/dashboard` | Cars + suppliers + reports. |
| Customer | `/customer-dashboard` | Showroom + own applications + profile. |

Rule of thumb enforced on **both** API and UI: you can only manage roles
strictly below your own — except superadmin, who manages everyone.

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API: `http://localhost:5000`

### PostgreSQL (recommended)

```env
DB_DIALECT=postgres
DB_NAME=udevs_showroom
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=use_a_long_random_secret
FRONTEND_URL=http://localhost:5173
```

```bash
createdb -U postgres udevs_showroom
```

### SQLite (local/demo)

```env
DB_DIALECT=sqlite
SQLITE_STORAGE=./dev.sqlite
```

## 2. Frontend

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Vite proxies `/api` to the backend so the browser never talks to `localhost:5000` directly.

```env
VITE_API_URL=/api
```

## Login flow

1. User submits Login.
2. React dispatches `loginUser({ email, password })`.
3. Axios `POST /api/users/login`.
4. Controller finds the user, `bcrypt.compare`, issues JWT.
5. Redux stores `user` + `token`.
6. AuthContext / PrivateRoute unlock the app.

## API endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/health` | No | Health check |
| POST | `/api/users/register` | No | Register |
| POST | `/api/users/login` | No | Login (JWT) |
| POST | `/api/users/logout` | No | Clear cookie |
| GET | `/api/users/me` | Yes | Current user |
| GET | `/api/users/user` | Yes | List users |
| GET | `/api/users/user/:id` | Yes | Single user |
| GET | `/api/users/teamUsers/:teamLeadId` | Yes | Team users |
| POST | `/api/users/user` | Admin | Create user |
| PUT | `/api/users/user` | Yes | Update (id in body) |
| PUT | `/api/users/user/:id` | Yes | Update |
| DELETE | `/api/users/user/:id` | Admin | Delete |
| GET | `/api/admin/stats` | Superadmin | Platform counts + role breakdown + recent signups |
| GET | `/api/admin/admins` | Superadmin | Leadership accounts (superadmin + admin) |

### Login request

```json
POST /api/users/login
{ "email": "admin@udevs.com", "password": "Admin@123" }
```

### Login response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": 1, "name": "Admin User", "email": "admin@udevs.com", "role": "admin", "userType": "admin" }
}
```

Passwords are bcrypt-hashed and never returned.

## Demo accounts (seeded on boot)

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@udevs.com | Admin@123 |
| Sales | sales@udevs.com | Sales@123 |
| Inventory | inventory@udevs.com | Inventory@123 |
| Customer | customer@udevs.com | Customer@123 |
| Team lead | lead@udevs.com | Lead@1234 |

## Tech stack

**Frontend:** React 18, Vite, MUI, Bootstrap, Redux Toolkit, Axios, React Router  
**Backend:** Express, Sequelize, PostgreSQL/SQLite, JWT, bcrypt, express-validator
