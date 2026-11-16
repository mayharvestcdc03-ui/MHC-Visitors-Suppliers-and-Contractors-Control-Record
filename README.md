# MHC Visitor Management System

> **May Harvest Corporation** – Enterprise Visitor, Supplier & Contractor Monitoring with One-Time Gate Pass

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS (Custom MHC Brand Colors)
- **Database**: SQLite (dev) → PostgreSQL (production via Neon/Supabase)
- **ORM**: Prisma v5
- **Security**: bcryptjs password hashing, Zod validation, Audit Logs
- **Exports**: ExcelJS (.xlsx reports)
- **Compliance**: Philippine Data Privacy Act (RA 10173)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npx prisma db push
npx prisma db seed
```

### 3. Run Dev Server
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## 👤 Default Accounts (after seed)

| Role  | Email                        | Password       |
|-------|------------------------------|----------------|
| Admin | admin@mayharvest.com         | Admin@MHC2026  |
| Guard | guard1@mayharvest.com        | Guard@MHC2026  |
| Guard | guard2@mayharvest.com        | Guard@MHC2026  |

---

## 📄 Pages

| URL         | Description                              |
|-------------|------------------------------------------|
| `/`         | Visitor Registration Form (14-question Health Declaration, ID Upload) |
| `/guard`    | Guard Panel – ID Verification, Approve/Reject, Time In/Out, QR Scan |
| `/records`  | Admin Records – Search, Filter, Stats, Excel Export |

---

## 📁 Project Structure

```
mhc-visitor-management/
├── app/
│   ├── api/
│   │   ├── register/route.ts    # Visitor registration API
│   │   ├── visitors/route.ts    # List visitors API
│   │   ├── visitors/[id]/action/route.ts  # Approve/Reject/Entry/Exit
│   │   ├── scan/route.ts        # QR code lookup
│   │   └── export/route.ts      # Excel export
│   ├── guard/page.tsx           # Guard verification panel
│   ├── records/page.tsx         # Admin monitoring records
│   ├── layout.tsx
│   ├── page.tsx                 # Visitor registration form
│   └── globals.css
├── components/
│   └── Header.tsx               # Header & Navigation
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Utilities (maskId, formatDate, passCode gen)
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Default users seed
└── storage/
    └── ids/                     # Uploaded ID files (private, not public)
```

---

## 🔐 Data Privacy (RA 10173)

- ID files stored in `/storage/ids/` (private folder, NOT in `/public`)
- ID numbers are maskable on display
- All Guard actions logged in `AuditLog` table
- System designed to support 30-60 day auto-purge of ID photos

---

## 🚀 Production Deployment

### Upgrade Database to PostgreSQL (Neon)
1. Update `DATABASE_URL` in `.env` to Neon/Supabase connection string
2. Update `prisma/schema.prisma` → `provider = "postgresql"`
3. Run `npx prisma migrate deploy`

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```
