# CampusConnect

CampusConnect is a complete local full-stack campus event platform built with React/Vite, Express, JWT, bcrypt, Multer, Tailwind CSS, and JSON-file persistence—no database required.

## Features

- Student, organizer, and admin authentication with JWTs and password hashing.
- Public event browsing, search/category filters, event details, comments, and `.ics` calendar downloads.
- Students can register/unregister and view their registrations.
- Organizers can create, edit, and delete only their own events, with optional image uploads.
- Admins can view statistics, change user roles, remove users, and manage clubs. Admins can also manage any event through the API.
- JSON files are the persistence layer in `server/data`; uploaded images go into `server/uploads`.

## Run locally

1. Install Node.js 20+.
2. Copy `server/.env.example` to `server/.env`. Set a strong `JWT_SECRET`.
3. Optionally copy `client/.env.example` to `client/.env` if your API is not on the default URL.
4. From the project root, run:

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API is on `http://localhost:5000`.

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET/PUT /api/auth/me` |
| Events | `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`, `GET /api/events/:id/calendar` |
| Registrations | `GET /api/registrations/mine`, `POST/DELETE /api/registrations/:eventId` |
| Comments | `GET/POST /api/comments/:eventId`, `DELETE /api/comments/:id` |
| Admin | `/api/admin/summary`, `/users`, `/clubs` |

For multipart event creation/update, use `image` as the image field. Requests requiring login expect `Authorization: Bearer <token>`.

## Note on JSON persistence

This architecture is ideal for demos and coursework. JSON files are not appropriate for concurrent production workloads: simultaneous writes can conflict. Move persistence to a proper database before production deployment.
