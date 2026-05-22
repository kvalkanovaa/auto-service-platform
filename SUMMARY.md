# Auto Service Platform — Project Summary

## Контекст

**Дипломна работа** на Калина Валканова (2026) и portfolio проект.
Full-stack платформа, която свързва собственици на автомобили със сервизи чрез AI-базирана диагностика.

---

## Tech Stack

| Layer | Технология |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript + React Router v7 |
| Стилове | SCSS Modules (BEM) + Tailwind CSS утилити класове |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (access 15min + refresh 7d httpOnly cookie) |
| AI | Google Gemini 2.5 Flash (structured JSON output) |
| Email | Nodemailer + Mailtrap (sandbox) |
| Файлове | Cloudinary (аватари, снимки на коли) |
| Deployment | Render (server) + Vercel (client) + MongoDB Atlas |

---

## Роли

- `user` — краен клиент
- `service_owner` — собственик на сервиз (роля заложена, UI не е разработен)
- `admin` — пълен достъп + управление на сервизи

---

## Database Models

### User
```
_id, email, password (bcrypt 12 rounds), firstName, lastName, role,
avatarUrl?, refreshToken?, resetPasswordToken?, resetPasswordExpires?,
createdAt
```

### Vehicle
```
_id, ownerId, brand, model, year, engine, fuelType (petrol|diesel|electric|hybrid|lpg),
transmission (manual|automatic), vin? (17 chars), registrationNumber? (max 12),
mileage? (0–2,000,000), imageUrl?, createdAt
```

### ServiceCenter
```
_id, name, description, address, city, region, phone, email,
servicesOffered (ServiceCategory[]), workingHours {open, close, days[]},
ratingAvg, reviewCount, isApproved, createdBy, createdAt
```

### AvailableSlot
```
_id, serviceCenterId, date, time, isBooked (default false)
```

### ProblemReport
```
_id, userId, vehicleId, title, description,
status (open|matched|booked|closed),
aiSummary?, aiUrgency (low|medium|high|critical)?,
aiSuggestedCategories (ServiceCategory[])?,
aiQuestions (string[])?,          ← изчистват се след follow-up
aiBriefForShop?,                  ← на английски, за механика
aiFollowupAnswers (string[])?,    ← наличието = follow-up е направен (1 път)
selectedServiceCenterId?,
createdAt
```

### Booking
```
_id, userId, vehicleId, serviceCenterId, problemReportId?,
slotId, bookedDate, bookedTime,
status (pending|confirmed|cancelled|completed),
note?, aiBriefSnapshot?, createdAt
```

### Review
```
_id, userId, serviceCenterId, bookingId, rating (1–5), comment?, createdAt
```

---

## ServiceCategory (enum)
`engine | diagnostics | brakes | suspension | tires | electrical | air-conditioning | bodywork | transmission | oil-service`

---

## API Endpoints (имплементирани)

### Auth `/api/auth`
| Method | Route | Описание |
|--------|-------|----------|
| POST | `/register` | Регистрация |
| POST | `/login` | Логин → access token + refresh cookie |
| POST | `/logout` | Изчиства refresh token |
| GET | `/me` | Текущ потребител |
| POST | `/refresh` | Нов access token от cookie |
| PUT | `/profile` | Обнови firstName, lastName, email, avatarUrl |
| PUT | `/change-password` | Смяна на парола (verify current → set new) |
| POST | `/forgot-password` | SHA-256 токен + имейл с link (1h expiry) |
| POST | `/reset-password/:token` | Ресет на парола по токен |

### Vehicles `/api/vehicles`
| Method | Route | Описание |
|--------|-------|----------|
| GET | `/` | Моите коли |
| POST | `/` | Добави кола |
| GET | `/:id` | Детайли |
| PUT | `/:id` | Редактирай |
| DELETE | `/:id` | Изтрий |

### Problem Reports `/api/problem-reports`
| Method | Route | Описание |
|--------|-------|----------|
| GET | `/` | Всички мои репорти |
| POST | `/` | Създай (с AI данни от клиента) |
| GET | `/:id` | Детайли (populated vehicle) |
| DELETE | `/:id` | Изтрий |
| POST | `/:id/followup` | Прецизиран AI анализ с отговори (1×/репорт) |

### AI `/api/ai`
| Method | Route | Описание |
|--------|-------|----------|
| POST | `/analyze-symptoms` | vehicleId + description → AiAnalysisResult |

### Service Centers `/api/service-centers`
| Method | Route | Описание |
|--------|-------|----------|
| GET | `/` | Списък (филтър: city, category) |
| GET | `/:id` | Детайли |
| GET | `/:id/slots` | Свободни слотове |
| POST | `/match` | Намери сервизи по категории (за AI matching) |
| POST | `/` | *(admin)* Създай + auto-генерира 14 дни слотове |
| PUT | `/:id` | *(admin)* Редактирай |
| DELETE | `/:id` | *(admin)* Изтрий |
| POST | `/:id/slots` | *(admin)* Добави слотове ръчно |
| POST | `/refresh-slots` | *(admin)* Регенерира бъдещи слотове |

