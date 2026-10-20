# Crisp URL Shortener

A React + Vite URL shortener application with authentication, dashboard management, QR generation, and Supabase-backed storage.

## Features

- User signup and login
- Protected dashboard and route access
- Create short links with optional custom aliases
- Store short URLs in Supabase
- Generate QR codes for URLs
- Copy links to clipboard
- Delete existing links
- View total links and total clicks
- Search and filter saved links
- Redirect old links to their original destinations

## Tech Stack

- React 19
- Vite
- React Router DOM
- Supabase
- Tailwind CSS
- Radix/Base UI primitives
- Yup for validation
- Lucide icons
- react-qrcode-logo for QR generation

## Project Structure

```bash
src/
  components/
    create-link.jsx
    login.jsx
    signup.jsx
    linkcard.jsx
    error.jsx
    ui/
  db/
    apiAuth.js
    apiClicks.js
    apiUrls.js
    supabase.js
  hook/
    use-fetch.jsx
  pages/
    auth.jsx
    dashboard.jsx
    landing.jsx
    link.jsx
    redirect-link.jsx
  context.jsx
  App.jsx
  main.jsx
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- npm or yarn
- A Supabase project

## Environment Setup

Create a `.env` file in the project root with your Supabase values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

Example:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Production Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Supabase Notes

This app expects these database pieces in Supabase:

- `auth` tables managed by Supabase Auth
- `urls` table containing at least these fields:
  - `id`
  - `user_id`
  - `title`
  - `original_url`
  - `custom_url`
  - `short_url`
  - `qr`
  - `created_at`

You may need to align your actual column names with the code in `src/db/apiUrls.js` and related files.

## Useful Scripts

```bash
npm run dev      # start local development server
npm run build    # create production build
npm run preview  # preview production build locally
npm run lint     # run ESLint checks
```

## Notes

This project is still under active development and some parts may require schema or naming adjustments depending on your Supabase table definitions. The app currently follows a custom short-link flow with simple dashboard management and auth integration.

## License

This project is for educational and personal use unless otherwise specified.
