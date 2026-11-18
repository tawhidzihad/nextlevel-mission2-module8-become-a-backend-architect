# Modular Express.js API with JWT Authentication — Users, Profiles & Login

A backend practice project built with **Express.js 5**, **TypeScript** and **PostgreSQL**, structured using a **modular pattern** and secured with **password hashing (bcrypt)** and **JWT-based login**.

This project is part of **Programming Hero — Next Level Development, Mission 2, Module 8: Become a Backend Architect**.

In the previous module I connected Express.js to PostgreSQL and wrote simple CRUD APIs in a single place. In this module I restructured that code into feature-based modules (`user`, `profile`, `auth`), each with its own **route → controller → service** layers, and added a real authentication flow.

> **Learning focus:** modular project structure, separation of concerns (route / controller / service), password hashing, JWT authentication, and table relationships in PostgreSQL.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Backend Framework:** Express.js 5
- **Database:** PostgreSQL
- **PostgreSQL Client:** `pg` (node-postgres)
- **Password Hashing:** `bcryptjs`
- **Authentication:** `jsonwebtoken` (JWT)
- **Environment Variables:** dotenv
- **Development:** TSX (watch mode)

## What I Practiced

- Building a **modular pattern** where every feature lives in its own folder.
- Splitting code into **route**, **controller** and **service** layers.
- Moving environment variables into a dedicated **config** module.
- Moving the database pool and table creation into a dedicated **db** module.
- Defining TypeScript **interfaces** (`IUser`) for request payloads.
- **Hashing passwords** with `bcryptjs` before saving them to the database.
- Verifying a password with `bcrypt.compare` during login.
- Checking user status (`is_active`) before allowing access.
- Generating a **JWT access token** with an expiry time using `jsonwebtoken`.
- Creating a **one-to-one relationship** between `users` and `profile` with a foreign key and `ON DELETE CASCADE`.
- Removing the `password` field from responses before sending data back.
- Using parameterized SQL queries, `RETURNING *` and `COALESCE` for safe and flexible queries.

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── index.ts            # Environment variables (PORT, DATABASE_URI, JWT)
│   ├── db/
│   │   └── index.ts            # PostgreSQL pool + table creation (initDB)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts      # Login logic (bcrypt + JWT)
│   │   ├── user/
│   │   │   ├── user.route.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts      # User CRUD logic
│   │   │   └── user.interface.ts    # IUser type
│   │   └── profile/
│   │       ├── profile.route.ts
│   │       ├── profile.controller.ts
│   │       └── profile.service.ts   # Create profile for a user
│   ├── app.ts                  # Express app, middlewares and route mounting
│   └── server.ts               # Entry point (DB init + server listen)
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

## How the Modular Pattern Works

Each module follows the same flow:

```
Request → Route → Controller → Service → Database
                                   ↓
Response ← Controller ←────────────┘
```

| Layer          | Responsibility                                                         |
| -------------- | ---------------------------------------------------------------------- |
| **Route**      | Defines the endpoint and HTTP method, then forwards to a controller    |
| **Controller** | Receives `req` / `res`, calls the service, and sends the JSON response |
| **Service**    | Contains the business logic and runs SQL queries against the database  |

`app.ts` mounts every module under a versioned base path:

```ts
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profileRoute);
app.use("/api/v1/auth", authRoute);
```

## Database Tables

Tables are created automatically on server start (`CREATE TABLE IF NOT EXISTS`).

### `users`

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_Active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### `profile`

```sql
CREATE TABLE IF NOT EXISTS profile(
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    address TEXT,
    phone VARCHAR(15),
    gender VARCHAR(15),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationship

```
users (1) ────── (1) profile
```

- `profile.user_id` is a foreign key referencing `users.id`.
- `UNIQUE` on `user_id` makes it a **one-to-one** relationship (one profile per user).
- `ON DELETE CASCADE` deletes the profile automatically when its user is deleted.

## Authentication Flow

Login is handled in `auth.service.ts` with the following steps:

1. Find the user by `email`.
2. If the user does not exist → throw `Invalid credentials!`.
3. Compare the plain password with the hashed password using `bcrypt.compare`.
4. If the password does not match → throw `Invalid credentials!`.
5. Check `is_active`; if the user is blocked → throw `User access denied`.
6. Create a JWT with the user's details and sign it with the secret key (`expiresIn: "1d"`).
7. Remove the `password` field and return `{ accessToken, user }`.

Passwords are hashed with `bcrypt.hash(password, 10)` when a user is created, so plain-text passwords are never stored.

## API Endpoints

Base URL: `http://localhost:5000`

