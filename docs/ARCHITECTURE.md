# Diagnaut — Architecture & Technical Reference

Technical reference for the **Diagnaut** platform — data models, REST API, AI flow and pages. (For user-facing docs see the [README](../README.md).)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript + React Router v7 |
| Styling | SCSS Modules (BEM) + Tailwind CSS utility classes |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose (7 collections) |
| Auth | JWT (access 15min + refresh 7d httpOnly cookie) |
| AI | Google Gemini 2.5 Flash (structured JSON output) |
| Email | Nodemailer + Mailtrap (sandbox) |
| Files | Cloudinary (avatars, vehicle photos) + Multer |
| Tests | Vitest (client + server) |
| DB hosting | MongoDB Atlas |

---

## Roles

- `user` — end customer
- `service_owner` — workshop owner (role defined in the model; no dedicated UI — centers are added via a public application + admin approval)
- `admin` — full access + service center management and approval

---

## Database Models

### User
```
_id, email, password (bcrypt 12 rounds), firstName, lastName, role,
avatarUrl?, refreshToken?, resetPasswordToken?, resetPasswordExpires?,
createdAt, updatedAt
```

### Vehicle
```
_id, ownerId → User, brand, model, year, engine,
fuelType (petrol|diesel|electric|hybrid|lpg), transmission (manual|automatic),
vin? (17 chars), registrationNumber? (max 12), mileage? (0–2,000,000), imageUrl?,
createdAt, updatedAt
```

### ServiceCenter
```
_id, name, description, address, city, region, phone, email,
servicesOffered (ServiceCategory[]), workingHours {open, close, days[]},
ratingAvg, reviewCount, isApproved (default false), applicationNote?,
createdBy? → User, createdAt, updatedAt
```

### AvailableSlot
```
_id, serviceCenterId → ServiceCenter, date, time, isBooked (default false)
```
Unique index (serviceCenterId, date, time) — prevents double-booking.

### ProblemReport
```
_id, userId → User, vehicleId → Vehicle, title, description,
status (open|booked|closed),
aiSummary?, aiUrgency (low|medium|high|critical)?,
aiSuggestedCategories (ServiceCategory[])?,
aiQuestions (string[])?,          ← cleared after follow-up
aiBriefForShop?,                  ← English, for the mechanic
aiFollowupAnswers (string[])?,    ← presence = follow-up done (once)
createdAt, updatedAt
```

### Booking
```
_id, userId → User, vehicleId → Vehicle, serviceCenterId → ServiceCenter,
problemReportId? → ProblemReport,   ← optional (booking without diagnosis)
slotId → AvailableSlot, bookedDate, bookedTime,
status (pending|confirmed|cancelled|completed),
note?, aiBriefSnapshot?, createdAt, updatedAt
```

### Review
```
_id, userId → User, serviceCenterId → ServiceCenter,
bookingId → Booking (unique), rating (1–5), comment?, createdAt, updatedAt
```
Unique index on `bookingId` — exactly one review per booking.

---

## ServiceCategory (enum)
`engine | diagnostics | brakes | suspension | tires | electrical | air-conditioning | bodywork | transmission | oil-service`

---

## API Endpoints

### Auth `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register |
| POST | `/login` | Login → access token + refresh cookie |
| POST | `/logout` | Clear refresh token |
| GET | `/me` | Current user |
| POST | `/refresh` | New access token from cookie |
| PUT | `/profile` | Update firstName, lastName, email, avatarUrl |
| PUT | `/change-password` | Change password |
| POST | `/forgot-password` | SHA-256 token + email (1h expiry) |
| POST | `/reset-password/:token` | Reset password by token |

### Vehicles `/api/vehicles`
`GET /` · `POST /` · `GET /:id` · `PUT /:id` · `DELETE /:id`

### Problem Reports `/api/problem-reports`
`GET /` · `POST /` · `GET /:id` · `DELETE /:id` · `POST /:id/followup` (refined AI analysis, once per report)

### AI `/api/ai`
`POST /analyze-symptoms` — vehicleId + description → structured AI result

### Service Centers `/api/service-centers`
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | List (filter: city, category; approved only) |
| GET | `/match` | Centers by categories (AI matching) |
| GET | `/pending` | *(admin)* Pending applications |
| GET | `/:id` | Details |
| GET | `/:id/slots` | Free slots |
| POST | `/apply` | *(public)* Partner application (unapproved) |
| POST | `/` | *(admin)* Create + auto-generate 14 days of slots |
| PATCH | `/:id/approve` | *(admin)* Approve application + generate slots |
| PUT | `/:id` | *(admin)* Edit |
| DELETE | `/:id` | *(admin)* Delete |
| POST | `/:id/slots` | *(admin)* Add slots manually |
| POST | `/all/refresh-slots` | *(admin)* Regenerate future slots |

