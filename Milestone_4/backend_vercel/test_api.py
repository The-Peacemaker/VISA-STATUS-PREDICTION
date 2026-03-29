#!/usr/bin/env python3
"""Test the live API endpoint to verify predictions vary correctly."""

import requests
import json

API_URL = "http://127.0.0.1:5000/api/predict"

test_cases = [
    {
        "name": "Europe - High School - Low Wage",
        "payload": {
            "continent": "Europe",
            "education_of_employee": "High School",
            "has_job_experience": "N",
            "requires_job_training": "Y",
            "no_of_employees": 50,
            "yr_of_estab": 2015,
            "region_of_employment": "West",
            "prevailing_wage": 2000,
            "unit_of_wage": "Month",
            "full_time_position": "N",
            "application_month": 3,
        },
    },
    {
        "name": "Asia - Doctorate - High Wage",
        "payload": {
            "continent": "Asia",
            "education_of_employee": "Doctorate",
            "has_job_experience": "Y",
            "requires_job_training": "N",
            "no_of_employees": 1000,
            "yr_of_estab": 1990,
            "region_of_employment": "East",
            "prevailing_wage": 20000,
            "unit_of_wage": "Month",
            "full_time_position": "Y",
            "application_month": 3,
        },
    },
    {
        "name": "North America - Bachelor's - Medium Wage",
        "payload": {
            "continent": "North America",
            "education_of_employee": "Bachelor's",
            "has_job_experience": "Y",
            "requires_job_training": "N",
            "no_of_employees": 200,
            "yr_of_estab": 2005,
            "region_of_employment": "Midwest",
            "prevailing_wage": 5000,
            "unit_of_wage": "Month",
            "full_time_position": "Y",
            "application_month": 3,
        },
    },
    {
        "name": "Africa - Master's - High Wage",
        "payload": {
            "continent": "Africa",
            "education_of_employee": "Master's",
            "has_job_experience": "Y",
            "requires_job_training": "N",
            "no_of_employees": 500,
            "yr_of_estab": 2000,
            "region_of_employment": "North",
            "prevailing_wage": 12000,
            "unit_of_wage": "Month",
            "full_time_position": "Y",
            "application_month": 3,
        },
    },
]

print("=" * 80)
print("API ENDPOINT TEST - Checking Prediction Variance")
print("=" * 80)

predictions = []
for test in test_cases:
    try:
        response = requests.post(API_URL, json=test["payload"], timeout=5)
        if response.status_code == 200:
            result = response.json()
            predicted_days = result.get("predictedDays")
            pred_range = result.get("range")
            confidence = result.get("confidence")
            predictions.append((test["name"], predicted_days, pred_range, confidence))
            
            print(f"\n{test['name']}")
            print(f"  Predicted Days: {predicted_days}")
            print(f"  Range: {pred_range}")
            print(f"  Confidence: {confidence}")
        else:
            print(f"\nERROR for {test['name']}: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"\nERROR for {test['name']}: {e}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("\nPredictions sorted by estimated days:")
for name, days, range_str, conf in sorted(predictions, key=lambda x: x[1]):
    print(f"  {name}: {days} days ({range_str})")

# Check variance
if len(predictions) > 0:
    predicted_values = [p[1] for p in predictions]
    min_pred = min(predicted_values)
    max_pred = max(predicted_values)
    avg_pred = sum(predicted_values) / len(predicted_values)
    variance = max_pred - min_pred
    
    print(f"\nPrediction Statistics:")
    print(f"  Min: {min_pred} days")
    print(f"  Max: {max_pred} days")
    print(f"  Average: {avg_pred:.1f} days")
    print(f"  Range/Variance: {variance} days")
    
    if variance > 5:
        print(f"\n✅ SUCCESS: Predictions show good variance ({variance} days difference)")
    else:
        print(f"\n⚠️  WARNING: Low variance ({variance} days) - predictions may still be too similar")
