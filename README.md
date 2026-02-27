# Digital Library

A Kindle-style digital book library where you can browse books, filter by category and type, sort, search, and manage your own collection. Includes full signup and login.

## Features

- **Browse** – View all books with cover, title, author, category, and type
- **Search** – Search by title, author, or description
- **Filter** – By category (Fiction, Fantasy, Romance, etc.) and book type (Novel, Non-Fiction)
- **Sort** – By title, author, year, or recently added (A→Z or Z→A)
- **Sign up / Log in** – Create an account and sign in with email and password
- **My Library** – Add books to your collection and remove them (requires login)
- **Book detail** – Click any book for full details and add to library
- **Admin: upload books** – Admins can upload PDF books from their computer (max 50 MB). Uploaded books get **Read PDF** and **Download PDF** on the book page.
- **Forgot password** – OTP-based reset: enter email → receive 6-digit OTP by email → enter OTP + new password (requires SMTP configured in `server/.env`).
- **Profile** – Edit name, about, and city; upload a profile image (JPEG/PNG/GIF/WebP, max 5 MB). Available when logged in via **Profile** in the nav.

## Admin and PDF upload

- **Admin login:** After running the seed, log in with **admin@library.com** / **admin123**.
- **Upload:** As admin, use **Upload Book** in the nav. Choose a PDF from your machine, fill title, author, category, and book type, then upload.
- **Auto-cover:** The first page of the uploaded PDF is used as the book cover if **ImageMagick** (`convert`) or **poppler-utils** (`pdftoppm`) is installed. On macOS: `brew install imagemagick` or `brew install poppler`. If neither is available, the book keeps a placeholder (you can set a cover URL when editing the book).
- **PDFs** are stored under `server/uploads/books/`. Covers under `server/uploads/covers/`. On any book with an uploaded PDF, users see **Read PDF** (opens in a new tab) and **Download PDF**.

## Tech Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (stored in localStorage)

## Setup

1. Install dependencies (root, server, and client):

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

2. Start MongoDB (e.g. local install or Docker), then seed sample books:

```bash
cd server && npm run seed && cd ..
```

3. Run the app (backend + frontend together):

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001  

Or run separately:

- `npm run dev:server` – backend only  
- `npm run dev:client` – frontend only (ensure backend is running for API)

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register (email, password, name) |
| POST | /api/auth/login | Login (email, password) |
| GET | /api/auth/me | Current user (Bearer token) |
| GET | /api/books | List books (query: category, book_type, sort, order, q) |
| GET | /api/books/categories | List categories |
| GET | /api/books/types | List book types |
| GET | /api/books/:id | Book by id |
| GET | /api/user-books | User's library (auth) |
| POST | /api/user-books/:bookId | Add to library (auth) |
| DELETE | /api/user-books/:bookId | Remove from library (auth) |
| POST | /api/admin/books | Upload book PDF (admin only; multipart: file, title, author, category, book_type, …) |
| GET | /api/books/:id/file | Serve PDF file for a book |
| POST | /api/auth/forgot-password | Send OTP to email (body: email) |
| POST | /api/auth/reset-password | Reset with OTP (body: email, otp, newPassword) |
| PUT | /api/auth/profile | Update name, about, city (auth) |
| POST | /api/auth/profile/avatar | Upload profile image (auth; multipart: avatar) |
| GET | /api/avatars/:filename | Serve profile image |

## Environment

Create `server/.env` (see `server/.env.example`). Required for OTP emails:

- `SMTP_HOST` – e.g. smtp.gmail.com
- `SMTP_PORT` – e.g. 587
- `SMTP_USER` – your email
- `SMTP_PASS` – app password (Gmail: use an App Password)
- `FROM_EMAIL` – sender address
- `FROM_NAME` – sender name

Optional:

- `PORT` – server port (default 3001)
- `MONGODB_URI` – MongoDB connection string (default `mongodb://127.0.0.1:27017/digital-library`)
- `JWT_SECRET` – secret for JWT (set in production)