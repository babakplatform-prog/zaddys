# ZADDYS Environment Variables

The frontend uses the Next.js App Router. Keep public browser keys in Vercel and keep backend secrets only in the Django deployment.

## Frontend: `zaddys-frontend/.env.local` and Vercel

Copy `zaddys-frontend/.env.example` to `zaddys-frontend/.env.local` for local development. Replace every placeholder before deploying. Vercel reads these same keys from Project Settings > Environment Variables.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_replace_me
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza_replace_me
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=replace_me
GOOGLE_CLIENT_SECRET=replace_me
APPLE_ID=replace_me
APPLE_SECRET=replace_me
NEXT_PUBLIC_GOOGLE_CLIENT_ID=replace_me
APPLE_CLIENT_ID=replace_me
```

OAuth callback URLs for this NextAuth app:

- Local Google and Apple callback: `http://localhost:3000/api/auth/callback/google` or `http://localhost:3000/api/auth/callback/apple`
- Production Google and Apple callback: `https://www.zaddys.ng/api/auth/callback/google` or `https://www.zaddys.ng/api/auth/callback/apple`

Register both local and production URLs in each provider console. The client IDs and secrets are read server-side by the NextAuth route; the `NEXT_PUBLIC_*` Google client ID alias is supported for compatibility, but the server-only `GOOGLE_CLIENT_ID` is preferred.

For production, set `NEXT_PUBLIC_API_URL` to the deployed Django API URL and `NEXTAUTH_URL` to the deployed frontend URL. `NEXT_PUBLIC_*` values are exposed to the browser. OAuth client secrets are server-side NextAuth secrets and must not be exposed through `NEXT_PUBLIC_*` names.

## Backend: `zaddys-backend/.env` and Django deployment

Use `zaddys-backend/.env.example` as the complete template. Render reads these keys from the service Environment tab; do not upload `.env` files or commit real values.

Render automatically populates an empty production database during its build command. No Shell access is required:

```bash
python manage.py seed_menu
python manage.py seed_delivery_zones
```

The menu seed is intentionally non-destructive: it will not overwrite an existing catalog or orders.

```env
SECRET_KEY=replace_with_a_long_random_django_secret
DEBUG=False
ALLOWED_HOSTS=api.zaddys.ng
CORS_ALLOWED_ORIGINS=https://www.zaddys.ng,https://your-project.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
PAYSTACK_TEST_SECRET_KEY=sk_test_replace_me
PAYSTACK_WEBHOOK_SECRET=whsec_replace_me
PAYSTACK_SECRET_KEY=sk_test_replace_me
RESEND_API_KEY=re_replace_me
EMAIL_SERVICE_API_KEY=re_replace_me
DEFAULT_FROM_EMAIL=orders@zaddys.ng
```

Never place `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, Django `SECRET_KEY`, database credentials, or OAuth client secrets in frontend public variables.

## Google Cloud setup

Enable Maps JavaScript API and Places API. Restrict the browser key by HTTP referrer:

- `http://localhost:3000/*`
- `https://www.zaddys.ng/*`
- `https://*.vercel.app/*`

Restrict the key API list to the APIs required by the checkout address autocomplete.

For address suggestions, enable **Maps JavaScript API** and **Places API**, attach billing to the Google Cloud project, and restrict the browser key by HTTP referrer. The checkout field uses the key in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, limits suggestions to Nigeria (`country: ng`), and stores the selected place's formatted address in the order delivery address.

## Paystack setup

- Frontend uses `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to open checkout.
- Backend uses `PAYSTACK_SECRET_KEY` to verify the transaction.
- Configure the Paystack webhook URL as `https://zaddys.onrender.com/api/webhooks/paystack/`.
- Paystack webhook requests are accepted only with a valid `x-paystack-signature`.

## Resend setup

- `RESEND_API_KEY` stays on Django only.
- `DEFAULT_FROM_EMAIL` must be a verified sender/domain in Resend, for example `orders@zaddys.ng`.
- In Resend, open **Domains**, add `zaddys.ng`, and publish the TXT/DKIM records Resend gives you at your DNS provider.
- Wait until Resend marks the domain **Verified**, then keep `DEFAULT_FROM_EMAIL=orders@zaddys.ng` in Render.
- Resend email is wired for registration OTPs, welcome messages, order confirmations, and order-status updates.
- Add a Resend webhook pointing to `https://api.zaddys.ng/api/webhooks/resend/` and select `email.sent`, `email.delivered`, `email.bounced`, and `email.failed`.
- Copy the signing secret Resend provides into Render as `RESEND_WEBHOOK_SECRET`. This is separate from `RESEND_API_KEY`.
- After deployment, delivery events are available in Django Admin under **Resend webhook events**.

## Database and menu

The Django app uses `DATABASE_URL` when supplied and otherwise falls back to local SQLite. Seed or update delivery zones without touching products:

```powershell
python manage.py seed_delivery_zones
```

## Vercel setup

Create a new project from this repository with:

- **Root Directory:** `zaddys-frontend`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install` (default)
- **Output Directory:** leave the default blank

Add all variables from `zaddys-frontend/.env.example` to the Vercel Production environment, then redeploy. At minimum, replace `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.

## Render setup

Create a Web Service from the same repository with:

- **Name:** `zaddys-api`
- **Runtime:** Python 3
- **Root Directory:** `zaddys-backend`
- **Build Command:** `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_menu && python manage.py seed_delivery_zones`
- **Start Command:** `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
- **Health Check Path:** `/`

Add the backend variables from `zaddys-backend/.env.example`. Create a Render PostgreSQL database first and paste its **Internal Database URL** into `DATABASE_URL`. Set `ALLOWED_HOSTS` to the Render API hostname and `CORS_ALLOWED_ORIGINS` to the exact Vercel URL, comma-separated with any custom frontend domain.

## Connect the deployments

1. Deploy Render and copy its service URL, for example `https://zaddys-api.onrender.com`.
2. Set Vercel `NEXT_PUBLIC_API_URL` to `https://zaddys-api.onrender.com/api`.
3. Set Render `CORS_ALLOWED_ORIGINS` to the exact Vercel URL, for example `https://zaddys.vercel.app`.
4. Redeploy both services after saving variables.
5. Open `https://zaddys-api.onrender.com/api/products/` and confirm it returns menu data.
6. Test signup, login, checkout, and support from the Vercel URL.

For the custom frontend domain, set `NEXTAUTH_URL` to the exact HTTPS domain, update every OAuth callback URL to that domain, and add the same domain to Render `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.

Use matching Paystack modes: `pk_test_` with `sk_test_`, or `pk_live_` with `sk_live_`. Never put `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, database credentials, or OAuth client secrets in Vercel `NEXT_PUBLIC_*` variables.
