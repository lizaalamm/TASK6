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
│   │   ├── constants/        # roles.js · permissions.js (matrix) · applicationStatus.js (9-step flow)
│   │   ├── controllers/      # user · admin (stats/audit) · application · vehicle · payment
│   │   ├── models/           # user · vehicle · application · payment · auditLog · index.js (relations)
│   │   ├── routes/           # users (/api/users) · admin (/api/admin) · applications · vehicles · payments
│   │   ├── middleware/       # auth (isAuthenticated/requireAdmin/requireSuperAdmin/requireRoles/requirePermission)
│   │   ├── validators/       # express-validator chains per endpoint
│   │   ├── services/         # tokenService.js (JWT + cookie)
│   │   ├── utils/            # apiResponse.js (envelope) · sanitizeUser.js · auditLogger.js
│   │   ├── seeders/          # seedUsers.js (7 demo accounts) · seedShowroom.js (vehicles + demo application)
│   │   ├── app.js            # Express pipeline (no listen() — test-friendly)
│   │   └── server.js         # Boot: connect → sync → seed → listen
│   ├── .env / .env.example
│   └── package.json
├── src/                      # React frontend
│   ├── app/store.js          # Redux store (auth + users slices)
│   ├── assets/theme/         # brownTheme.js — espresso & gold design system
│   ├── components/           # layout/ · users/ · dashboard/ · customers/ · applications/
│   ├── constants/            # roles.js · permissions.js (matrix mirror) · applicationStatus.js (flow mirror)
│   ├── context/              # AuthContext.jsx · ThemeContext.jsx
│   ├── data/                 # seedData.js — local demo catalogue
│   ├── hooks/                # useRole.js — role flags for any component
│   ├── pages/                # auth/ · admin/ · superadmin/ · manager/ · staff/ · customer/
│   │                         # inventory/ · management/ · reports/
│   ├── redux/auth/           # authSlice.js — session thunks + selectors
│   ├── redux/users/          # userSlice.js + userActions.js — user CRUD state
│   ├── routes/               # AppRoutes.jsx · PrivateRoute.jsx · RoleRoute.jsx
│   ├── services/             # api.js (Axios) · application/vehicle/payment/audit services (API + offline fallback)
│   ├── styles/global.css     # ambient gradients, animations, glass utilities
│   └── utils/                # calculations.js · validation.js
├── package.json
└── vite.config.js            # proxies /api → :5000
```

## Roles & permissions

| Role | Access | Home page | Responsibilities |
|------|--------|-----------|------------------|
| Super Admin | FULL | `/superadmin` | Register users; create/manage Admin/Manager/Customer; approve/pending/reject applications; assign Manager; manage vehicles, pricing, finance rules, payments, reports, settings and audit logs. |
| Admin | LIMITED | `/dashboard` | Operational work only within Super-Admin-granted modules. Cannot create Super Admins/Admins, approve applications, assign Managers or complete orders. |
| Manager | ASSIGNED ONLY | `/manager-dashboard` | Sees only assigned customers/applications; verifies info; handles workflow; helps select vehicle; configures down payment/installment plan; manages assigned payments. Cannot transfer customers or bypass Super Admin approval. |
| Customer | OWN DATA | `/customer-dashboard` | View/update allowed personal info; submit application; view status, assigned Manager, vehicle, finance plan, installments and payment history. |
| Team lead / Sales / Inventory / Employee | STAFF (legacy) | `/dashboard` | Backwards-compatible staff screens (customers, applications, cars, suppliers, reports). |

Rule of thumb enforced on **both** API and UI: you can only manage roles
strictly below your own — except superadmin, who manages everyone.
All Admin/Manager/Customer API calls are checked on the backend, never only
hidden in React (see `backend/src/constants/permissions.js`).

### Permission matrix

| Feature | Super Admin | Admin | Manager | Customer |
|---------|:-----------:|:-----:|:-------:|:--------:|
| Register users (portal) | YES | YES* | NO | NO |
| Create Super Admin / Admin | YES | NO | NO | NO |
| Create Manager / Customer | YES | YES | NO | NO |
| Approve / Pending / Reject application | YES | NO | NO | NO |
| Assign Manager | YES | NO | NO | NO |
| View all customers | YES | LIMITED | NO | NO |
| View assigned customers | YES | YES | YES | NO |
| View own profile | YES | YES | YES | YES |
| Vehicle CRUD | FULL | LIMITED† | VIEW | VIEW‡ |
| Finance / Installments | FULL | LIMITED | ASSIGNED | VIEW OWN |
| Payments | ALL | LIMITED | ASSIGNED | VIEW OWN |
| Reports | ALL | LIMITED | ASSIGNED | NO |
| Audit logs / settings | YES | NO | NO | NO |
| Complete order | YES | NO | NO | NO |

\* Admin can create Manager/Customer/staff accounts only.
† Admin can create/update vehicles; only Super Admin can delete.
‡ Customer sees Available vehicles with stock only.

### Role workflows

**Super Admin** — JWT login → `/superadmin`. Registers users (First Name, Last
Name, Email, Phone, CNIC, CNIC Front/Back, Role, Status); reviews applications
(PENDING/APPROVED/REJECTED); assigns the Manager (directly or after approval);
manages the vehicle catalogue (make, model, year, variant, price,
stock/availability, status); controls finance rules, down payment, installment
duration/frequency and payment records; views all dashboards, reports, overdue
installments and audit history.

**Admin** — sees only Admin-enabled modules; performs limited operational tasks
(payments, catalogue updates, customer support) and views permitted records.
Cannot create Super Admins, change role permissions, approve applications or
assign Managers.

**Manager** — sees only customers/applications where `managerId` matches.
Opens customer → verifies profile/documents → reviews application →
selects/recommends an available vehicle → records down payment + installment
plan → records permitted payments and monitors paid/remaining/overdue.
Cannot transfer customers or bypass Super Admin approval.

**Customer** — personal dashboard only. Submits/updates allowed application
fields (first/last name, email, phone, CNIC, CNIC front/back); views status,
assigned Manager, vehicle, price, down payment, installment amount/duration,
paid amount and remaining balance. Cannot approve, assign, change roles or
edit financial totals.

### Application-to-delivery state flow

| Step | Actor | Status / Action |
|:----:|-------|---------------|
| 1 | Customer | Create application → `PENDING` |
| 2 | Super Admin | Review documents → `PENDING` / `APPROVED` / `REJECTED` |
| 3 | Super Admin | Assign Manager → `ASSIGNED` |
| 4 | Manager | Verify customer/documents → `IN_PROCESS` |
| 5 | Manager + Customer | Select vehicle → `VEHICLE_SELECTED` |
| 6 | Manager / Super Admin | Create finance plan → `FINANCE_SETUP` |
| 7 | Manager / Admin / Super Admin | Record payment → `PAYMENT_IN_PROGRESS` |
| 8 | Authorized role | Conditions met → `READY_FOR_DELIVERY` |
| 9 | Super Admin | Complete order → `COMPLETE` |

Illegal transitions and unauthorised actors are rejected by the API
(`backend/src/constants/applicationStatus.js`). Rejected applications can be
resubmitted (`REJECTED` → `PENDING`) by the customer.

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
| GET | `/api/admin/stats` | Superadmin | Platform counts + role breakdown + pipeline + revenue + overdue |
| GET | `/api/admin/admins` | Superadmin | Leadership accounts (superadmin + admin) |
| GET | `/api/admin/audit-logs` | Superadmin | Paginated audit trail |
| GET | `/api/users/managers` | Superadmin/Admin | Active managers (assignment dropdown) |
| GET | `/api/applications` | Scoped | List (all / assigned / own) + `?status=` filter |
| GET | `/api/applications/stats` | Scoped | Counts per pipeline status |
| GET | `/api/applications/overdue/list` | Superadmin/Admin/Manager | Past-due applications with a balance |
| GET | `/api/applications/:id` | Scoped | One application + payment history |
| POST | `/api/applications` | Customer/Superadmin | Submit → `PENDING` |
| PUT | `/api/applications/:id` | Scoped | Edit allowed fields |
| POST | `/api/applications/:id/review` | Superadmin | `APPROVED` / `REJECTED` / `PENDING` |
| POST | `/api/applications/:id/assign` | Superadmin | Assign manager → `ASSIGNED` |
| POST | `/api/applications/:id/verify` | Manager/Superadmin | Verify docs → `IN_PROCESS` |
| POST | `/api/applications/:id/vehicle` | Manager/Customer/Superadmin | Select vehicle → `VEHICLE_SELECTED` |
| POST | `/api/applications/:id/finance` | Manager/Superadmin | Finance plan → `FINANCE_SETUP` |
| POST | `/api/applications/:id/ready` | Manager/Superadmin | Conditions met → `READY_FOR_DELIVERY` |
| POST | `/api/applications/:id/complete` | Superadmin | Complete order → `COMPLETE` |
| POST | `/api/applications/:id/resubmit` | Customer/Superadmin | `REJECTED` → `PENDING` |
| DELETE | `/api/applications/:id` | Superadmin | Delete `PENDING`/`REJECTED` only |
| GET | `/api/vehicles` | Scoped | Catalogue (customers: Available + in stock) |
| GET | `/api/vehicles/:id` | Scoped | One vehicle |
| POST | `/api/vehicles` | Superadmin/Admin/Inventory | Add vehicle |
| PUT | `/api/vehicles/:id` | Superadmin/Admin/Inventory | Update vehicle |
| DELETE | `/api/vehicles/:id` | Superadmin | Delete vehicle |
| GET | `/api/payments` | Scoped | Payment history (`?applicationId=`) |
| GET | `/api/payments/overdue` | Superadmin/Admin/Manager | Past-due payment rows |
| POST | `/api/payments` | Superadmin/Admin/Manager | Record payment |
| PUT | `/api/payments/:id` | Superadmin/Admin | Correct a payment record |

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
| Superadmin | superadmin@udevs.com | Super@123 |
| Admin | admin@udevs.com | Admin@123 |
| Manager | manager@udevs.com | Manager@123 |
| Sales | sales@udevs.com | Sales@123 |
| Inventory | inventory@udevs.com | Inventory@123 |
| Customer | customer@udevs.com | Customer@123 |
| Team lead | lead@udevs.com | Lead@1234 |

## Tech stack

**Frontend:** React 18, Vite, MUI, Bootstrap, Redux Toolkit, Axios, React Router  
**Backend:** Express, Sequelize, PostgreSQL/SQLite, JWT, bcrypt, express-validator
