from __future__ import annotations

import math
from pathlib import Path

import pandas as pd

from predictor import PredictionInput, VisaProcessingEstimator


def run_sample_test_cases() -> None:
    base_dir = Path(__file__).resolve().parent
    cases_path = base_dir / "test_sample_cases.csv"

    estimator = VisaProcessingEstimator(base_dir=base_dir)
    cases = pd.read_csv(cases_path)

    print("Running sample case predictions...")
    print("-" * 72)

    for idx, row in cases.iterrows():
        payload = PredictionInput(
            continent=row["continent"],
            education_of_employee=row["education_of_employee"],
            has_job_experience=row["has_job_experience"],
            requires_job_training=row["requires_job_training"],
            no_of_employees=int(row["no_of_employees"]),
            yr_of_estab=int(row["yr_of_estab"]),
            region_of_employment=row["region_of_employment"],
            prevailing_wage=float(row["prevailing_wage"]),
            unit_of_wage=row["unit_of_wage"],
            full_time_position=row["full_time_position"],
            application_month=int(row["application_month"]),
        )
        pred, p10, p90 = estimator.predict_days_with_interval(payload)

        if not (math.isfinite(pred) and pred > 0):
            raise ValueError(f"Invalid prediction for row {idx + 1}: {pred}")
        if not (math.isfinite(p10) and math.isfinite(p90) and p10 > 0 and p90 > 0):
            raise ValueError(f"Invalid interval for row {idx + 1}: [{p10}, {p90}]")
        if p10 > p90:
            raise ValueError(f"Invalid interval ordering for row {idx + 1}: [{p10}, {p90}]")

        print(f"Case {idx + 1}: {pred:.2f} days (P10-P90: {p10:.2f} to {p90:.2f})")

    # Milestone checklist edge checks for month extraction boundaries.
    jan_case = PredictionInput(
        continent=cases.iloc[0]["continent"],
        education_of_employee=cases.iloc[0]["education_of_employee"],
        has_job_experience=cases.iloc[0]["has_job_experience"],
        requires_job_training=cases.iloc[0]["requires_job_training"],
        no_of_employees=int(cases.iloc[0]["no_of_employees"]),
        yr_of_estab=int(cases.iloc[0]["yr_of_estab"]),
        region_of_employment=cases.iloc[0]["region_of_employment"],
        prevailing_wage=float(cases.iloc[0]["prevailing_wage"]),
        unit_of_wage=cases.iloc[0]["unit_of_wage"],
        full_time_position=cases.iloc[0]["full_time_position"],
        application_month=1,
    )
    dec_case = PredictionInput(
        continent=cases.iloc[0]["continent"],
        education_of_employee=cases.iloc[0]["education_of_employee"],
        has_job_experience=cases.iloc[0]["has_job_experience"],
        requires_job_training=cases.iloc[0]["requires_job_training"],
        no_of_employees=int(cases.iloc[0]["no_of_employees"]),
        yr_of_estab=int(cases.iloc[0]["yr_of_estab"]),
        region_of_employment=cases.iloc[0]["region_of_employment"],
        prevailing_wage=float(cases.iloc[0]["prevailing_wage"]),
        unit_of_wage=cases.iloc[0]["unit_of_wage"],
        full_time_position=cases.iloc[0]["full_time_position"],
        application_month=12,
    )
    jan_pred = estimator.predict_days(jan_case)
    dec_pred = estimator.predict_days(dec_case)
    if not (math.isfinite(jan_pred) and jan_pred > 0 and math.isfinite(dec_pred) and dec_pred > 0):
        raise ValueError("Edge-month validation failed for January/December cases")

    print(f"Edge case January: {jan_pred:.2f} days")
    print(f"Edge case December: {dec_pred:.2f} days")

    print("-" * 72)
    print(f"All {len(cases)} sample cases passed.")


if __name__ == "__main__":
    run_sample_test_cases()
