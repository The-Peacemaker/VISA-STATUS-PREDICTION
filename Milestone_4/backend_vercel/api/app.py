"""Compatibility module for Vercel route targets.

This file re-exports the Flask app from predict.py so both /api/app and
/api/predict always execute identical inference logic.
"""

try:
    from .predict import app
except ImportError:
    from predict import app
