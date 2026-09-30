# SmileCare — Dental Care Management System

A full-stack dental clinic platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** and **shadcn/ui**:

- A premium public website for the fictional **SmileCare Dental Clinic, Indore** (_Healthy Smile. Confident You._)
- Real-time **online booking** (6 steps, slot conflict protection on the server)
- A complete **admin dashboard**: calendar, appointments, patients with odontogram, treatment plans, prescriptions, billing & payments, CMS, leads, reports and settings
- **JSON-file persistence** behind a repository layer that can be swapped for PostgreSQL/Prisma without touching the UI

> ⚠️ Demo project — all people, phone numbers and emails are fictional. Do not store real patient data.

---

## 1. Quick start

```bash
# Node.js 20.9+ (tested on Node 22)
npm install
cp .env.example .env.local      # optional — sensible defaults are built in
npm run seed                    # (re)generate demo data relative to today's date
npm run dev                     # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

### Demo credentials

| URL | Email | Password |
| --- | --- | --- |
| `/admin/login` | `admin@smilecare.com` | `admin123` |

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run seed` | Rewrites `data/*.json` with fresh demo data — appointments are spread from ~6 weeks ago to 3 weeks ahead of **today**, so the calendar is always populated |
| `npm run typecheck` | `tsc --noEmit` |
| `python3 scripts/generate-images.py` | Regenerates the bundled SVG illustrations (optional) |

---

## 2. Packages

**Runtime**

| Package | Purpose |
| --- | --- |
| `next@16`, `react@19`, `react-dom@19` | Framework |
| `@radix-ui/react-*` (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, radio-group, select, separator, slot, switch, tabs, tooltip), `cmdk`, `vaul`, `sonner`, `react-day-picker@9`, `class-variance-authority`, `clsx`, `tailwind-merge` | shadcn/ui component primitives |
| `lucide-react` | Icons |
| `@tanstack/react-query@5` (+ devtools in development) | Client data fetching, caching, mutations, loading/error states |
| `react-hook-form`, `@hookform/resolvers`, `zod@4` | Forms & validation (client **and** server) |
| `date-fns` | Dates |
| `@fullcalendar/react@6` + `daygrid`, `timegrid`, `list`, `interaction` | Appointment calendar (month / week / day / agenda) |
| `recharts` | Dashboard & report charts |
| `@fontsource-variable/inter` | Self-hosted Inter font (no build-time network needed) |
| `server-only` | Guarantees data/fs modules never reach the browser bundle |
| `qrcode` | Generates the UPI payment QR code (in the browser) |
| `nodemailer` | Sends payment receipt emails (Ethereal test inbox by default, any SMTP in production) |

**Dev**: `typescript@5`, `tailwindcss@4`, `@tailwindcss/postcss`, `tw-animate-css`, `@types/*`.

> The shadcn/ui components live in `components/ui/` as source (the shadcn way) — no runtime dependency on a shadcn package.

---

## 3. Folder structure

