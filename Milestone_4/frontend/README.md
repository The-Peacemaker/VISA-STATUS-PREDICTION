# Visa Oracle AI Frontend

Premium React dashboard UI for **AI-Powered Visa Status Prediction & Processing Time Estimator**.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- Recharts
- React Router

## Theme

Ancient Neo-Brutalism:
- Neo-brutalist thick borders and asymmetrical structure
- Ancient-inspired serif typography and muted gold accents
- Futuristic glass panels, glow effects, and motion-driven interactions

## Included Pages

- `/` Landing experience with animated hero, stats counters, feature sections, and testimonials
- `/dashboard` Prediction dashboard with smart input form, loading skeleton, confidence gauge, and analytics charts
- `/history` Searchable filterable history table with expandable row details

## Features

- Dark mode default
- Grain/noise visual overlay
- Sticky navigation
- Animated cursor with magnetic pull on interactive elements
- Hover and press interactions across cards and buttons
- Mock API prediction delay and loading states
- Toast notifications
- LocalStorage-backed prediction history

## Run

```bash
npm install
npm run dev
```
## Live Backend (Optional)

To use a deployed Vercel backend instead of local mock mode, create a `.env` file in `frontend/`:

```bash
VITE_API_BASE_URL=https://your-vercel-backend.vercel.app
```

When this value is set, the dashboard calls `/api/predict` on that backend.

## Build

```bash
npm run build
npm run preview
```

## Folder Structure

```text
frontend/
  src/
    components/
      AnimatedButton.jsx
      CustomCursor.jsx
      Navbar.jsx
      SectionReveal.jsx
      SkeletonCard.jsx
      ToastProvider.jsx
    data/
      historySeed.js
    lib/
      mockApi.js
      storage.js
    pages/
      DashboardPage.jsx
      HistoryPage.jsx
      HomePage.jsx
    App.jsx
    index.css
    main.jsx
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
```
