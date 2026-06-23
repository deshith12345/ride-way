This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies and build the app before deploying:

```bash
npm install
npm run build
```

Deploy the project to Vercel and open the production URL from your Vercel dashboard.

## Google Sign In And Sign Up

RideWay supports Google authentication for traveller, driver, and admin sign-in areas. The public site uses traveller-only Google sign-in/sign-up, while `/admin/login` and `/driver/login` start isolated role-specific Google flows.

1. Create OAuth credentials in Google Cloud Console.
2. Add this authorized redirect URI:

```text
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

3. Copy `env.example` values into your local `.env.local` and set:

```text
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Traveller accounts can self-create with Google. Admin and driver Google access is role checked: existing matching users can sign in/link Google, and new admin/driver self-sign-up requires the email to be listed in `GOOGLE_ADMIN_SIGNUP_EMAILS` or `GOOGLE_DRIVER_SIGNUP_EMAILS`.

```text
GOOGLE_ADMIN_SIGNUP_EMAILS="owner@example.com,ops@example.com"
GOOGLE_DRIVER_SIGNUP_EMAILS="driver1@example.com,driver2@example.com"
```

After those values are set, the Google buttons on `/login`, `/register`, `/admin/login`, and `/driver/login` become active.

## Password Reset Email

Password recovery uses one-time links that expire after 30 minutes. The same flow lets Google-created accounts set a RideWay password. The app can send reset emails through Gmail SMTP using a Gmail App Password.

In Vercel, set:

```text
GMAIL_USER="supportrideway@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-gmail-app-password"
PASSWORD_RESET_FROM_EMAIL="RideWay <supportrideway@gmail.com>"
```

Use a Gmail App Password, not the normal Gmail account password. The Gmail account must have 2-Step Verification enabled before Google allows App Password creation.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
