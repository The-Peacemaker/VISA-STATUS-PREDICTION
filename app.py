"""Canonical Flask entrypoint for Vercel framework detection."""

from Milestone_4.backend_vercel.api.predict import app as milestone_app

# Keep a top-level app symbol so Vercel's Flask scanner can resolve it reliably.
app = milestone_app
