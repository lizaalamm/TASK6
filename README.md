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
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   └── userRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validateMiddleware.js
│   │   ├── validators/
│   │   │   └── userValidators.js
│   │   ├── services/
│   │   │   └── tokenService.js
│   │   ├── utils/
│   │   │   ├── apiResponse.js
│   │   │   └── sanitizeUser.js
│   │   ├── seeders/
│   │   │   └── seedUsers.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── src/                      # React frontend
│   ├── app/store.js
│   ├── redux/auth/authSlice.js
│   ├── redux/users/
│   ├── services/api.js
│   ├── services/authService.js
│   ├── pages/auth/Login.jsx
│   ├── pages/auth/Register.jsx
│   └── ...
├── package.json
└── vite.config.js            # proxies /api → :5000
```

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
