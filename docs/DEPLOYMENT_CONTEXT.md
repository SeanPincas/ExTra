# Deployment Context — ExTra

## Purpose

This document defines the deployment context for ExTra.

It exists so future deployment preparation and deployment tasks stay aligned with the intended production architecture without breaking the current local development workflow.

This document does **not** mean the app is deployed yet.

## Deployment Architecture

ExTra should use the following production architecture:

### Frontend

- Vite React application
- deployed to **Vercel**

### Backend

- Node.js + Express API
- deployed to **Render**

### Database

- MongoDB
- hosted on **MongoDB Atlas**

### Request Flow

```text
user -> Vercel frontend -> Render backend API -> MongoDB Atlas
```

## Docker Role

Docker Compose is for **local development**.

Production deployment should use managed services:

- Vercel for frontend
- Render for backend
- MongoDB Atlas for database

Important rules:

- Do not remove Docker support.
- Do not rewrite local Docker setup just to match production hosting.
- Deployment preparation must preserve the current local development flow.
- Local development and production deployment are separate concerns.

## Deployment Order

Use this order for future deployment work:

1. Production prep
2. MongoDB Atlas setup
3. Render backend deploy
4. Vercel frontend deploy
5. CORS and environment variable update
6. Production feature testing

## Required Backend Environment Variables

The backend production environment should support these variables:

### `PORT`

- Render-provided service port or application fallback port
- the backend server must listen on `process.env.PORT`

### `MONGO_URI`

- MongoDB Atlas connection string
- should include credentials, cluster host, and database name

### `JWT_SECRET`

- private secret used for JWT signing and verification
- must be long, random, and never committed

### `CLIENT_URL`

- the production frontend origin
- should match the deployed Vercel URL exactly
- used for CORS configuration

### `NODE_ENV`

- runtime mode such as `production` or `development`
- used for production-safe backend behavior

## Required Frontend Environment Variables

The frontend production environment should support:

### `VITE_API_BASE_URL`

- production API base URL for the Render backend API
- local development should point this to the local backend
- because the frontend axios client already expects the `/api` base,
  this value should include `/api`
- this must use the `VITE_` prefix because the frontend is built with Vite

## Expected Env Example

### Backend production example

```text
PORT=3501
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/extra?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
CLIENT_URL=https://<vercel-app>.vercel.app
NODE_ENV=production
```

### Frontend production example

```text
VITE_API_BASE_URL=https://<render-backend>.onrender.com/api
```

### Local frontend example

```text
VITE_API_BASE_URL=http://localhost:3501/api
```

## Production Prep Checklist

### Frontend

- API client uses `VITE_API_BASE_URL`
- no production API calls are hardcoded to `localhost`
- build script works
- Vercel root directory is `frontend`
- Vercel output directory is `dist`

### Backend

- start script works
- server listens on `process.env.PORT`
- Mongo connection uses `MONGO_URI`
- JWT uses `JWT_SECRET`
- CORS uses `CLIENT_URL`
- health route exists or should be added
- Render root directory is `backend`

### Atlas

- cluster created
- database user created
- connection string copied
- network access configured
- database name included in URI

## Deployment Platform Settings

### Vercel

- framework: `Vite`
- root directory: `frontend`
- build command: `npm run build`
- output directory: `dist`
- environment variable: `VITE_API_BASE_URL`

### Render

- service type: `Web Service`
- root directory: `backend`
- build command: `npm install`
- start command: `npm start`
- environment variables:
  - `PORT`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_URL`
  - `NODE_ENV`

### MongoDB Atlas

- cluster
- database user
- IP or network access configuration
- connection string

## CORS Rule

The backend `CLIENT_URL` must match the Vercel frontend origin exactly.

Important rules:

- no trailing slash
- do not weaken CORS unnecessarily
- local development should still allow `http://localhost:5173` if the project supports multi-origin configuration
- production origin and local origin should be handled intentionally, not by broad wildcarding

## Common Deployment Bugs

Common deployment issues to watch for:

- frontend still calls `localhost`
- CORS error because `CLIENT_URL` does not match the deployed frontend
- Atlas connection failure
- missing environment variable
- wrong Render root directory
- wrong Vercel root directory
- Render service sleeping on free tier
- Vite environment variable missing the `VITE_` prefix

## Production Test Checklist

### Auth

- register
- login
- JWT persistence
- protected dashboard access
- logout

### Finance

- add income
- add expense
- edit entry
- delete entry
- batch delete if applicable

### Right Panel

- heatmap loads
- daily insight modal works
- bar chart updates
- line chart updates
- multi-ring chart updates
- SPT New Goal works
- SPT Add Savings Progress works

### Settings

- profile update
- avatar flow if applicable
- delete account only with a disposable test user

## Safety Rules for Future Deployment Phases

- never commit real secrets
- never hardcode production URLs when an environment variable should be used
- preserve Docker local development support
- keep frontend, backend, and database deployment responsibilities separate
- do not change feature logic during deployment prep unless required
- do not modify database models for deployment only
- keep deployment changes minimal and reversible

## Notes

- Production hosting target:
  - frontend -> Vercel
  - backend -> Render
  - database -> MongoDB Atlas
- Local development target:
  - Docker Compose remains supported
- Current Atlas deployment notes:
  - Existing DB user: `SeanRise_ExTra`
  - Render `MONGO_URI` should use the Atlas connection string with the real password stored only in Render environment variables
  - Current Atlas IP Access List includes `0.0.0.0/0` for initial Render connectivity
  - Review and tighten broad Atlas network access later when a stricter networking strategy is available
- This file should be treated as the source-of-truth deployment context for future deployment preparation tasks.