### Bookings `/api/bookings`
`POST /` (reserves the slot, snapshots the AI brief) · `GET /` (filter `?vehicleId=`) · `GET /:id` · `PATCH /:id/cancel` · `PATCH /:id/complete`

### Reviews `/api/reviews`
`POST /` · `GET /service-center/:id`

### Contact `/api/contact`
`POST /` — sends the contact-form message by email

### Upload `/api/upload`
`POST /` — upload an image → Cloudinary URL

---

## AI Flow

```
1. User describes the problem + selects a vehicle
2. POST /api/ai/analyze-symptoms { vehicleId, description }
3. Backend loads the vehicle from DB, builds a prompt for Gemini
4. Gemini returns structured JSON: { summary, urgency, suggestedCategories[], questions[], briefForShop }
5. Client creates a ProblemReport: POST /api/problem-reports
6. Detail page: POST /api/service-centers/match by suggestedCategories
7. (optional) follow-up: POST /api/problem-reports/:id/followup { answers[] } → refineAnalysis() (once per report)
8. Book a slot; aiBriefSnapshot is copied into the Booking for the mechanic
```

**Core principle:** the AI classifies → the backend filters the DB. The AI has no direct database access.

**Optional diagnosis:** a booking can also be made **without** an AI analysis — directly from a service center (`Booking.problemReportId` is optional).

**Follow-up limit:** one per report (presence of `aiFollowupAnswers` locks it).

---

## Frontend Pages

| Route | Component | Access |
|-------|-----------|--------|
| `/dashboard` | DashboardPage | public |
| `/login`, `/register` | Login/RegisterPage | public |
| `/forgot-password`, `/reset-password/:token` | Forgot/ResetPasswordPage | public |
| `/service-centers` | ServiceCentersPage | public |
| `/service-centers/:id` | ServiceCenterDetailPage | public |
| `/become-partner` | ServiceCenterApplyPage | public |
| `/faq` | FaqPage | public |
| `/contact` | ContactPage | public |
| `/profile` | ProfilePage | protected |
| `/vehicles`, `/vehicles/new`, `/vehicles/:id` | Vehicle pages | protected |
| `/problem-reports`, `/new`, `/:id` | ProblemReport pages | protected |
| `/bookings`, `/bookings/new` | Booking pages | protected |
| `/admin` | AdminPage | admin |

---

## Guest UX

- `/dashboard`, `/service-centers`, `/faq`, `/contact`, `/become-partner` are public
- Locked nav links and quick-link cards show a lock badge + "Free"
- Click → `/register` with `state: { fromLocked: true }` → feature banner on RegisterPage
- After login → redirect back to the requested page (`from` state); Logout → `/dashboard`

---

## Auth Architecture

```
Login → { accessToken (15min), refreshToken cookie (7d httpOnly) }
Request → Authorization: Bearer <accessToken>
401 → automatic retry via POST /api/auth/refresh → new accessToken
Logout → clear refreshToken in DB + clear cookie
```

---

## Key Frontend Architecture

- **`api/axios.ts`** — custom fetch wrapper (not axios) with automatic token refresh + retry
- **`AuthContext`** — `user`, `login`, `logout`, `register`, `updateUser`
- **`ProtectedRoute`** — redirect with `from` state for post-login return
- **SCSS Modules + BEM** — `@use '../styles/variables' as *`, `@use '../styles/mixins' as *`; Tailwind used only as utilities

---

## Implemented Functionality

- [x] JWT auth (register, login, logout, refresh, me)
- [x] Forgot/reset password (Nodemailer + Mailtrap)
- [x] Profile page (edit name/email, change password, avatar upload)
- [x] Vehicles CRUD (validation: VIN 17 chars, mileage 0–2M, year range)
- [x] Vehicle detail + service history
- [x] Problem reports with AI analysis (Gemini 2.5 Flash) + follow-up (once)
- [x] Service centers (list, details, slots, AI matching)
- [x] Partner application + admin approval
- [x] Bookings — reserve **with or without** AI diagnosis, cancel, complete
- [x] Reviews — review after a completed booking + automatic rating recalculation
- [x] Email notifications (booking to shop, cancellation, password reset, contact)
- [x] Admin panel (create, edit, approve, delete service centers + slots)
- [x] Contact and FAQ pages
- [x] Guest mode (lock UI, feature banner)
- [x] Responsive design (hamburger menu, mobile layouts)
- [x] Cloudinary image upload (avatars + vehicle photos)
- [x] Automated tests (Vitest, client + server)
