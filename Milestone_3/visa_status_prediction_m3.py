"""
Milestone 3: Model Building, Training, and Evaluation.

This module is responsible for:
1. Loading the feature-engineered dataset from Milestone 2.
2. Preparing features and target variables.
3. Splitting and scaling the data.
4. Training various regression models.
5. Performing hyperparameter tuning on the best performing models.
6. Generating evaluation visualizations.
7. Persisting the best model artifacts.
"""

import os
import time
import logging
import warnings
import joblib

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    AdaBoostRegressor,
)
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Configure logging and plotting defaults
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
warnings.filterwarnings("ignore")
sns.set_theme(style="whitegrid")
sns.set_palette("muted")

RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5
VIZ_DIR = "m3_model_visualizations"
MODEL_DIR = "m3_saved_models"

def load_data():
    """Load the feature-engineered dataset from Milestone 2."""
    logging.info("Loading Milestone-2 engineered dataset...")
    m2_path = os.path.join("..", "Milestone_2", "visa_data_m2_engineered.csv")
    
    if not os.path.exists(m2_path):
        logging.error("Could not locate %s", m2_path)
        return None

    df = pd.read_csv(m2_path, parse_dates=["application_date", "decision_date"])
    logging.info("Dataset shape: %s", df.shape)
    return df

def prepare_features(df):
    """
    Prepare feature matrix X and target y by dropping non-predictive columns 
    and one-hot encoding categoricals.
    """
    logging.info("Preparing features...")
    df_model = df.copy()

    cols_to_drop = [
        "case_id", "application_date", "decision_date", 
        "case_status", "target_binary", "season", "wage_category"
    ]
    df_model.drop(columns=[col for col in cols_to_drop if col in df_model.columns], inplace=True)

    cat_cols = df_model.select_dtypes(include=["object", "category"]).columns.tolist()
    if cat_cols:
        df_model = pd.get_dummies(df_model, columns=cat_cols, drop_first=True)

    target_col = "processing_time_days"
    y = df_model[target_col]
    X = df_model.drop(columns=[target_col])

    logging.info("Feature matrix X shape: %s, target y shape: %s", X.shape, y.shape)
    return X, y

def split_and_scale(X, y):
    """Split data into train/test sets and apply standard scaling."""
    logging.info("Splitting and scaling data (test_size=%.2f)...", TEST_SIZE)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index
    )
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test), columns=X_test.columns, index=X_test.index
    )
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler

def get_models():
    """Return a dictionary of regression models for evaluation."""
    return {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=RANDOM_STATE),
        "Lasso Regression": Lasso(alpha=0.1, random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeRegressor(max_depth=10, random_state=RANDOM_STATE),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=15, random_state=RANDOM_STATE, n_jobs=None),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=RANDOM_STATE),
        "AdaBoost": AdaBoostRegressor(n_estimators=100, learning_rate=0.1, random_state=RANDOM_STATE),
        "KNN Regressor": KNeighborsRegressor(n_neighbors=7, n_jobs=None),
        "SVR (RBF Kernel)": SVR(kernel="rbf", C=10.0, epsilon=0.5),
    }

def train_and_evaluate(models, X_train, X_test, y_train, y_test):
    """Train multiple models and compute evaluation metrics."""
    logging.info("Training and evaluating models...")
    results, trained_models = {}, {}

    for name, model in models.items():
        logging.info("Training: %s", name)
        
        start_time = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - start_time
        
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)

        cv_scores = cross_val_score(model, X_train, y_train, cv=CV_FOLDS, scoring="r2", n_jobs=None)
        
        results[name] = {
            "MAE": round(mae, 4), "MSE": round(mse, 4),
            "RMSE": round(rmse, 4), "R2": round(r2, 4),
            "CV_R2_Mean": round(cv_scores.mean(), 4),
            "CV_R2_Std": round(cv_scores.std(), 4),
            "Train_Time": round(train_time, 3),
        }
        trained_models[name] = model

    return results, trained_models

