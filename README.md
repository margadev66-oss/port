# Debajit Portfolio (Node.js)

Express + EJS portfolio site for Debajit Shil.

## Run locally

```bash
npm install
npm run dev
```

App starts on `http://localhost:3000` by default.

The app automatically loads environment variables from `.env` on Node.js versions that support `process.loadEnvFile()`.

## Environment variables

- `CONTACT_EMAIL` (optional): direct contact email shown on the homepage.
- `SITE_URL` (recommended in production): absolute site URL used for canonical links, OG tags, sitemap, and robots.
- `CONTACT_RECEIVER_EMAIL` (required for form delivery): inbox that receives form submissions.
- `CONTACT_FROM_EMAIL` (optional): sender address used by nodemailer.
- `CONTACT_PHONE` (optional): public phone/WhatsApp shown on the homepage.
- `SMTP_HOST` (required for form delivery): SMTP server host.
- `SMTP_PORT` (optional): SMTP port (defaults to `587`).
- `SMTP_SECURE` (optional): set to `true` for SSL (`465`), otherwise `false`.
- `SMTP_USER` (required for form delivery): SMTP username.
- `SMTP_PASS` (required for form delivery): SMTP password.

Example:

```bash
CONTACT_EMAIL=hello@yourdomain.com \
SITE_URL=https://yourdomain.com \
CONTACT_RECEIVER_EMAIL=hello@yourdomain.com \
CONTACT_FROM_EMAIL=hello@yourdomain.com \
CONTACT_PHONE=+918697378521 \
SMTP_HOST=smtp.yourprovider.com \
SMTP_PORT=587 \
SMTP_SECURE=false \
SMTP_USER=hello@yourdomain.com \
SMTP_PASS=your-password \
npm run dev
```

## Routes

- `/` -> Main portfolio homepage (server-rendered EJS)
- `/index.html` -> Redirects to `/`
- Old design concept URLs -> Redirect to `/`
- `/api/profile` -> Portfolio data as JSON
- `/contact` -> Contact form endpoint (`POST`, sends email via SMTP)
- `/health` -> Health check JSON
- `/robots.txt` -> Search crawler directives
- `/sitemap.xml` -> XML sitemap

## Key files

- `src/app.js` -> Express app and routes
- `src/server.js` -> Server bootstrap
- `src/data/siteData.js` -> Portfolio content model
- `views/index.ejs` -> Main homepage template
- `public/css/showcase.css` -> Shared visual system
