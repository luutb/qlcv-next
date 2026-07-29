# QLCV Frontend — Local Development

The frontend runs with Next.js on port 3000. Its matching backend is the sibling
repository `../qlcv-work-board` and runs on port 8080.

## Start backend

Open Docker Desktop, then run:

```bash
cd ../qlcv-work-board
docker compose up -d
curl http://localhost:8080/health
```

Expected health response:

```json
{"status":"ok"}
```

## Start frontend

In another terminal:

```bash
cd ../qlcv-nextjs/qlcv
npm install
npm run dev
```

Open `http://localhost:3000/login`.

The checked-in local environment points to:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

## Demo accounts

The backend demo seed currently provides:

| Role | Username | Password |
| --- | --- | --- |
| PARTNER | `admin` | `password` |
| LAWYER | `lawyer1` | `password` |
| ACCOUNTANT | `accountant` | `password` |

There is no SUPER_ADMIN in the current seed. MFA is disabled for these local
accounts and the frontend MFA flow is intentionally deferred.

These credentials are for local demo data only. Do not reuse them in staging or
production.

## Quality checks

Automated-test tooling is intentionally not installed. Before pushing code, run:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```