```text
smilecare/
├── app/
│   ├── (public)/                    # Public website (server components)
│   │   ├── page.tsx                 # Home
│   │   ├── about/  dentists/[slug]/  services/[slug]/
│   │   ├── portfolio/  gallery/  testimonials/  faqs/  contact/
│   │   ├── book-appointment/        # 6-step booking wizard
│   │   ├── layout.tsx  error.tsx
│   │   └── */loading.tsx            # skeletons on list pages
│   ├── admin/
│   │   ├── login/                   # Demo sign-in
│   │   ├── print/                   # Print-ready invoice & prescription pages
│   │   └── (dashboard)/             # Sidebar shell (protected)
│   │       ├── dashboard/ calendar/ appointments/ patients/[id]/
│   │       ├── treatments/ prescriptions/ billing/
│   │       ├── services/ dentists/ portfolio/ gallery/ testimonials/ faqs/ leads/
│   │       ├── reports/ settings/
│   │       └── layout.tsx loading.tsx error.tsx
│   ├── api/                         # Route Handlers (see §5)
│   ├── layout.tsx  globals.css  not-found.tsx
├── components/
│   ├── ui/                          # shadcn/ui components (button, dialog, sheet, table, …)
│   ├── public/                      # Header, footer, hero, cards, before/after slider, gallery…
│   ├── booking/                     # Booking wizard steps, slot picker, useSlots hook
│   ├── admin/                       # Shell, sidebar, topbar, charts, CMS managers, settings
│   ├── calendar/                    # FullCalendar wrapper + filters (dynamically imported)
│   ├── appointments/                # Table, detail sheet, reschedule & create dialogs
│   ├── patients/                    # List, profile tabs, odontogram (dental chart)
│   ├── clinical/                    # Treatment cards, billing view, printable documents
│   ├── forms/                       # Treatment / prescription / invoice / payment / contact forms
│   ├── providers/                   # QueryProvider (TanStack QueryClient)
│   └── shared/                      # RenderContent, skeletons, status badges, empty states, confirm dialog…
├── lib/
│   ├── json-db/                     # store.ts (atomic fs I/O + locks) · repository.ts (generic repo)
│   ├── repositories/                # Concrete repositories — the ONLY persistence boundary
│   ├── services/                    # Business logic (slots, bookings, billing maths, analytics…)
│   ├── validations/                 # Zod schemas shared by client forms and API
│   ├── api/                         # server.ts (route wrapper, errors) · client.ts (fetch client) · crud.ts
│   ├── query/                       # TanStack Query: keys, useApiMutation, per-domain query/mutation hooks
│   ├── auth/                        # Demo session (signed httpOnly cookie)
│   ├── constants/                   # Status colours, transitions, nav, tooth conditions
│   └── utils/                       # Formatting, time maths, availability
├── types/                           # Domain types (index.ts) and view models (views.ts)
├── data/                            # JSON "database" (16 files)
├── public/images/                   # Generated SVG artwork (swap for photos via the CMS)
├── scripts/seed.mjs                 # Demo data generator
└── proxy.ts                         # Next 16 proxy (formerly middleware) protecting /admin pages
```

---

## 4. Architecture

```text
Admin & interactive UI:
Client Component ─▶ TanStack Query hook ─▶ fetch ─▶ Route Handler ─▶ Service ─▶ Repository ─▶ JSON file
   <RenderContent>     (lib/query)          (lib/api/client.ts) (app/api/**)  (lib/services) (lib/repositories) (data/*.json)

Public website (SEO):
Server Component ──────────────────────────────────────────────▶ Service ─▶ Repository ─▶ JSON file
```

### Data fetching with TanStack Query

- **Queries** — every admin screen reads through hooks in `lib/query` (`useAppointments`, `usePatients`, `usePatientProfile`, `useInvoices`, `useCollection("faqs")`, `useReports(range)`, `useLookups()`…). Keys live in `lib/query/keys.ts` and are hierarchical, so a whole family can be invalidated by prefix.
- **Mutations** — `useApiMutation` (`lib/query/mutation.ts`) wraps `useMutation` with success/error toasts and **automatic cache invalidation** (the `affects` map says which caches a write makes stale — e.g. a payment refreshes invoices, payments, the patient profile, dashboard and reports). No `router.refresh()` or manual refetching.
- **Optimistic updates** — appointment status changes update every cached appointment list immediately (calendar colours flip instantly) and roll back if the server rejects the change.
- **Other behaviour** — notifications poll every 30 s; reports keep the previous range on screen while a new one loads; availability (`useSlotsQuery`) is never cached stale; 4xx errors are not retried; the cache is cleared on sign-out.
- **`<RenderContent>`** (`components/shared/render-content.tsx`) renders the right UI for a query's lifecycle — skeleton while loading, error card with **Try again**, optional empty state, optional "Updating…" badge during background refetches — then calls `children(data)`. `combineQueries(a, b, c)` merges several queries into one so a screen waits for all its data together:

```tsx
const query = combineQueries(useAppointments(), useLookups());
return (
  <RenderContent query={query} loading={<TableSkeleton columns={8} />} errorTitle="Couldn't load appointments">
    {([appointments, lookups]) => <AppointmentsBoard appointments={appointments} {...lookups} />}
  </RenderContent>
);
```

Skeleton presets (table, cards, stats, charts, calendar, profile, forms) are in `components/shared/skeletons.tsx`.

**Key rules this codebase follows**

