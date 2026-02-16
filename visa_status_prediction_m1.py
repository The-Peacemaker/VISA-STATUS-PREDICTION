import pandas as pd
import numpy as np
import warnings
import os

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

def load_data(filepath):
    """
    Loads the dataset from a CSV file.
    
    Args:
        filepath (str): Path to the CSV file.
        
    Returns:
        pd.DataFrame: Loaded dataset.
    """
    print("=" * 60)
    print("LOADING DATASET")
    print("=" * 60)
    
    try:
        df = pd.read_csv(filepath)
        print(f"✓ Dataset loaded successfully from {filepath}")
        print(f"  Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
        return df
    except FileNotFoundError:
        print(f"✗ Error: File not found at {filepath}")
        return None

def initial_exploration(df):
    """
    Performs initial data exploration.
    
    Args:
        df (pd.DataFrame): The dataset.
    """
    print("\n" + "=" * 60)
    print("INITIAL EXPLORATION")
    print("=" * 60)
    
    print("\nFirst 5 rows:")
    print(df.head())
    
    print("\nDataset Info:")
    df.info()
    
    print("\nStatistical Summary (Numerical):")
    print(df.describe())
    
    print("\nStatistical Summary (Categorical):")
    print(df.describe(include='object'))

def check_data_quality(df):
    """
    Checks for missing values and duplicates.
    
    Args:
        df (pd.DataFrame): The dataset.
    """
    print("\n" + "=" * 60)
    print("DATA QUALITY CHECK")
    print("=" * 60)
    
    # Missing values
    missing = df.isnull().sum()
    if missing.sum() == 0:
        print("✓ No missing values found.")
    else:
        print(f"⚠ Missing values found:\n{missing[missing > 0]}")
    
    # Duplicates
    dupes = df.duplicated().sum()
    if dupes == 0:
        print("✓ No duplicate rows found.")
    else:
        print(f"⚠ {dupes} duplicate rows found.")

def preprocess_data(df):
    """
    Preprocesses the data (handling outliers, type conversion).
    
    Args:
        df (pd.DataFrame): The raw dataset.
        
    Returns:
        pd.DataFrame: Preprocessed dataset.
    """
    print("\n" + "=" * 60)
    print("DATA PREPROCESSING")
    print("=" * 60)
    
    df_clean = df.copy()
    
    # Optimize object types to categories
    for col in df_clean.select_dtypes(include=['object']).columns:
        df_clean[col] = df_clean[col].astype('category')
        
    print("✓ Data types optimized (objects -> categories)")
    return df_clean

def prepare_target(df):
    """
    Generates the target, handling the specific requirements.
    Note: Dataset strictly supports binary Classification (Certified/Denied).
    Processing time (Regression) requires date columns not present in EasyVisa.csv.
    
    Args:
        df (pd.DataFrame): The dataset.
        
    Returns:
        pd.DataFrame: Dataset with target column.
    """
    print("\n" + "=" * 60)
    print("TARGET GENERATION")
    print("=" * 60)
    
    # Target: Case Status
    # We create a binary target for classification as dates for regression (processing time) are unavailable.
    df['target'] = df['case_status'].apply(lambda x: 1 if x == 'Certified' else 0)
    print("✓ Created binary 'target' variable from 'case_status'")
    print(f"  Mapping: Certified -> 1, Denied -> 0")
    
    return df

def encode_data(df):
    """
    Encodes categorical variables for machine learning.
    
    Args:
        df (pd.DataFrame): Dataset with target.
        
    Returns:
        pd.DataFrame: Encoded dataset ready for ML.
    """
    print("\n" + "=" * 60)
    print("CATEGORICAL ENCODING")
    print("=" * 60)
    
    df_encoded = df.copy()
    
    # Binary encoding (Manual map for consistency)
    binary_map = {'Y': 1, 'N': 0}
    binary_cols = ['has_job_experience', 'requires_job_training', 'full_time_position']
    
    for col in binary_cols:
        df_encoded[col] = df_encoded[col].map(binary_map)
    
    print("✓ Binary columns encoded")
    
    # One-Hot Encoding
    categorical_cols = ['continent', 'education_of_employee', 'region_of_employment', 
                        'unit_of_wage']
    # Removed 'wage_category' and 'company_size' as they were M2 features
    
    df_encoded = pd.get_dummies(df_encoded, columns=categorical_cols, prefix_sep='_', drop_first=False)
    
    print("✓ One-Hot Encoding applied")
    
    # Drop original ID and non-numeric target (keep binary target)
    if 'case_id' in df_encoded.columns:
        df_encoded.drop('case_id', axis=1, inplace=True)
    if 'case_status' in df_encoded.columns:
        df_encoded.drop('case_status', axis=1, inplace=True)
        
    print(f"  Final Shape: {df_encoded.shape}")
    return df_encoded

def main():
    # 1. Load Data
    df = load_data('EasyVisa.csv')
    if df is None:
        return
    
    # 2. Explore
    initial_exploration(df)
    check_data_quality(df)
    
    # 3. Preprocess
    df_clean = preprocess_data(df)
    
    # 4. Target Generation (Milestone 1)
    df_targeted = prepare_target(df_clean)
   
    # 5. Encoding (Milestone 1)
    df_encoded = encode_data(df_targeted)
    
    # 6. Export
    print("\n" + "=" * 60)
    print("EXPORTING DATA")
    print("=" * 60)
    
    df_targeted.to_csv('visa_data_preprocessed.csv', index=False)
    print("✓ Saved 'visa_data_preprocessed.csv' (Cleaned & Preprocessed)")
    
    df_encoded.to_csv('visa_data_encoded.csv', index=False)
    print("✓ Saved 'visa_data_encoded.csv' (Encoded for Modeling)")
    
    print("\nMILESTONE 1 COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
