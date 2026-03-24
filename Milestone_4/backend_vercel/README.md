# Vercel Backend (Python API)

Serverless backend for the Visa estimator frontend.

## What this folder contains

- `api/predict.py`: Flask serverless function exposed at `/api/predict`
- `models/best_model.joblib`: trained model artifact
- `models/scaler.joblib`: fitted scaler artifact
- `requirements.txt`: Python runtime dependencies for Vercel
- `vercel.json`: route mapping and function config

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Set **Root Directory** to `Milestone_4/backend_vercel`.
4. Keep build settings default (Vercel Python runtime auto-detected).
5. Deploy.
6. Verify endpoint:
   - `GET https://<your-project>.vercel.app/`
   - `POST https://<your-project>.vercel.app/api/predict`

## Test payload

```json
{
  "continent": "Asia",
  "education_of_employee": "Master's",
  "has_job_experience": "Y",
  "requires_job_training": "N",
  "no_of_employees": 500,
  "yr_of_estab": 2010,
  "region_of_employment": "West",
  "prevailing_wage": 4200,
  "unit_of_wage": "Month",
  "full_time_position": "Y",
  "application_month": 5
}
```

## Connect Netlify frontend

1. In Netlify, set environment variable:
   - `VITE_API_BASE_URL=https://<your-project>.vercel.app`
2. Redeploy frontend.
3. Dashboard switches to live API mode automatically.

## Notes

- The frontend has a mock fallback if API is unavailable.
- CORS is currently open (`*`) for simplicity. You can restrict it to your Netlify domain in production.
