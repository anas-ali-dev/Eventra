# Eventra

A full-stack event management and ticket booking platform built with Angular, Node.js, Express.js, and MongoDB.

## Quick start (Windows)

**First time only:**

1. Copy `Backend/.env.example` to `Backend/.env` and set your MongoDB Atlas `MONGO_URI`.
2. From the project root, run:

```powershell
npm run install:all
npm run seed
```

**Every time you work on the project:**

```powershell
npm run dev
```

Or double-click / run:

```powershell
.\start.ps1
```

Then open **http://localhost:4200** in your browser.

## Manual start (two terminals)

**Terminal 1 — Backend**

```powershell
cd Backend
npm run dev
```

Wait for: `MongoDB Connected Successfully` and `Server is running on port 5000`

**Terminal 2 — Frontend**

```powershell
cd Frontend
npm start
```

Open **http://localhost:4200**

## Promo codes

| Code        | Discount |
|-------------|----------|
| `EVENTRA10` | 10% off  |
| `WELCOME15` | 15% off  |

## Important

- Never commit `Backend/.env` (contains secrets).
- Both servers must run at the same time for login, bookings, and profile to work.
