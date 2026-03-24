# Milestone 4: Web App Development and Deployment

This milestone turns the Milestone 3 model into a production-style estimator tool with a custom neo-brutalist UI.

## What is included

- Streamlit app with branded NIGHT + IMPERIAL theme.
- Backend inference engine that loads Milestone 3 artifacts.
- Feature engineering parity with Milestone 2 logic.
- Multi-case sample test harness.
- Prediction uncertainty band (P10-P90) for better result interpretation.
- Session prediction history with CSV export.
- Cloud deployment assets for Heroku-style and container deployment.

## Folder structure

- `app.py`: Streamlit frontend.
- `predictor.py`: backend model loading and feature engineering.
- `style.css`: custom neo-brutalist theme.
- `test_sample_cases.csv`: sample requests for final testing.
- `test_predictions.py`: executes final testing on sample cases.
- `requirements.txt`: Python dependencies.
- `Procfile`: cloud process declaration.
- `runtime.txt`: Python runtime pin.

## Local run

1. Open terminal in `PROJECT/Milestone_4`.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Launch app:
   - `streamlit run app.py`
4. Open the local URL displayed by Streamlit.

## Input-model consistency note

This implementation intentionally uses the finalized Milestone 2/3 engineered features as app inputs.
That keeps the frontend, feature engineering logic, and trained model artifacts fully consistent end-to-end.

## Final testing with multiple sample cases

Run:

```bash
python test_predictions.py
```

Expected behavior:
- Prints predicted processing days for each sample case.
- Fails if any prediction is non-finite or non-positive.
- Verifies uncertainty interval sanity (positive and ordered).
- Verifies edge-month scenarios (January and December) return valid outputs.

## Milestone 4 checklist alignment

- Frontend implemented with structured user input and button-triggered prediction flow.
- Backend connected to Milestone 3 model artifacts with deterministic feature engineering.
- Deployment-ready files included: `requirements.txt`, `Procfile`, `runtime.txt`.
- End-to-end testing included via `test_predictions.py` and `test_sample_cases.csv`.
- Edge-case and plausibility validation added for final submission readiness.

## Deployment options

### Option A: Heroku / Render style deployment

1. Push repository to GitHub.
2. Create app in cloud platform.
3. Set build command:
   - `pip install -r requirements.txt`
4. Set start command:
   - `streamlit run app.py --server.port=$PORT --server.address=0.0.0.0`
5. Deploy.

### Option B: Azure App Service (Container)

1. Add a `Dockerfile` (sample below) and push to repository.
2. Create Azure Web App for Containers.
3. Point to container registry image.
4. Set startup port to `8501`.

Sample Dockerfile:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

### Option C: AWS App Runner / ECS

1. Build and push the same Docker image.
2. Create service from image.
3. Expose port `8501`.
4. Set health check path to `/`.

## Notes

- The theme color token `#00F08` in the design request is not a valid 6-digit hex. It was normalized to `#00F0F8` for implementation consistency.
- Milestone 4 uses Milestone 3 artifacts from `../Milestone_3/m3_saved_models/` and does not modify previous milestone folders.
