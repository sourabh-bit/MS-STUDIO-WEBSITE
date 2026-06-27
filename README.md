# Luxe Artistry Haven

Monorepo split for independent frontend and backend deployments.

## Structure

- `frontend/` - Vite React app for Vercel
- `backend/` - Express TypeScript API for Render or Railway
- `package.json` - root orchestration scripts for local development

## Local Development

From the repo root:

```bash
npm run dev
```

Frontend only:

```bash
npm run dev:frontend
```

Backend only:

```bash
npm run dev:backend
```

## Builds

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Root:

```bash
npm run build
```

## Environment Files

- `frontend/.env` - frontend-only `VITE_` variables
- `backend/.env` - backend secrets and API configuration

## Vercel Frontend

- Root Directory: `frontend`
- Install Command: `npm install --include=dev`
- Build Command: `npm run build`
- Output Directory: `dist`

Required environment variable:

```bash
VITE_PAYMENT_API_BASE_URL=https://your-backend-domain/api
```

## Render Backend

- Root Directory: `backend`
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm run start`

Required environment variables:

```bash
PORT=10000
MONGODB_URI=...
ICICI_MERCHANT_ID=...
ICICI_AGGREGATOR_ID=...
ICICI_SECRET_KEY=...
ICICI_RETURN_URL=https://your-backend-domain/api/payments/callback
FRONTEND_BASE_URL=https://www.meerasakhrani.in
ICICI_INITIATE_SALE_URL=https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale
ICICI_STATUS_URL=https://pgpayuat.icicibank.com/tsp/pg/api/command
```

