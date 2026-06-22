# Diagnaut

AI-powered platform connecting vehicle owners with service centers in Bulgaria. Describe a car problem in plain language, let AI diagnose it, and book a slot at a matching workshop.

> **Diagnaut** = _diagnosis_ + the suffix _-naut_ (explorer/voyager) — a navigator through your car's diagnosis.

Built as a diploma thesis project (2026) — full-stack monorepo with a React frontend and a Node.js backend.

---

## Features

- **Vehicle management** — register, edit and delete vehicles with full specs and photos
- **AI symptom diagnosis** — describe a problem in plain text and get a structured analysis (summary, urgency, suggested service categories) powered by Google Gemini
- **AI follow-up** — answer clarifying questions for a refined, more precise diagnosis
- **Service center matching** — AI-recommended workshops based on the diagnosed categories
- **Online booking** — reserve a free time slot, **with or without** a prior AI diagnosis
- **Reviews & ratings** — leave a review after a completed booking; the center's rating is recalculated automatically
- **Become a partner** — service centers apply through a public form; an admin reviews and approves them
- **Email notifications** — booking confirmation/cancellation to the shop, password reset, contact messages (via Nodemailer/Mailtrap)
- **Profile & avatar** — edit account details and upload a profile photo
- **Forgot / reset password** — secure email-based flow
- **Guest mode** — browse public content without registration
- **FAQ & Contact** — informational pages with a working contact form
- **Automated tests** — Vitest unit tests on both client and server

---

## Tech Stack

**Frontend**

- React 19 + TypeScript + Vite
- React Router v7
- SCSS Modules (BEM) + Tailwind CSS
- React Hook Form + Zod
- Vitest

**Backend**

- Node.js + Express + TypeScript
- MongoDB + Mongoose (7 collections)
- JWT (access token + httpOnly refresh cookie) + bcrypt
- Google Gemini 2.5 Flash (structured JSON output)
- Nodemailer + Mailtrap
- Cloudinary + Multer
- Zod validation, rate limiting
- Vitest

---

## Pages

- **Dashboard** — landing with quick links and a "how it works" overview
- **Auth** — login, register, forgot password, reset password
- **Vehicles** — list, add, detail (with service history)
- **Problem reports** — list, new (AI analysis), detail (recommended centers)
- **Service centers** — list & filter, detail (free slots + reviews), become a partner
- **Bookings** — list, new, complete & leave a review
- **Profile** — account details and avatar
- **FAQ** & **Contact**
- **Admin panel** — create, edit, approve and delete service centers; regenerate time slots

---

## Project Structure

```
auto-service-platform/
├── client/          # React frontend (Vite)
└── server/          # Express backend (REST API)
```

---

## Documentation

- [Architecture & technical reference](docs/ARCHITECTURE.md) — data models, REST API, AI flow and the full page list

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Google Gemini API key — [aistudio.google.com](https://aistudio.google.com)

### Setup

```bash
# Clone
git clone https://github.com/kvalkanovaa/auto-service-platform.git
cd auto-service-platform

# Install dependencies
cd server && npm install
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Fill in: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY, CLOUDINARY_*, MAILTRAP_*
```

### Run locally

```bash
# Terminal 1 — backend (port 5000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

### Tests

```bash
cd server && npm test    # backend unit tests
cd client && npm test    # frontend unit tests
```

---

## User Roles

| Role    | Access                                                                            |
| ------- | --------------------------------------------------------------------------------- |
| `user`  | Vehicle management, AI problem reports, bookings, reviews                         |
| `admin` | All of the above + service center management and approval of partner applications |

Service centers join by submitting a public **"Become a partner"** application, which becomes visible only after an admin approves it.

---

## Author

**Kalina Valkanova** — [GitHub](https://github.com/kvalkanovaa) · [LinkedIn](https://www.linkedin.com/in/kalina-valkanova/)