def hyperparameter_tuning(results, X_train, y_train, X_test, y_test):
    """Perform GridSearchCV on the top-performing models based on initial R2 score."""
    logging.info("Performing hyperparameter tuning on top models...")
    
    param_grids = {
        "Ridge Regression": {"alpha": [0.01, 0.1, 1.0, 10.0]},
        "Lasso Regression": {"alpha": [0.001, 0.01, 0.1, 0.5]},
        "Decision Tree": {"max_depth": [5, 10, 15], "min_samples_split": [2, 5]},
        "Random Forest": {"n_estimators": [100, 200], "max_depth": [10, 20]},
        "Gradient Boosting": {"n_estimators": [100, 200], "learning_rate": [0.05, 0.1]},
        "AdaBoost": {"n_estimators": [50, 100], "learning_rate": [0.05, 0.1]},
        "KNN Regressor": {"n_neighbors": [5, 7, 9], "weights": ["uniform", "distance"]},
        "SVR (RBF Kernel)": {"C": [1.0, 10.0], "epsilon": [0.1, 0.5]}
    }

    ranked_models = sorted(results.items(), key=lambda x: x[1]["R2"], reverse=True)
    top_models = [(name, info) for name, info in ranked_models[:2] if name in param_grids]
    
    model_map = {
        "Ridge Regression": Ridge(random_state=RANDOM_STATE),
        "Lasso Regression": Lasso(random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeRegressor(random_state=RANDOM_STATE),
        "Random Forest": RandomForestRegressor(random_state=RANDOM_STATE, n_jobs=None),
        "Gradient Boosting": GradientBoostingRegressor(random_state=RANDOM_STATE),
        "AdaBoost": AdaBoostRegressor(random_state=RANDOM_STATE),
        "KNN Regressor": KNeighborsRegressor(n_jobs=None),
        "SVR (RBF Kernel)": SVR(kernel="rbf")
    }

    tuned_results = {}
    for name, _ in top_models:
        logging.info("Tuning %s...", name)
        grid = param_grids[name]
        base_model = model_map[name]
        
        gs = GridSearchCV(
            estimator=base_model, param_grid=grid, cv=CV_FOLDS, 
            scoring="neg_mean_squared_error", n_jobs=None
        )
        
        start_time = time.time()
        gs.fit(X_train, y_train)
        tune_time = time.time() - start_time
        
        y_pred = gs.best_estimator_.predict(X_test)
        
        tuned_results[name] = {
            "best_params": gs.best_params_,
            "MAE": round(mean_absolute_error(y_test, y_pred), 4),
            "RMSE": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
            "R2": round(r2_score(y_test, y_pred), 4),
            "Tune_Time": round(tune_time, 3),
            "model": gs.best_estimator_,
        }
        logging.info("Best parameters for %s: %s", name, gs.best_params_)

    return tuned_results

def generate_visualizations(results, trained_models, X_test, y_test, feature_names):
    """Generate and save evaluation metrics charts."""
    logging.info("Generating evaluation visualizations...")
    os.makedirs(VIZ_DIR, exist_ok=True)

    names = list(results.keys())
    r2_scores = [results[m]["R2"] for m in names]
    rmse_scores = [results[m]["RMSE"] for m in names]

    # Bar plot for R2 comparison
    plt.figure(figsize=(10, 6))
    sns.barplot(x=r2_scores, y=names, palette="viridis")
    plt.xlabel("R2 Score")
    plt.title("Model R2 Comparison")
    plt.tight_layout()
    plt.savefig(os.path.join(VIZ_DIR, "1_r2_comparison.png"), dpi=300)
    plt.close()

    # Bar plot for RMSE comparison
    plt.figure(figsize=(10, 6))
    sns.barplot(x=rmse_scores, y=names, palette="magma")
    plt.xlabel("RMSE (Days)")
    plt.title("Model RMSE Comparison")
    plt.tight_layout()
    plt.savefig(os.path.join(VIZ_DIR, "2_rmse_comparison.png"), dpi=300)
    plt.close()

    best_name = max(results, key=lambda k: results[k]["R2"])
    best_model = trained_models[best_name]
    y_pred = best_model.predict(X_test)

    # Actual vs Predicted distribution
    plt.figure(figsize=(8, 8))
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], "r--")
    plt.xlabel("Actual Processing Days")
    plt.ylabel("Predicted Processing Days")
    plt.title(f"Actual vs Predicted ({best_name})")
    plt.tight_layout()
    plt.savefig(os.path.join(VIZ_DIR, "3_actual_vs_predicted.png"), dpi=300)
    plt.close()

    # Feature Importance for tree models
    if hasattr(best_model, "feature_importances_"):
        importances = pd.Series(best_model.feature_importances_, index=feature_names)
        importances.nlargest(15).sort_values().plot(kind="barh", figsize=(10, 6), color="teal")
        plt.title(f"Top 15 Feature Importances ({best_name})")
        plt.xlabel("Importance")
        plt.tight_layout()
        plt.savefig(os.path.join(VIZ_DIR, "4_feature_importance.png"), dpi=300)
        plt.close()

    return best_name, best_model

def save_model_artifacts(best_name, best_model, scaler, results, tuned_results):
    """Persist the best model and scaler to disk."""
    logging.info("Saving model artifacts...")
    os.makedirs(MODEL_DIR, exist_ok=True)

    final_model, final_name = best_model, best_name
    for t_name, t_info in tuned_results.items():
        if t_info["R2"] > results[best_name]["R2"]:
            final_model, final_name = t_info["model"], f"{t_name} (Tuned)"
            logging.info("Tuned model %s outperformed default %s.", t_name, best_name)

    model_path = os.path.join(MODEL_DIR, "best_model.joblib")
    scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")
    joblib.dump(final_model, model_path)
    joblib.dump(scaler, scaler_path)

    pd.DataFrame(results).T.to_csv(os.path.join(MODEL_DIR, "model_comparison_results.csv"), encoding="utf-8")
    
    logging.info("Best model saved as %s.", final_name)
    return final_name

def main():
    df = load_data()
    if df is None: return

    X, y = prepare_features(df)
    X_train, X_test, y_train, y_test, scaler = split_and_scale(X, y)
    
    models = get_models()
    results, trained_models = train_and_evaluate(models, X_train, X_test, y_train, y_test)
    
    tuned_results = hyperparameter_tuning(results, X_train, y_train, X_test, y_test)
    
    best_name, best_model = generate_visualizations(
        results, trained_models, X_test, y_test, X_train.columns
    )
    
    final_model_name = save_model_artifacts(
        best_name, best_model, scaler, results, tuned_results
    )
    logging.info("Milestone 3 completed successfully. Best Architecture: %s", final_model_name)

if __name__ == "__main__":
    main()
