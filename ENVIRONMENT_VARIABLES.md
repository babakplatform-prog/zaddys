# ZADDYS Environment Variables

The frontend uses the Next.js App Router. Keep public browser keys in Vercel and keep backend secrets only in the Django deployment.

## Frontend: `zaddys-frontend/.env.local` and Vercel

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
FACEBOOK_CLIENT_ID=replace_me
FACEBOOK_CLIENT_SECRET=replace_me
TWITTER_CLIENT_ID=replace_me
TWITTER_CLIENT_SECRET=replace_me
```

For production, set `NEXT_PUBLIC_API_URL` to the deployed Django API URL and `NEXTAUTH_URL` to the deployed frontend URL. `NEXT_PUBLIC_*` values are exposed to the browser. OAuth client secrets are server-side NextAuth secrets and must not be exposed through `NEXT_PUBLIC_*` names.

## Backend: `zaddys-backend/.env` and Django deployment

```env
SECRET_KEY=replace_with_a_long_random_django_secret
DEBUG=False
ALLOWED_HOSTS=api.zaddys.ng
CORS_ALLOWED_ORIGINS=https://www.zaddys.ng,https://your-project.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
PAYSTACK_SECRET_KEY=sk_live_replace_me
RESEND_API_KEY=re_replace_me
DEFAULT_FROM_EMAIL=orders@zaddys.ng
```

Never place `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, Django `SECRET_KEY`, database credentials, or OAuth client secrets in frontend public variables.

## Google Cloud setup

Enable Maps JavaScript API and Places API. Restrict the browser key by HTTP referrer:

- `http://localhost:3000/*`
- `https://www.zaddys.ng/*`
- `https://*.vercel.app/*`

Restrict the key API list to the APIs required by the checkout address autocomplete.

## Paystack setup

- Frontend uses `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to open checkout.
- Backend uses `PAYSTACK_SECRET_KEY` to verify the transaction.
- Configure the Paystack callback/webhook URL to the deployed Django API when webhook handling is enabled.

## Resend setup

- `RESEND_API_KEY` stays on Django only.
- `DEFAULT_FROM_EMAIL` must be a verified sender/domain in Resend, for example `orders@zaddys.ng`.

## Database and menu

The Django app uses `DATABASE_URL` when supplied and otherwise falls back to local SQLite. Seed or update delivery zones without touching products:

```powershell
python manage.py seed_delivery_zones
```
