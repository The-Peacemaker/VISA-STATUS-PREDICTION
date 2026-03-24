from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd


@dataclass
class PredictionInput:
    continent: str
    education_of_employee: str
    has_job_experience: str
    requires_job_training: str
    no_of_employees: int
    yr_of_estab: int
    region_of_employment: str
    prevailing_wage: float
    unit_of_wage: str
    full_time_position: str
    application_month: int


class VisaProcessingEstimator:
    def __init__(self, base_dir: Path | None = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parent
        self.model_path = self.base_dir.parent / "Milestone_3" / "m3_saved_models" / "best_model.joblib"
        self.scaler_path = self.base_dir.parent / "Milestone_3" / "m3_saved_models" / "scaler.joblib"
        self.reference_data_path = self.base_dir.parent / "Milestone_2" / "visa_data_m2_engineered.csv"

        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)
        self.feature_columns: List[str] = list(self.scaler.feature_names_in_)

        self.reference_df = pd.read_csv(self.reference_data_path)
        self._build_reference_maps()

    def _build_reference_maps(self) -> None:
        ref = self.reference_df

        self.continent_avg_map = ref.groupby("continent")["processing_time_days"].mean().to_dict()
        self.education_avg_map = ref.groupby("education_of_employee")["processing_time_days"].mean().to_dict()

        self.default_continent_avg = float(ref["processing_time_days"].mean())
        self.default_education_avg = float(ref["processing_time_days"].mean())

        self.median_no_of_employees = int(ref["no_of_employees"].median())
        self.median_yr_of_estab = int(ref["yr_of_estab"].median())
        self.median_prevailing_wage = float(ref["prevailing_wage"].median())

        self.wage_bins = np.quantile(ref["prevailing_wage"].values, [0.0, 0.25, 0.5, 0.75, 1.0])
        self.wage_bins = np.unique(self.wage_bins)
        if len(self.wage_bins) < 2:
            self.wage_bins = np.array([0.0, max(1.0, self.median_prevailing_wage)])

    def get_form_options(self) -> Dict[str, List[str]]:
        ref = self.reference_df
        return {
            "continent": sorted(ref["continent"].dropna().unique().tolist()),
            "education_of_employee": sorted(ref["education_of_employee"].dropna().unique().tolist()),
            "has_job_experience": sorted(ref["has_job_experience"].dropna().unique().tolist()),
            "requires_job_training": sorted(ref["requires_job_training"].dropna().unique().tolist()),
            "region_of_employment": sorted(ref["region_of_employment"].dropna().unique().tolist()),
            "unit_of_wage": sorted(ref["unit_of_wage"].dropna().unique().tolist()),
            "full_time_position": sorted(ref["full_time_position"].dropna().unique().tolist()),
        }

    def _wage_category_index(self, prevailing_wage: float) -> int:
        if len(self.wage_bins) <= 2:
            return 0

        # Match the quartile-style binning used in Milestone 2.
        val = pd.cut(
            [prevailing_wage],
            bins=self.wage_bins,
            labels=False,
            include_lowest=True,
            duplicates="drop",
        )[0]
        if pd.isna(val):
            return 0
        return int(val)

    def _engineer_features(self, payload: PredictionInput) -> pd.DataFrame:
        if payload.application_month < 1 or payload.application_month > 12:
            raise ValueError("application_month must be in the range 1..12")
        if payload.no_of_employees < 1:
            raise ValueError("no_of_employees must be >= 1")
        if payload.yr_of_estab < 1800:
            raise ValueError("yr_of_estab must be >= 1800")
        if payload.prevailing_wage < 0:
            raise ValueError("prevailing_wage must be >= 0")

        season_index = 1 if payload.application_month in (1, 2, 12) else 0
        continent_avg = self.continent_avg_map.get(payload.continent, self.default_continent_avg)
        education_avg = self.education_avg_map.get(payload.education_of_employee, self.default_education_avg)

        row = {
            "continent": payload.continent,
            "education_of_employee": payload.education_of_employee,
            "has_job_experience": payload.has_job_experience,
            "requires_job_training": payload.requires_job_training,
            "no_of_employees": payload.no_of_employees,
            "yr_of_estab": payload.yr_of_estab,
            "region_of_employment": payload.region_of_employment,
            "prevailing_wage": payload.prevailing_wage,
            "unit_of_wage": payload.unit_of_wage,
            "full_time_position": payload.full_time_position,
            "application_month": payload.application_month,
            "season_index": season_index,
            "continent_avg": continent_avg,
            "education_avg": education_avg,
            "wage_category_index": self._wage_category_index(payload.prevailing_wage),
        }

        model_df = pd.DataFrame([row])
        cat_cols = model_df.select_dtypes(include=["object", "category"]).columns.tolist()
        model_df = pd.get_dummies(model_df, columns=cat_cols, drop_first=True)
        model_df = model_df.reindex(columns=self.feature_columns, fill_value=0)
        return model_df

    def predict_days(self, payload: PredictionInput) -> float:
        model_df = self._engineer_features(payload)
        scaled_array = self.scaler.transform(model_df)
        scaled_df = pd.DataFrame(scaled_array, columns=self.feature_columns, index=model_df.index)
        prediction = float(self.model.predict(scaled_df)[0])
        return round(max(prediction, 1.0), 2)

    def predict_days_with_interval(self, payload: PredictionInput) -> Tuple[float, float, float]:
        model_df = self._engineer_features(payload)
        scaled_array = self.scaler.transform(model_df)
        scaled_df = pd.DataFrame(scaled_array, columns=self.feature_columns, index=model_df.index)

        mean_pred = float(self.model.predict(scaled_df)[0])

        # For tree ensembles (e.g., RandomForest), use tree-level spread as a practical uncertainty proxy.
        if hasattr(self.model, "estimators_") and getattr(self.model, "estimators_", None):
            tree_input = scaled_df.values
            tree_preds = np.array([float(tree.predict(tree_input)[0]) for tree in self.model.estimators_], dtype=float)
            p10 = float(np.percentile(tree_preds, 10))
            p90 = float(np.percentile(tree_preds, 90))
        else:
            p10 = mean_pred
            p90 = mean_pred

        mean_pred = round(max(mean_pred, 1.0), 2)
        p10 = round(max(p10, 1.0), 2)
        p90 = round(max(p90, 1.0), 2)
        return mean_pred, min(p10, p90), max(p10, p90)