| Method   | Endpoint             | Description                                    |
| -------- | -------------------- | ---------------------------------------------- |
| `GET`    | `/`                  | Server health / status response                |
| `POST`   | `/api/v1/auth/login` | Logs in a user and returns a JWT access token  |
| `POST`   | `/api/v1/users`      | Creates a user (password is hashed)            |
| `GET`    | `/api/v1/users`      | Retrieves all users                            |
| `GET`    | `/api/v1/users/:id`  | Retrieves one user by ID                       |
| `PUT`    | `/api/v1/users/:id`  | Updates a user's name, age, password or status |
| `DELETE` | `/api/v1/users/:id`  | Deletes a user by ID                           |
| `POST`   | `/api/v1/profiles`   | Creates a profile for an existing user         |

### Response Format

All endpoints respond with a consistent JSON structure:

```json
{
	"success": true,
	"messages": "user created successfully!",
	"data": {}
}
```

On failure:

```json
{
	"success": false,
	"messages": "error message",
	"error": {}
}
```

### Login

**POST** `/api/v1/auth/login`

```json
{
	"email": "tawhid@example.com",
	"password": "your-password"
}
```

Example success response:

```json
{
	"success": true,
	"messages": "user loggedin successfully",
	"data": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"user": {
			"id": 1,
			"name": "Tawhid",
			"age": 22,
			"email": "tawhid@example.com",
			"is_active": true
		}
	}
}
```

### Create a User

**POST** `/api/v1/users`

```json
{
	"name": "Tawhid",
	"age": 22,
	"email": "tawhid@example.com",
	"password": "your-password"
}
```

The password is hashed with bcrypt and removed from the response.

### Update a User

**PUT** `/api/v1/users/:id`

```json
{
	"name": "Updated Name",
	"age": 23,
	"is_Active": true
}
```

Fields that are omitted keep their existing values (`COALESCE`), and `updated_at` is set to `NOW()`.

### Create a Profile

**POST** `/api/v1/profiles`

```json
{
	"user_id": 1,
	"bio": "MERN stack developer learning backend engineering.",
	"address": "Dhaka, Bangladesh",
	"phone": "01700000000",
	"gender": "male"
}
```

The service first checks that the user exists. If not, it throws `User not exist in the database!`.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tawhidzihad/nextlevel-mission2-module8-become-a-backend-architect.git
```

### 2. Go to the project directory

```bash
cd nextlevel-mission2-module8-become-a-backend-architect
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URI=your_postgresql_connection_string
JWT=your_jwt_secret_key
```

- `PORT` — port the server will run on.
- `DATABASE_URI` — your PostgreSQL connection string.
- `JWT` — a long, random secret used to sign access tokens.

> Never commit your `.env` file. It is already listed in `.gitignore`.

### 5. Start the development server

```bash
npm run dev
```

The development script runs the TypeScript server with TSX watch mode. The API will be available at:

```
http://localhost:5000
```

## What I Learned

- How a modular pattern keeps a growing Express.js project clean and easy to maintain.
- Why separating route, controller and service layers makes code easier to read, test and extend.
- How to centralize configuration and database setup in their own modules.
- Why passwords must be hashed, and how `bcryptjs` hashes and verifies them.
- How JWT works: signing a payload with a secret and setting an expiry time.
- How to design a login flow: check user → check password → check status → issue token.
- How to model a one-to-one relationship between two PostgreSQL tables.
- How to keep sensitive fields (like passwords) out of API responses.

## Future Improvements

- Add an **auth middleware** to verify JWT tokens and protect routes (users, profiles).
- Add **role-based authorization** (e.g. admin / user).
- Hash the password when updating a user, too.
- Hide the `password` field in the "get users" responses.
- Add request **validation** (e.g. with Zod) for all inputs.
- Add a **global error handler** and proper status codes (400 / 401 / 403 instead of always 500).
- Add endpoints to read, update and delete profiles.
- Add pagination, filtering and search.
- Add migrations and a more structured database layer.

## Author

**Tawhid Zihad**

MERN Stack Developer | Learning Backend Engineering

- GitHub: [@tawhidzihad](https://github.com/tawhidzihad)

---

⭐ This repository documents my journey from basic PostgreSQL CRUD to a modular, authenticated backend API.
