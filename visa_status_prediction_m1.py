import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
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

def feature_engineering(df):
    """
    Creates new features from existing ones.
    
    Args:
        df (pd.DataFrame): Preprocessed dataset.
        
    Returns:
        pd.DataFrame: Dataset with new features.
    """
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING")
    print("=" * 60)
    
    # 1. Company Age
    current_year = 2026
    df['company_age'] = current_year - df['yr_of_estab']
    print("✓ Created 'company_age'")
    
    # 2. Standardized Wage (Yearly)
    def standardize_wage(row):
        wage = row['prevailing_wage']
        unit = row['unit_of_wage']
        if unit == 'Hour':
            return wage * 40 * 52
        elif unit == 'Week':
            return wage * 52
        elif unit == 'Month':
            return wage * 12
        else:
            return wage

    df['yearly_wage'] = df.apply(standardize_wage, axis=1)
    print("✓ Created 'yearly_wage'")
    
    # 3. Wage Category
    df['wage_category'] = pd.qcut(df['yearly_wage'], q=4, labels=['Low', 'Medium', 'High', 'Very High'])
    print("✓ Created 'wage_category'")
    
    # 4. Company Size Category
    def categorize_size(n):
        if n < 50: return 'Small'
        elif n < 250: return 'Medium'
        elif n < 1000: return 'Large'
        else: return 'Enterprise'
        
    df['company_size'] = df['no_of_employees'].apply(categorize_size)
    print("✓ Created 'company_size'")
    
    # 5. Target Binary
    # Case Status: Certified -> 1, Denied -> 0
    df['target'] = df['case_status'].apply(lambda x: 1 if x == 'Certified' else 0)
    print("✓ Created binary 'target' variable")
    
    return df

def generate_visualizations(df):
    """
    Generates and saves exploratory visualizations.
    
    Args:
        df (pd.DataFrame): Dataset with features.
    """
    print("\n" + "=" * 60)
    print("GENERATING VISUALIZATIONS")
    print("=" * 60)
    
    sns.set_palette('husl')
    
    # 1. Target Distribution
    plt.figure(figsize=(10, 6))
    ax = sns.countplot(x='case_status', data=df)
    plt.title('Distribution of Case Status')
    plt.savefig('target_distribution.png')
    plt.close()
    print("✓ Saved 'target_distribution.png'")
    
    # 2. Numerical Distributions
    num_cols = ['no_of_employees', 'yr_of_estab', 'prevailing_wage', 'company_age', 'yearly_wage']
    df[num_cols].hist(figsize=(15, 10), bins=30, edgecolor='black')
    plt.tight_layout()
    plt.savefig('numerical_distributions.png')
    plt.close()
    print("✓ Saved 'numerical_distributions.png'")
    
    # 3. Correlation Heatmap
    plt.figure(figsize=(12, 10))
    # Select only numeric, excluding target if it's there as we want correlation matrix of features + target
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()
    sns.heatmap(corr, annot=True, cmap='RdBu_r', center=0, fmt='.2f')
    plt.title('Feature Correlation Heatmap')
    plt.savefig('correlation_heatmap.png')
    plt.close()
    print("✓ Saved 'correlation_heatmap.png'")

def encode_data(df):
    """
    Encodes categorical variables for machine learning.
    
    Args:
        df (pd.DataFrame): Feature-engineered dataset.
        
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
                        'unit_of_wage', 'wage_category', 'company_size']
    
    df_encoded = pd.get_dummies(df_encoded, columns=categorical_cols, prefix_sep='_', drop_first=False)
    # Note: drop_first=False to keep all categories for analysis, can change for specific models
    
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
    
    # 4. Feature Engineering
    df_featured = feature_engineering(df_clean)
    
    # 5. Visualizations
    generate_visualizations(df_featured)
    
    # 6. Encoding
    df_encoded = encode_data(df_featured)
    
    # 7. Export
    print("\n" + "=" * 60)
    print("EXPORTING DATA")
    print("=" * 60)
    
    df_featured.to_csv('visa_data_preprocessed.csv', index=False)
    print("✓ Saved 'visa_data_preprocessed.csv' (Cleaned with categories)")
    
    df_encoded.to_csv('visa_data_encoded.csv', index=False)
    print("✓ Saved 'visa_data_encoded.csv' (Encoded for ML)")
    
    print("\nMILESTONE 1 COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
