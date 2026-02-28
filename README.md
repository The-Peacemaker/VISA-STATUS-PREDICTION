# 🌟 AI Enabled Visa Status Prediction and Processing Time Estimator

Welcome to the **AI Enabled Visa Status Prediction** system! This project is designed to bring transparency and data-driven insights into the visa application process. By analyzing historical application data, this predictive analytics tool estimates visa processing times and predicts application outcomes—helping applicants navigate the often-uncertain waiting periods.

---

## 🚀 Project Overview

Visa applicants frequently face long waiting times and uncertainty. This project leverages Machine Learning (ML) to provide an easy-to-use estimator based on applicant origin, processing office workloads, seasonal trends, and application types. 

### Core Objectives:
- **Data-Driven Estimates:** Predict approximate processing times for visa applications.
- **Trend Analysis:** Identify seasonal and regional patterns affecting visa approvals.
- **Improved Transparency:** Empower applicants with clear, data-backed timeline predictions.

### Folder Structure
```
INFOSYS-SPRINGBOARD/
│
├── Dataset/                            # Contains raw EasyVisa.csv data
├── Docs/                               # Project documentation and assignment files
├── LICENSE                             # MIT License
├── Milestone_1/                        # Data Preprocessing & Target generation
│   ├── visa_status_prediction_m1.py
│   ├── visa_data_preprocessed.csv
│   └── visa_data_encoded.csv
├── Milestone_2/                        # EDA & Feature Engineering
│   ├── visa_status_prediction_m2.py
│   ├── visa_data_m2_engineered.csv
│   └── m2_eda_visualizations/          # Beautiful EDA charts!
└── README.md
```

---

## 🎯 Milestone 1: Data Collection & Preprocessing
*Status: **Completed***

In Milestone 1, we tackled a complex challenge: the original `EasyVisa.csv` dataset only provided classification targets (`case_status`), but the objective required predicting actual processing times. We dynamically and realistically synthesized application tracking data to satisfy the true regression objective!

### Key Achievements:
- **Synthetic Processing Times:** Used intelligent bias mechanisms to generate `application_date`, `decision_date`, and the central target: `processing_time_days` (Days between submission and decision).
- **Data Quality Checked:** Conducted thorough assessment for missing values.
- **Categorical Optimization:** Transformed object types to categories for faster processing.
- **Encoding:** Outputted two distinct files: one untouched for analytical EDA, and one fully binary/one-hot encoded for modeling.

**Outputs (in `Milestone_1/`):**
- `visa_status_prediction_m1.py`: The preprocessing engine.
- `visa_data_preprocessed.csv`: The cleaned data ready for feature engineering.
- `visa_data_encoded.csv`: Strictly numeric data mapped for modeling.

---

## 📈 Milestone 2: Exploratory Data Analysis & Feature Engineering
*Status: **Completed***

For Milestone 2, we advanced from raw data to actionable intelligence, performing feature engineering directly targeting the dates and statistics created in Milestone 1.

### Key Achievements:
- **Feature Engineering:** 
  - Extracted deep temporal indicators: `application_month`, `season`, `season_index`.
  - Computed geographical baseline features: `continent_avg_processing_days`.
  - Scaled economic indicators: categorizing continuous wages into `wage_category`.
- **Deep EDA via Visualizations:** Built a comprehensive visual suite displaying correlations, distributions, and hidden trends across the dataset!

**Outputs (in `Milestone_2/`):**
- `visa_status_prediction_m2.py`: The newly built feature-engineering core.
- `visa_data_m2_engineered.csv`: The fully loaded dataset equipped with seasonal and temporal metrics!
- **`m2_eda_visualizations/`** folder containing:
  1. `1_processing_time_dist.png`
  2. `2_processing_time_boxplot.png`
  3. `3_correlation_heatmap.png`
  4. `4_scatter_month_vs_days.png`
  5. `5_bar_continent_avg.png`
  6. `6_bar_education_avg.png`
  7. `7_monthly_trend.png`

---

## ⚙️ How To Run Locally

### Requirements
Ensure your Python environment contains the necessary data science libraries:
```bash
pip install pandas numpy matplotlib seaborn
```

### Running Milestone 1
Navigate to the `Milestone_1` directory to run the cleaning step:
```bash
cd Milestone_1
python visa_status_prediction_m1.py
```

### Running Milestone 2
Navigate to the `Milestone_2` directory to engineer features and view EDA:
```bash
cd ../Milestone_2
python visa_status_prediction_m2.py
```

---
*Built with passion for transparency using Data Science & Predictive Analytics.*
