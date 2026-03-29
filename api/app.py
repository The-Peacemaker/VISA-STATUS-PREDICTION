"""Vercel API entrypoint for the Milestone 4 Flask backend."""

from Milestone_4.backend_vercel.api.predict import app as milestone_app

# Explicitly expose the Flask application object for runtime detection.
app = milestone_app

