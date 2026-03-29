import pandas as pd
import numpy as np

df = pd.read_csv('visa_data_m2_engineered.csv')
print(f'Shape: {df.shape}')
print(f'\nTarget (processing_time_days) stats:')
print(df['processing_time_days'].describe())
print(f'\nValue counts (top 15):')
print(df['processing_time_days'].value_counts().head(15))
print(f'\nUnique values: {df["processing_time_days"].nunique()}')
print(f'\nMinimum: {df["processing_time_days"].min()}')
print(f'Maximum: {df["processing_time_days"].max()}')
print(f'Median: {df["processing_time_days"].median()}')
print(f'Mode: {df["processing_time_days"].mode()[0] if len(df["processing_time_days"].mode()) > 0 else "N/A"}')
