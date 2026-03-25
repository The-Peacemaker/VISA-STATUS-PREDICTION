# 🌟 AI-Enabled Visa Status Prediction & Processing Time Estimator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue)](https://visa-status-prediction.netlify.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Vercel-black)](https://visa-status-prediction.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A comprehensive machine learning system that predicts visa application processing times using historical data, modern web technologies, and cloud deployment. This project brings transparency and data-driven insights to the visa application process.

---

## 🚀 Live Application

**Frontend:** [https://visa-status-prediction.netlify.app/](https://visa-status-prediction.netlify.app/)  
**Backend API:** [https://visa-status-prediction.vercel.app/](https://visa-status-prediction.vercel.app/)

---
**Documentation files**
  - Agile documentation: [Documents/Benedict_Agile_Documentation.xls](Documents/Benedict_Agile_Documentation.xls)
  - Unit testing: [Documents/Unit_Test_Plan_v0.1.xlsx](Documents/Unit_Test_Plan_v0.1.xlsx)
  - Defect tracker: [Documents/Defect_Tracker.xlsx](Documents/Defect_Tracker.xlsx)



### Key Features
- 🎯 **AI-Powered Predictions:** Estimate visa processing time based on application context
- 📊 **Confidence Scoring:** Get reliability metrics on prediction accuracy
- 📈 **Trend Analytics:** View seasonal and continental processing patterns
- 💾 **Prediction History:** Track and compare past prediction submissions
- 📱 **Responsive Design:** Works seamlessly on mobile, tablet, and desktop
- ⚡ **Real-time API:** Live prediction endpoint connected to trained ML model

---

## 📋 Project Overview

Visa applicants face uncertainty and prolonged waiting periods during the application process. This system leverages machine learning to provide data-driven processing time estimates based on:
- **Applicant Profile:** Education, experience, job type, and wage information
- **Employment Context:** Company size, establishment year, employment region
- **Geographical Factors:** Continental and regional processing patterns
- **Temporal Patterns:** Seasonal trends and monthly variations

### Core Objectives
✅ Predict accurate visa processing timelines  
✅ Identify seasonal and regional processing patterns  
✅ Empower applicants with transparent, data-backed estimates  
✅ Deploy globally accessible, production-ready inference API  

---

## 📁 Project Structure

```
VISA-STATUS-PREDICTION/
│
├── Dataset/
│   └── EasyVisa.csv                    # Original dataset (25,480 visa records)
│
├── Milestone_1/                        # Data Preprocessing & Target Synthesis
│   ├── visa_status_prediction_m1.py
│   ├── visa_data_preprocessed.csv
│   └── visa_data_encoded.csv
│
├── Milestone_2/                        # EDA & Feature Engineering
│   ├── visa_status_prediction_m2.py
│   ├── visa_data_m2_engineered.csv
│   └── m2_eda_visualizations/
│
├── Milestone_3/                        # ML Model Building & Evaluation
│   ├── visa_status_prediction_m3.py
│   ├── m3_model_visualizations/
│   └── m3_saved_models/
│       ├── best_model.joblib           # Random Forest (production model)
│       ├── scaler.joblib               # StandardScaler artifacts
│       └── model_comparison_results.csv
│
├── Milestone_4/
│   ├── app.py                          # Streamlit UI (local demo)
│   ├── predictor.py                    # Prediction engine & feature engineering
│   ├── frontend/                       # React + Vite SPA
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   └── HistoryPage.jsx
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── netlify.toml
│   │   └── README.md
│   │
│   └── backend_vercel/                 # Flask API (production backend)
│       ├── api/
│       │   ├── app.py                  # Vercel serverless entrypoint
│       │   └── predict.py              # Prediction logic
│       ├── models/
│       │   ├── best_model.joblib
│       │   └── scaler.joblib
│       ├── requirements.txt
│       ├── vercel.json
│       └── README.md
│
└── README.md
```

---

## 🎯 Milestone Completion Status

### ✅ Milestone 1: Data Collection & Preprocessing
**Status:** Completed  
**Duration:** Data preparation phase

**Key Achievements:**
- Processed 25,480 visa application records from EasyVisa dataset
- **Synthesized realistic processing timelines** (`processing_time_days`) based on continental, educational, and economic patterns
- Generated `application_date` and `decision_date` with domain-aware bias mechanisms
- Performed categorical optimization and missing value assessment
- Outputted two distinct files: preprocessed CSV and fully encoded numeric dataset

**Outputs:**
- `visa_data_preprocessed.csv` – Cleaned data for analytical exploration
- `visa_data_encoded.csv` – Binary/one-hot encoded data for model training

---

### ✅ Milestone 2: Exploratory Data Analysis & Feature Engineering
**Status:** Completed

**Key Achievements:**
- **Temporal Features:** `application_month`, `season`, `season_index`
- **Geographical Baselines:** `continent_avg`, `education_avg` processing time references
- **Economic Indicators:** `wage_category_index` for income-based pattern recognition
- **Comprehensive EDA:** Generated 7+ visualizations covering distributions, correlations, and trends
- **Data Engineering:** Integrated derived metrics for model readiness

**Outputs:**
- `visa_data_m2_engineered.csv` – Feature-rich dataset with 23 engineered columns
- `m2_eda_visualizations/` – Publication-quality charts and heatmaps

---

### ✅ Milestone 3: ML Model Building & Evaluation
**Status:** Completed

**Modeling Approach:**
- **Candidate Models:**
  - Linear Regression (baseline)
  - Random Forest Regressor (selected champion)
  - Additional ensemble methods tested

- **Evaluation Metrics:**
  - Mean Absolute Error (MAE)
  - Root Mean Squared Error (RMSE)
  - R² Score
  - Cross-Validation (5-fold)

- **Result:** Random Forest Regressor selected for superior performance and non-linear relationship capture

**Outputs:**
- `best_model.joblib` – Trained Random Forest model (production-ready)
- `scaler.joblib` – Pre-fitted StandardScaler for feature normalization
- `model_comparison_results.csv` – Performance metrics across all tested models
- `m3_model_visualizations/` – Feature importance, residuals, and error analysis plots

---

### ✅ Milestone 4: Web Application & Cloud Deployment
**Status:** Completed  
**Deployed:** March 2026

**Architecture:**

```
┌──────────────────────────────────────────────────────────────┐
│                    User Browser                               │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ↓
┌──────────────────────────────────────────────────────────────┐
│         Netlify CDN (Static Frontend)                         │
│  https://visa-status-prediction.netlify.app                  │
│                                                               │
│  • React 18 + Vite SPA                                        │
│  • Tailwind CSS + Framer Motion                               │
│  • Responsive design (mobile → 4K)                            │
│  • localStorage prediction history                            │
└────────────────────┬─────────────────────────────────────────┘
                     │ API Call (CORS-enabled)
                     ↓
┌──────────────────────────────────────────────────────────────┐
│         Vercel Serverless Functions (Backend)                │
│  https://visa-status-prediction.vercel.app                   │
│                                                               │
│  • Flask microservice (Python)                                │
│  • POST /api/predict endpoint                                 │
│  • Real-time ML inference                                     │
│  • Auto-scaling & cold-start optimized                        │
└────────────────────┬─────────────────────────────────────────┘
                     │ Model Loading & Inference
                     ↓
┌──────────────────────────────────────────────────────────────┐
│         ML Model Layer                                         │
│                                                               │
│  • Random Forest (scikit-learn)                               │
│  • Feature scaling (StandardScaler)                           │
│  • Deterministic predictions with confidence scoring          │
└──────────────────────────────────────────────────────────────┘
```

**Frontend Features:**
- 🏠 **Landing Page:** Product overview, feature highlights, call-to-action
- 🔮 **Prediction Dashboard:** Interactive form for visa application context
- 📊 **Result Visualization:** Confidence gauge, trend analysis, continental comparison
- 📜 **Prediction History:** Searchable history with filtering and export
- 📱 **Responsive Design:** Optimized for mobile (320px), tablet, and desktop (2560px+)

**Backend Capabilities:**
- ✅ Real-time prediction inference (<500ms)
- ✅ Confidence scoring (0-100%) with uncertainty quantification
- ✅ Trend forecasting (month-by-month processing patterns)
- ✅ Regional comparison analysis
- ✅ CORS-enabled for cross-origin requests
- ✅ Automatic fallback to local mock mode if backend unavailable

**Tech Stack:**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite | Modern SPA framework & build tool |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **Animation** | Framer Motion 11 | Smooth UI transitions |
| **Charts** | Recharts 2 | Data visualization (gauges, trends) |
| **Routing** | React Router v6 | Client-side navigation |
| **Backend** | Flask 3.1 | Python microservice framework |
| **ML Engine** | scikit-learn, joblib | Model storage & inference |
| **Data Processing** | pandas, numpy | Feature engineering & transformations |
| **Deployment** | Netlify, Vercel | Serverless hosting & CDN |

**Outputs:**
- `Milestone_4/frontend/` – Complete React SPA ready for production
- `Milestone_4/backend_vercel/` – Flask API for Vercel deployment
- `app.py` – Streamlit local demo application
- `predictor.py` – Reusable prediction engine module

---

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup (Local Inference)

```bash
# Clone and navigate
git clone https://github.com/The-Peacemaker/VISA-STATUS-PREDICTION.git
cd VISA-STATUS-PREDICTION/PROJECT/Milestone_4

# Create Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Streamlit demo (local UI)
streamlit run app.py
# Opens at http://localhost:8501
```

### Frontend Setup (Local Development)

```bash
# Navigate to frontend
cd Milestone_4/frontend

# Install dependencies
npm install

# Set backend environment variable
export VITE_API_BASE_URL=http://localhost:8787  # Or your backend URL

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

### Backend API Setup (Local Flask)

```bash
# In a separate terminal, from PROJECT/Milestone_4/backend_vercel/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run Flask development server
export FLASK_APP=api/predict.py
export FLASK_RUN_PORT=8787
python -m flask run --host 127.0.0.1

# API available at http://localhost:8787/api/predict
```

### Test Prediction Endpoint

```bash
curl -X POST http://localhost:8787/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "continent": "Asia",
    "education_of_employee": "Master'\''s",
    "has_job_experience": "Y",
    "requires_job_training": "N",
    "no_of_employees": 500,
    "yr_of_estab": 2010,
    "region_of_employment": "West",
    "prevailing_wage": 4200,
    "unit_of_wage": "Month",
    "full_time_position": "Y",
    "application_month": 5
  }'
```

---

## 📦 Production Build & Deployment

### Frontend Deployment (Netlify)

```bash
cd Milestone_4/frontend

# Build production bundle
npm run build

# Deploy to Netlify (requires Netlify CLI)
netlify deploy --prod --dir=dist
```

**Environment Variables:**
```
VITE_API_BASE_URL=https://visa-status-prediction.vercel.app
```

### Backend Deployment (Vercel)

```bash
cd Milestone_4/backend_vercel

# Deploy using Vercel CLI
vercel deploy --prod

# Or import directly from GitHub:
# 1. Visit https://vercel.com/new
# 2. Import GitHub repo
# 3. Set Root Directory: Milestone_4/backend_vercel
# 4. Deploy
```

---

## 📊 Model Performance

**Random Forest Regressor Results:**
- **MAE:** ~4.2 days
- **RMSE:** ~6.1 days
- **R² Score:** 0.87
- **Cross-Validation Stability:** Robust across 5-fold splits

**Key Predictive Features (by importance):**
1. Continent (regional processing baseline)
2. Education level (expertise-based prioritization)
3. Wage category (economic indicator)
4. Application month (seasonal patterns)
5. Company establishment year (organizational maturity)

---

## 🔐 Data Privacy & Security

- **Input Data:** Not stored; processed in-memory during inference
- **API:** CORS-protected, HTTPS-only in production
- **Model:** Read-only access; no training on user inputs
- **History:** Client-side localStorage only; no server-side tracking

---

## 📝 Dataset Information

**Source:** EasyVisa dataset  
**Records:** 25,480 visa applications  
**Features:** 12 input attributes + synthesized temporal targets  
**Target Variable:** `processing_time_days` (1-365 days)  
**Geographical Coverage:** 6 continents, 5 employment regions  

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Benedict Chacko Mathew**  

---

## 🙏 Acknowledgments

- **Dataset:** EasyVisa public dataset
- **Technologies:** scikit-learn, React, Tailwind CSS, Vercel, Netlify
- **Inspiration:** Making visa application timelines transparent and predictable

---

## 📞 Support

For issues, questions, or feedback:
- Open an issue on [GitHub](https://github.com/The-Peacemaker/VISA-STATUS-PREDICTION)
- Visit the [live demo](https://visa-status-prediction.netlify.app/)
- Check the [backend API documentation](Milestone_4/backend_vercel/README.md)

---

**Built with ❤️ for transparency in visa processing timelines.**

*Last Updated: March 25, 2026*
