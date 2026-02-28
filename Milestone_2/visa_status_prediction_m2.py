import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
import os

warnings.filterwarnings('ignore')
sns.set_theme(style="whitegrid")
sns.set_palette("muted")

def load_data(filepath):
    print("=" * 60)
    print("LOADING M1 DATA FOR EDA")
    print("=" * 60)
    try:
        # Load data, converting string dates back into datetime objects
        df = pd.read_csv(filepath, parse_dates=['application_date', 'decision_date'])
        print(f"✓ Dataset loaded successfully from {filepath}")
        print(f"  Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
        return df
    except FileNotFoundError:
        print(f"✗ Error: File not found at {filepath}")
        return None

def feature_engineering(df):
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING (MENTOR SPECIFICATIONS)")
    print("=" * 60)
    
    ### FEATURE 1: Application Month
    df['application_month'] = df['application_date'].dt.month
    print("✓ FEATURE 1: Engineered 'application_month'.")
    
    ### FEATURE 2: Seasonal Index (Peak vs Off-Peak)
    df["season"] = df["application_month"].apply(lambda x: "Peak" if x in [1, 2, 12] else "Off-Peak")
    df['season_index'] = df['season'].apply(lambda x: 1 if x == "Peak" else 0)
    print("✓ FEATURE 2: Engineered 'season' (Peak/Off-Peak) and 'season_index'.")
    
    ### FEATURE 3: Country-Specific Average Processing Time
    # Note: Our dataset uses 'continent', so we engineer continent_avg as proxy for country_avg.
    continent_avg = df.groupby('continent')['processing_time_days'].mean()
    df['continent_avg'] = df['continent'].map(continent_avg)
    print("✓ FEATURE 3: Engineered 'continent_avg' (proxy for Country Average).")
    
    ### FEATURE 4: Visa-Type Average Processing Time
    # Note: Our dataset uses 'education_of_employee', which closely maps to visa subclass restrictions.
    education_avg = df.groupby('education_of_employee')['processing_time_days'].mean()
    df['education_avg'] = df['education_of_employee'].map(education_avg)
    print("✓ FEATURE 4: Engineered 'education_avg' (proxy for Visa-Type Average).")
    
    # Additional engineering: wage quartile categorization for later use
    df['wage_category'] = pd.qcut(df['prevailing_wage'], q=4, labels=['Low', 'Medium', 'High', 'Very High'])
    df['wage_category_index'] = df['wage_category'].astype('category').cat.codes
    print("✓ Engineered 'wage_category' and index.")
    
    return df

def perform_eda(df):
    print("\n" + "=" * 60)
    print("EXPLORATORY DATA ANALYSIS (EDA) & VISUALIZATION")
    print("=" * 60)
    
    output_dir = 'm2_eda_visualizations'
    os.makedirs(output_dir, exist_ok=True)
    
    # Statistical summary
    print("\nProcessing Days Statistical Summary:")
    print(df["processing_time_days"].describe())
    
    # 1. Distribution Plot (Histogram + KDE)
    plt.figure(figsize=(10, 6))
    sns.histplot(df["processing_time_days"], kde=True, bins=40, color='#3498db')
    plt.title("Distribution of Visa Processing Days", fontsize=16)
    plt.xlabel("Processing Days")
    plt.ylabel("Number of Applications")
    plt.tight_layout()
    plt.savefig(f'{output_dir}/1_processing_time_dist.png', dpi=300)
    plt.close()
    
    # 2. Boxplot (Outlier Detection)
    plt.figure(figsize=(8, 5))
    sns.boxplot(x=df["processing_time_days"], color='lightgreen')
    plt.title("Boxplot of Processing Days", fontsize=16)
    plt.xlabel("Processing Days")
    plt.tight_layout()
    plt.savefig(f'{output_dir}/2_processing_time_boxplot.png', dpi=300)
    plt.close()
    
    # 3. Correlation Heatmap
    plt.figure(figsize=(10, 8))
    numeric_df = df.select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr()
    sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", fmt=".2f")
    plt.title("Correlation Heatmap", fontsize=16)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/3_correlation_heatmap.png', dpi=300)
    plt.close()
    
    # 4. Scatter Plot: Processing Days vs Application Month
    plt.figure(figsize=(10, 6))
    sns.scatterplot(x="application_month", y="processing_time_days", data=df, alpha=0.5)
    plt.title("Processing Days vs Application Month", fontsize=16)
    plt.xlabel("Application Month")
    plt.ylabel("Processing Days")
    plt.tight_layout()
    plt.savefig(f'{output_dir}/4_scatter_month_vs_days.png', dpi=300)
    plt.close()
    
    # 5. Bar Chart: Average Processing Days by Continent (Proxy for Country)
    continent_avg = df.groupby("continent")["processing_time_days"].mean().sort_values(ascending=False)
    plt.figure(figsize=(12, 6))
    plt.bar(continent_avg.index, continent_avg.values, color='coral')
    plt.title("Average Processing Days by Continent", fontsize=16)
    plt.xlabel("Continent")
    plt.ylabel("Average Processing Days")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/5_bar_continent_avg.png', dpi=300)
    plt.close()
    
    # 6. Bar Chart: Average Processing Days by Education (Proxy for Visa Type)
    edu_avg = df.groupby("education_of_employee")["processing_time_days"].mean().sort_values(ascending=False)
    plt.figure(figsize=(12, 6))
    plt.bar(edu_avg.index, edu_avg.values, color='skyblue')
    plt.title("Average Processing Days by Education Level", fontsize=16)
    plt.xlabel("Education Level")
    plt.ylabel("Average Processing Days")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/6_bar_education_avg.png', dpi=300)
    plt.close()

    # 7. Line Plot: Monthly Trend of Processing Days
    monthly_avg = df.groupby("application_month")["processing_time_days"].mean()
    plt.figure(figsize=(10, 6))
    plt.plot(monthly_avg.index, monthly_avg.values, marker='o', color='purple', linewidth=2)
    plt.title("Monthly Trend of Processing Days", fontsize=16)
    plt.xlabel("Month")
    plt.ylabel("Average Processing Days")
    plt.xticks(range(1, 13))
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/7_monthly_trend.png', dpi=300)
    plt.close()
    
    print("✓ All EDA Visualizations aligned with Mentor specifications saved in 'm2_eda_visualizations' directory.")

def main():
    m1_data_path = os.path.join('..', 'Milestone_1', 'visa_data_preprocessed.csv')
    df = load_data(m1_data_path)
    if df is None: return
    
    df_engineered = feature_engineering(df)
    perform_eda(df_engineered)
    
    df_engineered.to_csv('visa_data_m2_engineered.csv', index=False)
    print("\n✓ Exported features to 'visa_data_m2_engineered.csv'.")
    print("MILESTONE 2 COMPLETED SUCCESSFULLY! ⭐")

if __name__ == "__main__":
    main()
