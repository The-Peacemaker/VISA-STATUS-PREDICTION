#!/usr/bin/env python3
"""Test script to debug model prediction issues."""

import sys
from pathlib import Path
import joblib
import pandas as pd
import numpy as np

# Add API path
sys.path.insert(0, str(Path(__file__).parent / "api"))

from api.predict import _engineer_features, _predict, feature_columns, model, scaler

# Test cases with different continents and education levels
test_cases = [
    {
        "continent": "Europe",
        "education_of_employee": "High School",
        "has_job_experience": "Y",
        "requires_job_training": "N",
        "no_of_employees": 100,
        "yr_of_estab": 2000,
        "region_of_employment": "West",
        "prevailing_wage": 5000,
        "unit_of_wage": "Month",
        "full_time_position": "Y",
        "application_month": 3,
    },
    {
        "continent": "Asia",
        "education_of_employee": "Doctorate",
        "has_job_experience": "Y",
        "requires_job_training": "N",
        "no_of_employees": 500,
        "yr_of_estab": 1990,
        "region_of_employment": "East",
        "prevailing_wage": 15000,
        "unit_of_wage": "Month",
        "full_time_position": "Y",
        "application_month": 3,
    },
    {
        "continent": "North America",
        "education_of_employee": "Bachelor's",
        "has_job_experience": "N",
        "requires_job_training": "Y",
        "no_of_employees": 50,
        "yr_of_estab": 2015,
        "region_of_employment": "Midwest",
        "prevailing_wage": 3000,
        "unit_of_wage": "Month",
        "full_time_position": "N",
        "application_month": 3,
    },
]

print("=" * 80)
print("MODEL DIAGNOSIS TEST")
print("=" * 80)
print(f"\nFeature columns count: {len(feature_columns)}")
print(f"Model type: {type(model).__name__}")
print(f"Scaler type: {type(scaler).__name__}")

for i, payload in enumerate(test_cases):
    print(f"\n{'='*80}")
    print(f"Test Case {i+1}: {payload['continent']} - {payload['education_of_employee']}")
    print(f"{'='*80}")
    
    try:
        # Engineer features
        model_df = _engineer_features(payload)
        print(f"\nEngineered features shape: {model_df.shape}")
        print(f"Feature values (first 10): {model_df.values[0][:10]}")
        
        # Scale
        scaled_array = scaler.transform(model_df)
        scaled_df = pd.DataFrame(scaled_array, columns=feature_columns, index=model_df.index)
        print(f"\nScaled values (first 10): {scaled_array[0][:10]}")
        
        # Raw model prediction
        raw_pred = float(model.predict(scaled_df)[0])
        print(f"\nRaw model prediction: {raw_pred:.2f}")
        
        # Full prediction
        mean_pred, p10, p90, ood_score = _predict(payload)
        print(f"Mean prediction: {mean_pred}")
        print(f"P10: {p10}, P90: {p90}")
        print(f"OOD Score: {ood_score:.4f}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

print(f"\n{'='*80}")
print("END OF DIAGNOSIS")
print(f"{'='*80}")