### Bookings `/api/bookings`
| Method | Route | Описание |
|--------|-------|----------|
| POST | `/` | Запази час (маркира слота, snapshot на AI brief) |
| GET | `/` | Моите резервации (филтър: `?vehicleId=`) |
| GET | `/:id` | Детайли |
| PUT | `/:id/cancel` | Откажи (освобождава слота) |

### Reviews `/api/reviews`
| Method | Route | Описание |
|--------|-------|----------|
| POST | `/` | Постни отзив |
| GET | `/?serviceCenterId=` | Отзиви за сервиз |

### Upload `/api/upload`
| Method | Route | Описание |
|--------|-------|----------|
| POST | `/` | Качи снимка → Cloudinary URL |

---

## AI Flow

```
1. Потребителят описва проблем + избира кола
2. POST /api/ai/analyze-symptoms { vehicleId, description }
3. Backend взима vehicle от DB, строи prompt за Gemini
4. Gemini връща структуриран JSON:
   {
     summary, urgency, suggestedCategories[], questions[], briefForShop
   }
5. Клиентът създава ProblemReport с AI данните: POST /api/problem-reports
6. Детайл страница: POST /api/service-centers/match по suggestedCategories
7. Ако потребителят отговори на въпросите:
   POST /api/problem-reports/:id/followup { answers[] }
   → refineAnalysis() с Q&A контекст → обновява report в DB
   → aiFollowupAnswers се запълва (блокира втори follow-up — 1× per report)
8. Потребителят запазва час в препоръчан сервиз
9. aiBriefSnapshot се копира в Booking за механика
```

**Ключов принцип:** AI класифицира → Backend филтрира DB. AI няма директен достъп до базата.

**Follow-up лимит:** 1 на репорт (aiFollowupAnswers наличие = заключено).
Разширение с платен абонамент: добави `aiFollowupCount` поле + план-проверка преди `refineAnalysis()`.

---

## Frontend Pages

| Route | Компонент | Достъп |
|-------|-----------|--------|
| `/dashboard` | DashboardPage | public |
| `/login` | LoginPage | public |
| `/register` | RegisterPage | public |
| `/forgot-password` | ForgotPasswordPage | public |
| `/reset-password/:token` | ResetPasswordPage | public |
| `/service-centers` | ServiceCentersPage | public |
| `/service-centers/:id` | ServiceCenterDetailPage | public |
| `/profile` | ProfilePage | protected |
| `/vehicles` | VehiclesPage | protected |
| `/vehicles/new` | VehicleNewPage | protected |
| `/vehicles/:id` | VehicleDetailPage | protected |
| `/problem-reports` | ProblemReportsPage | protected |
| `/problem-reports/new` | ProblemReportNewPage | protected |
| `/problem-reports/:id` | ProblemReportDetailPage | protected |
| `/bookings` | BookingsPage | protected |
| `/bookings/new` | BookingNewPage | protected |
| `/admin` | AdminPage | admin |

---

## Guest UX (незалогиран потребител)

- `/dashboard` и `/service-centers` са публични
- Заключените nav линкове и quick link картите показват lock badge + "Безплатно"
- Клик → `/register` с `state: { fromLocked: true }`
- RegisterPage показва feature банер с предимствата когато `fromLocked` е true
- След логин → redirect обратно към заявената страница (`from` state)
- Logout → `/dashboard` (не `/login`)

---

## Auth Architecture

```
Login → { accessToken (15min), refreshToken cookie (7d httpOnly) }
Request → Authorization: Bearer <accessToken>
401 → автоматичен retry с POST /api/auth/refresh → нов accessToken
Logout → clear refreshToken в DB + clear cookie
```

---

## Key Frontend Architecture

- **`api/axios.ts`** — custom fetch wrapper (не axios), автоматичен token refresh с retry
- **`AuthContext`** — `user`, `login`, `logout`, `register`, `updateUser`
- **`ProtectedRoute`** — redirect с `from` state за post-login redirect
- **SCSS Modules + BEM** — `@use '../styles/variables' as *`, `@use '../styles/mixins' as *`
- Tailwind само като utility (`@apply flex items-center` и т.н.)

---

## Имплементирани функционалности

- [x] JWT auth (register, login, logout, refresh, me)
- [x] Forgot/reset password (Nodemailer + Mailtrap)
- [x] Profile page (edit name/email, change password, avatar upload)
- [x] Vehicles CRUD (с валидация: VIN 17 chars, mileage 0–2M, year range)
- [x] Vehicle detail + service history (bookings filter by vehicleId)
- [x] Problem reports с AI анализ (Gemini 2.5 Flash)
- [x] AI follow-up conversation (1× per report, refined analysis)
- [x] Service centers (публичен списък, детайли, слотове, AI matching)
- [x] Bookings (запази/откажи час, AI brief snapshot)
- [x] Reviews (публикувай отзив)
- [x] Admin panel (управление на сервизи и слотове)
- [x] Guest mode (lock UI за незалогирани, feature banner при регистрация)
- [x] Responsive design (hamburger меню, мобилни layouts)
- [x] Cloudinary image upload (аватари + снимки на коли)
- [x] Two-column layout на ProblemReportDetailPage (описание + сервизи | AI анализ)
