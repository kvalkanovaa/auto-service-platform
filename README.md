# AutoService Platform

AI-powered platform connecting vehicle owners with certified service centers in Bulgaria.

Built as a diploma thesis project (2026) — full-stack monorepo with React frontend and Node.js backend.

---

## Features

- **Vehicle management** — register and manage your vehicles with full specs
- **AI symptom diagnosis** — describe a problem in plain text, get structured analysis powered by Gemini AI
- **AI follow-up conversation** — answer clarifying questions for a refined, precise diagnosis
- **Service center matching** — AI-recommended workshops based on diagnosed categories
- **Online booking** — reserve available time slots at service centers
- **Problem history** — track all reports and bookings per vehicle
- **Profile & avatar** — edit account details and upload a profile photo
- **Forgot password** — secure email-based password reset
- **Guest mode** — browse public content without registration

---

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- React Router v7
- SCSS Modules (BEM) + Tailwind CSS
- React Hook Form + Zod

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (access token + httpOnly refresh cookie)
- Google Gemini 2.5 Flash
- Nodemailer + Mailtrap
- Cloudinary

---

## Project Structure

```
auto-service-platform/
├── client/          # React frontend (Vite)
└── server/          # Express backend
```

---

## Getting Started

### Prerequisites

- Node.js 18+
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
# Fill in: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY, CLOUDINARY_*, MAILTRAP_*
```

### Run locally

```bash
# Terminal 1 — backend (port 5000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

---

## User Roles

| Role | Access |
|------|--------|
| `user` | Vehicle management, problem reports, bookings |
| `admin` | All of the above + service center management |

---

## Author

**Kalina Valkanova** — [GitHub](https://github.com/kvalkanovaa) · [LinkedIn](https://www.linkedin.com/in/kalina-valkanova/)