- **Filesystem access exists in exactly one module** — `lib/json-db/store.ts` (marked `server-only`). No component imports `fs`.
- **Writes are atomic and serialised** — each write goes to a temp file then `rename`s; read-modify-write cycles run under a per-file lock, so two simultaneous bookings can't both take the same slot.
- **Double booking is prevented server-side** inside the appointments transaction (`assertBookable` in `appointment.service.ts`), independent of what the UI shows.
- **Validation happens twice** — the same Zod schema drives React Hook Form on the client and `schema.parse()` on the server.
- **Uniform API envelope** — `{ ok: true, data }` or `{ ok: false, error: { code, message, details } }`. Zod → 422, missing records → 404, conflicts (slot taken, duplicate slug/phone) → 409, bad JSON / invalid transition → 400, auth → 401, storage errors → 500 with **no file paths or stack traces** exposed.
- **Server Components for the public site** (SEO, no loading flash); the authenticated admin app is client-rendered with TanStack Query so every screen gets consistent loading/error handling and live cache updates. FullCalendar is loaded with `next/dynamic` (`ssr: false`).
- **Auth in two layers** — `proxy.ts` redirects unauthenticated `/admin/*` page requests; every admin API route independently calls `requireAdmin()`.

### Appointment workflow

| From | Allowed next states |
| --- | --- |
| PENDING (grey) | CONFIRMED, CANCELLED, RESCHEDULED |
| CONFIRMED (blue) | COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED |
| RESCHEDULED (purple) | CONFIRMED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED |
| NO_SHOW (yellow) | RESCHEDULED, CANCELLED |
| CANCELLED (red) | PENDING (reopen, if slot still free) |
| COMPLETED (green) | — |

Colours and transitions live in `lib/constants/index.ts` and are shared by the calendar, tables, badges and the API.

### Slot logic (`lib/services/slots.ts`)

Slots are generated from each dentist's working hours at the clinic's slot interval (Settings → 15/20/30/60 min), then:
lunch breaks are removed · slots overlapping any PENDING / CONFIRMED / RESCHEDULED / COMPLETED / NO_SHOW appointment for that dentist (using the **service duration**, not just the start time) are marked **Booked** · past times (and anything within 30 min) are marked unavailable · leave days return no slots. The same pure function powers the public booking UI, admin rescheduling and the server-side guard.

### Billing maths (`lib/services/billing.service.ts`)

`subtotal = Σ qty × price` → minus flat line discounts → `tax = taxable × rate%` → `total`. Payments can't exceed the balance; refunds can't exceed the net amount paid; a full refund marks the invoice **REFUNDED**. Invoices with payments can be cancelled only after refunding and can never be deleted.

### Collecting payments (UPI QR / Cash) & receipt emails

