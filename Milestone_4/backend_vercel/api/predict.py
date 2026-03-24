from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, make_response, request

app = Flask(__name__)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODELS_DIR / "best_model.joblib"
SCALER_PATH = MODELS_DIR / "scaler.joblib"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
feature_columns = list(scaler.feature_names_in_)

# Practical defaults when reference aggregates are not bundled with the API.
CONTINENT_AVG = {
    "Africa": 44.0,
    "Asia": 38.0,
    "Europe": 33.0,
    "North America": 31.0,
    "Oceania": 34.0,
    "South America": 40.0,
}

EDUCATION_AVG = {
    "High School": 41.0,
    "Bachelor's": 36.0,
    "Master's": 33.0,
    "Doctorate": 31.0,
}

DEFAULT_AVG = 36.0


def _to_number(payload: dict, key: str, cast_type):
    value = payload.get(key)
    if value is None:
        raise ValueError(f"Missing required field: {key}")
    try:
        return cast_type(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid value for {key}") from exc


def _wage_category_index(prevailing_wage: float) -> int:
    if prevailing_wage < 1000:
        return 0
    if prevailing_wage < 4000:
        return 1
    if prevailing_wage < 8000:
        return 2
    return 3


def _engineer_features(payload: dict) -> pd.DataFrame:
    application_month = _to_number(payload, "application_month", int)
    no_of_employees = _to_number(payload, "no_of_employees", int)
    yr_of_estab = _to_number(payload, "yr_of_estab", int)
    prevailing_wage = _to_number(payload, "prevailing_wage", float)

    if application_month < 1 or application_month > 12:
        raise ValueError("application_month must be in the range 1..12")
    if no_of_employees < 1:
        raise ValueError("no_of_employees must be >= 1")
    if yr_of_estab < 1800:
        raise ValueError("yr_of_estab must be >= 1800")
    if prevailing_wage < 0:
        raise ValueError("prevailing_wage must be >= 0")

    continent = str(payload.get("continent", "Asia"))
    education = str(payload.get("education_of_employee", "Master's"))

    row = {
        "continent": continent,
        "education_of_employee": education,
        "has_job_experience": str(payload.get("has_job_experience", "Y")),
        "requires_job_training": str(payload.get("requires_job_training", "N")),
        "no_of_employees": no_of_employees,
        "yr_of_estab": yr_of_estab,
        "region_of_employment": str(payload.get("region_of_employment", "West")),
        "prevailing_wage": prevailing_wage,
        "unit_of_wage": str(payload.get("unit_of_wage", "Month")),
        "full_time_position": str(payload.get("full_time_position", "Y")),
        "application_month": application_month,
        "season_index": 1 if application_month in (1, 2, 12) else 0,
        "continent_avg": float(CONTINENT_AVG.get(continent, DEFAULT_AVG)),
        "education_avg": float(EDUCATION_AVG.get(education, DEFAULT_AVG)),
        "wage_category_index": _wage_category_index(prevailing_wage),
    }

    model_df = pd.DataFrame([row])
    cat_cols = model_df.select_dtypes(include=["object", "category"]).columns.tolist()
    model_df = pd.get_dummies(model_df, columns=cat_cols, drop_first=True)
    model_df = model_df.reindex(columns=feature_columns, fill_value=0)
    return model_df


def _predict(payload: dict) -> tuple[float, float, float]:
    model_df = _engineer_features(payload)
    scaled_array = scaler.transform(model_df)
    scaled_df = pd.DataFrame(scaled_array, columns=feature_columns, index=model_df.index)

    mean_pred = float(model.predict(scaled_df)[0])

    if hasattr(model, "estimators_") and getattr(model, "estimators_", None):
        tree_input = scaled_df.values
        tree_preds = np.array([float(tree.predict(tree_input)[0]) for tree in model.estimators_], dtype=float)
        p10 = float(np.percentile(tree_preds, 10))
        p90 = float(np.percentile(tree_preds, 90))
    else:
        p10 = mean_pred
        p90 = mean_pred

    mean_pred = round(max(mean_pred, 1.0), 2)
    p10 = round(max(min(p10, p90), 1.0), 2)
    p90 = round(max(max(p10, p90), 1.0), 2)
    return mean_pred, p10, p90


def _build_response(payload: dict, mean_pred: float, p10: float, p90: float) -> dict:
    spread = max(3, int(round((p90 - p10) / 2)))
    predicted_days = int(round(mean_pred))

    confidence = max(0.7, min(0.97, 1 - ((p90 - p10) / max(mean_pred, 1.0)) * 0.22))
    confidence = round(confidence, 2)

    month = int(payload["application_month"])
    month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    seasonal_lift = [2, 2, 1, 0, -1, 1, 2, 2, 1, 0, 1, 2]

    trend = []
    for index, label in enumerate(month_labels):
        distance = abs(index + 1 - month)
        local_factor = max(0, 3 - distance)
        days = max(1, int(round(predicted_days + seasonal_lift[index] + local_factor)))
        trend.append({"month": label, "days": days})

    comparison = [
        {"segment": "Africa", "days": max(1, predicted_days + 4)},
        {"segment": "Asia", "days": max(1, predicted_days + 2)},
        {"segment": "Europe", "days": max(1, predicted_days - 2)},
        {"segment": "North America", "days": max(1, predicted_days - 3)},
        {"segment": "Oceania", "days": max(1, predicted_days - 1)},
        {"segment": "South America", "days": max(1, predicted_days + 3)},
    ]

    return {
        "id": str(uuid4()),
        "payload": payload,
        "range": f"{max(1, predicted_days - spread)}-{predicted_days + spread} days",
        "confidence": confidence,
        "predictedDays": predicted_days,
        "trend": trend,
        "comparison": comparison,
        "createdAt": pd.Timestamp.utcnow().isoformat(),
    }


def _corsify(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict_route():
    if request.method == "OPTIONS":
        return _corsify(make_response("", 204))

    payload = request.get_json(silent=True) or {}
    try:
        mean_pred, p10, p90 = _predict(payload)
        return _corsify(jsonify(_build_response(payload, mean_pred, p10, p90)))
    except ValueError as exc:
        error_response = _corsify(jsonify({"error": str(exc)}))
        return error_response, 400
    except Exception:
        error_response = _corsify(jsonify({"error": "Prediction engine failed"}))
        return error_response, 500


@app.route("/", methods=["GET"])
def health_route():
    return jsonify({"status": "ok", "service": "visa-backend", "endpoint": "/api/predict"})
