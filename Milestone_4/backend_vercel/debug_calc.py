#!/usr/bin/env python3
"""Direct calculation test to verify feature adjustment logic."""

import sys
from pathlib import Path

# Add API path
sys.path.insert(0, str(Path(__file__).parent / "api"))

# Sample calculation
print("Direct calculation test:\n")

# Test case 1: Asia - Doctorate - High Wage
continent_avg_1 = 38.0  # Asia
education_avg_1 = 31.0  # Doctorate
wage_1 = 20000
no_employees_1 = 1000
has_experience_1 = True
requires_training_1 = False
full_time_1 = True
mean_pred_1 = 38.77

base_adjustment_1 = (continent_avg_1 * 0.7) + (education_avg_1 * 0.3)
wage_factor_1 = 0.88 if wage_1 > 15000 else 0.92
company_factor_1 = 0.93 if no_employees_1 > 1000 else 0.95
experience_factor_1 = 0.95 if has_experience_1 else 1.05
training_factor_1 = 1.07 if requires_training_1 else 1.0
ft_factor_1 = 0.97 if full_time_1 else 1.03

adjustment_multiplier_1 = wage_factor_1 * company_factor_1 * experience_factor_1 * training_factor_1 * ft_factor_1
feature_based_pred_1 = base_adjustment_1 * adjustment_multiplier_1
adjusted_mean_1 = (0.25 * mean_pred_1) + (0.75 * feature_based_pred_1)

print(f"Test 1: Asia - Doctorate - High Wage")
print(f"  base_adjustment: {base_adjustment_1:.2f}")
print(f"  adjustment_multiplier: {adjustment_multiplier_1:.4f}")
print(f"  feature_based_pred: {feature_based_pred_1:.2f}")
print(f"  adjusted_mean: {adjusted_mean_1:.2f}")
print(f"  Expected: ~30 days\n")

# Test case 2: Europe - High School - Low Wage  
continent_avg_2 = 33.0  # Europe
education_avg_2 = 41.0  # High School
wage_2 = 2000
no_employees_2 = 50
has_experience_2 = False
requires_training_2 = True
full_time_2 = False
mean_pred_2 = 39.05

base_adjustment_2 = (continent_avg_2 * 0.7) + (education_avg_2 * 0.3)
wage_factor_2 = 1.04 if wage_2 < 5000 else 0.96
company_factor_2 = 1.03 if no_employees_2 < 50 else 0.98
experience_factor_2 = 0.95 if has_experience_2 else 1.05
training_factor_2 = 1.07 if requires_training_2 else 1.0
ft_factor_2 = 0.97 if full_time_2 else 1.03

adjustment_multiplier_2 = wage_factor_2 * company_factor_2 * experience_factor_2 * training_factor_2 * ft_factor_2
feature_based_pred_2 = base_adjustment_2 * adjustment_multiplier_2
adjusted_mean_2 = (0.25 * mean_pred_2) + (0.75 * feature_based_pred_2)

print(f"Test 2: Europe - High School - Low Wage")
print(f"  base_adjustment: {base_adjustment_2:.2f}")
print(f"  adjustment_multiplier: {adjustment_multiplier_2:.4f}")
print(f"  feature_based_pred: {feature_based_pred_2:.2f}")
print(f"  adjusted_mean: {adjusted_mean_2:.2f}")
print(f"  Expected: ~45 days\n")

print(f"Difference: {adjusted_mean_2 - adjusted_mean_1:.2f} days")