1. **Admin → Settings → Payments (UPI)**: enter the clinic's UPI ID (e.g. `clinicname@okhdfcbank`) and payee name. Until a UPI ID is set, the QR option shows a link to this setting.
2. On any unpaid/partial invoice (Billing page or the patient's Billing tab) choose **⋯ → Collect payment**. The dialog shows the amount due and two options:
   - **UPI**: renders a QR for the standard `upi://pay?pa=…&pn=…&am=<balance>&cu=INR&tn=Invoice <no>` link. The patient scans it with GPay/PhonePe/Paytm/BHIM, sees the amount pre-filled and pays straight into the clinic's account. Staff check their UPI app, optionally type the UTR, and click **Payment received**.
   - **Cash**: shows only the total. Staff click **Cash received**.
3. The payment is recorded for the full balance (`POST /api/invoices/:id/payments`), the invoice becomes **Paid**, and `billing.service.ts → sendReceipt()` emails a receipt to the patient's email. The result (`SENT` / `FAILED` / `SKIPPED` + preview link) is stored on the payment and shown in **Billing → Payments → Receipt**.

A plain UPI QR has no callback, so the app **cannot detect** a UPI payment by itself: staff confirm it. Automatic confirmation needs a payment gateway (e.g. Razorpay test mode + webhook). Partial, card or bank payments still use **Record other payment**.

**Email** (`lib/email/mailer.ts`, template in `lib/email/templates.ts`):
- **No config (default)**: Nodemailer creates a free [Ethereal](https://ethereal.email) test inbox automatically (`createTestAccount()`). Emails are **not** delivered. After each payment a toast offers **View email**, the Payments table links to the preview, and the server log prints the preview URL plus the inbox login.
- **Real email**: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` in `.env.local` (see `.env.example`). For Gmail, use `smtp.gmail.com`, port `465` and a 16-character [app password](https://myaccount.google.com/apppasswords).
- A mail failure never undoes a payment. Staff see a warning toast and the payment row shows **Failed**.

### Notifications

`notification.service.ts` records events (new request, confirmed, cancelled, new patient, payment, new lead) in `notifications.json` (shown in the admin bell) and **simulates** email/SMS/WhatsApp delivery in `deliver()` — the single integration point for real providers.

---

## 5. API endpoints

All endpoints return the `{ ok, data | error }` envelope. 🔒 = requires admin session cookie.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` → sets httpOnly cookie |
| POST | `/api/auth/logout` | |
| GET | `/api/auth/session` | current user or `null` |
| GET | `/api/appointments/slots?dentistId&date&serviceId[&excludeId]` | Public availability |
| GET 🔒 | `/api/appointments?from&to&dentistId&serviceId&status&patientId&q` | |
| POST | `/api/appointments` | Public booking (`fullName…`) → **PENDING**; admin create (`patientName…`) 🔒 |
| GET / PUT / DELETE 🔒 | `/api/appointments/:id` | PUT: `{ status, note }` or `{ date, time }` (reschedule) or notes |
| GET / POST 🔒 | `/api/patients` | list with last visit / next appointment / outstanding |
| GET / PUT / DELETE 🔒 | `/api/patients/:id` | GET returns the full profile bundle |
| PUT 🔒 | `/api/patients/:id/teeth` | `{ teeth: ["16"], condition: "DECAY", notes? }` |
| POST 🔒 · DELETE 🔒 | `/api/patients/:id/notes` · `/api/patients/:id/notes/:noteId` | |
| POST 🔒 · DELETE 🔒 | `/api/patients/:id/documents` · `/api/patients/:id/documents/:docId` | metadata records |
| GET · POST 🔒 | `/api/services` | public: published only; admin `?all=1` |
| GET · PUT 🔒 · DELETE 🔒 | `/api/services/:idOrSlug` | |
| GET · POST 🔒 | `/api/dentists` | `?serviceId=` filter; admin `?all=1` |
| GET · PUT 🔒 · DELETE 🔒 | `/api/dentists/:id` | working hours, leave, services |
| GET 🔒 · POST 🔒 | `/api/treatments` | |
| GET · PUT · DELETE 🔒 | `/api/treatments/:id` | ticking steps auto-updates status |
| GET 🔒 · POST 🔒 | `/api/prescriptions` | |
| GET · PUT · DELETE 🔒 | `/api/prescriptions/:id` | |
| GET 🔒 · POST 🔒 | `/api/invoices` | `?status=OUTSTANDING` etc. |
| GET · PUT · DELETE 🔒 | `/api/invoices/:id` | |
| POST 🔒 | `/api/invoices/:id/payments` | `{ amount, method, type: PAYMENT|REFUND, date, reference }` |
| POST 🔒 | `/api/invoices/:id/cancel` | |
| GET 🔒 | `/api/payments` | |
| GET · POST 🔒 | `/api/portfolio` · `/api/gallery` · `/api/testimonials` · `/api/faqs` | public GET returns published/approved only |
| GET · PUT 🔒 · DELETE 🔒 | `/api/portfolio/:id` · `/api/gallery/:id` · `/api/testimonials/:id` · `/api/faqs/:id` | |
| GET 🔒 · POST | `/api/leads` | public POST = contact form; admin POST with `status` = manual lead |
| GET · PUT · DELETE 🔒 | `/api/leads/:id` | |
| GET · PUT 🔒 | `/api/settings` | clinic info, booking & billing rules |
| GET · PUT 🔒 | `/api/content` | website CMS content (hero, stats, about, CTA…) |
| GET 🔒 · PUT 🔒 | `/api/notifications` · `/api/notifications/:id` | PUT marks read |
| GET 🔒 | `/api/dashboard` · `/api/reports?from&to` | aggregates |

Example:

```bash
curl -X POST localhost:3000/api/appointments -H 'Content-Type: application/json' -d '{
  "fullName":"Test Patient","phone":"98765 43210","email":"t@example.com","dateOfBirth":"1990-05-20",
  "serviceId":"SRV-002","dentistId":"DR-002","date":"2026-10-06","time":"10:00",
  "reason":"Tooth pain","notes":""}'
# → 201 { ok: true, data: { id: "APT-1068", status: "PENDING", … } }
# same request again → 409 { ok: false, error: { code: "SLOT_UNAVAILABLE", … } }
```

---

## 6. JSON data structure (`/data`)

| File | Shape | Seeded |
| --- | --- | --- |
| `settings.json` | `ClinicSettings` object (name, contact, hours, social, maps, slotInterval, bookingWindowDays, taxRate, invoicePrefix) | 1 |
| `clinic.json` | `WebsiteContent` object (hero, stats, whyChooseUs, about, cta, contact) | 1 |
| `services.json` | `Service[]` — slug, category, price, duration, benefits, procedure, faqs, published | 16 |
| `dentists.json` | `Dentist[]` — serviceIds, workingHours[7], leaves[] | 3 |
| `patients.json` | `Patient[]` — history, allergies, `dentalChart` (FDI tooth → condition), notes[], documents[] | 22 |
| `appointments.json` | `Appointment[]` — patient/service/dentist ids, date, time, duration, status, history[] | ~67 |
| `treatments.json` | `Treatment[]` — steps[{label, done}], cost, status, dates | 12 |
| `prescriptions.json` | `Prescription[]` — diagnosis, medicines[{name,dosage,frequency,duration,instructions}] | 10 |
| `invoices.json` | `Invoice[]` — items[], taxRate + derived totals/paid/balance/status | 60+ |
| `payments.json` | `Payment[]` — invoiceId, amount, method, type PAYMENT/REFUND | 55+ |
| `portfolio.json` · `gallery.json` · `testimonials.json` · `faqs.json` · `leads.json` · `notifications.json` | CMS collections | 10 · 12 · 11 · 16 · 11 · 6 |

Every record has `id`, `createdAt`, `updatedAt`. IDs are human-friendly (`P-0001`, `APT-1001`, `INV-0001`, `SC-2026-0001` invoice numbers). Full TypeScript definitions: `types/index.ts`.

---

## 7. Replacing JSON with PostgreSQL + Prisma

The UI, route handlers and services only depend on the repository **interface** (`lib/json-db/repository.ts → Repository<T>`). To migrate:

1. **Install & init**
   ```bash
   npm i @prisma/client && npm i -D prisma
   npx prisma init --datasource-provider postgresql
   ```
2. **Model the schema** from `types/index.ts` — 1:1 tables for `Patient`, `Dentist`, `Service`, `Appointment`, `Treatment`, `Prescription`, `Invoice`, `Payment`, `Lead`, etc. Use enums for statuses; store nested arrays (`dentalChart`, `history`, `steps`, `medicines`, `items`, `workingHours`) as `Json` columns first, normalise later if needed. Add a **unique index / exclusion constraint** on `(dentistId, date, time)` for active appointments as a database-level double-booking guard.
3. **Implement Prisma repositories** with the same methods:
   ```ts
   // lib/repositories/index.ts
   export const appointmentRepository: Repository<Appointment> = {
     getAll: () => prisma.appointment.findMany(),
     getById: (id) => prisma.appointment.findUnique({ where: { id } }),
     findOne: …, findMany: …,
     create: (data) => prisma.appointment.create({ data }),
     update: (id, data) => prisma.appointment.update({ where: { id }, data }),
     delete: async (id) => !!(await prisma.appointment.delete({ where: { id } })),
     transaction: (fn) => prisma.$transaction(async (tx) => { /* load, fn(items), persist diff */ }),
   };
   ```
   For hot paths, replace `findMany(predicate)` calls in services with Prisma `where` clauses (the services are the only callers).
4. **Migrate data**: write a one-off script that reads `data/*.json` and `createMany()`s into Postgres (IDs are already stable strings).
5. **Settings/content** documents become single-row tables (or a `kv` table with `Json` values).
6. Remove `lib/json-db/` and `data/` once parity tests pass. No component or route changes are required.

### Replacing demo auth

Swap `lib/auth/session.ts` for Auth.js / Clerk / your IdP. Keep the exported `getSession()` and `requireAdmin()` signatures and update `proxy.ts`; everything else keeps working. Set a strong `AUTH_SECRET` in any shared environment.

---

## 8. Customising content & images

- Everything public is editable in **Admin → Settings → Website content** and the CMS pages (services, dentists, portfolio, gallery, testimonials, FAQs).
- Bundled images are generated flat SVG illustrations in `public/images/`. Paste any image URL (e.g. `https://images.unsplash.com/...`) into an image field to use photography; Unsplash/Pexels URLs are optimised by `next/image`, other hosts are served as-is.
- Theme tokens (colours, status palette, radii, shadows) are in `app/globals.css`.

---

## 9. Accessibility & SEO notes

Semantic landmarks, skip link, labelled form controls with `aria-invalid` + inline messages, keyboard-operable dialogs/menus (Radix), visible focus rings, `aria-live` feedback on async steps, colour never used alone for status (badges carry text labels; calendar has a legend).
Every public page exports Metadata (title, description, Open Graph); service & dentist pages generate metadata from JSON; the home page includes `Dentist` JSON-LD and the FAQ page `FAQPage` JSON-LD.
