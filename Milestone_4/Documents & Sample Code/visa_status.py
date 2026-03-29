# milestone 4 

#predict.py

import pandas as pd
import joblib

# Load trained model
model = joblib.load("rf_model.pkl")

# Load encoders (if you saved them)
country_encoder = joblib.load("country_encoder.pkl")
visa_encoder = joblib.load("visa_encoder.pkl")

def preprocess_input(data):
    """
    Convert user input into model-ready format
    """

    df = pd.DataFrame([data])

    # Convert date
    df["application_date"] = pd.to_datetime(df["application_date"])

    # Feature Engineering
    df["month"] = df["application_date"].dt.month

    # Encode categorical variables
    df["country"] = country_encoder.transform(df["country"])
    df["visa_type"] = visa_encoder.transform(df["visa_type"])

    # Drop unused columns
    df = df.drop(columns=["application_date"])

    return df


def predict_processing_time(input_data):
    """
    Takes user input → returns predicted processing time
    """

    processed_data = preprocess_input(input_data)

    prediction = model.predict(processed_data)

    return round(prediction[0], 2)



#streamlit code- frontend

# pip install streamlit

#app.py - to run the streamlit app- streamlit run app.py

import streamlit as st
from predict import predict_processing_time

st.title("Visa Processing Time Estimator")

st.write("Enter application details below:")

# Input fields
country = st.selectbox("Select Country", ["India", "USA", "UK"]) # selectbox- creating the dropdown menu
visa_type = st.selectbox("Visa Type", ["Student", "Tourist", "Work"])
application_date = st.date_input("Application Date") # date_input- allows teh user to pick the date

# Button
if st.button("Predict Processing Time"):

    input_data = {
        "country": country,
        "visa_type": visa_type,
        "application_date": str(application_date)
    }

    result = predict_processing_time(input_data)

    st.success(f"Estimated Processing Time: {result} days")


# Final testing with multiple cases 

# test_cases.py 

from predict import predict_processing_time

# Multiple test cases
test_cases = [
    {
        "country": "India",
        "visa_type": "Student",
        "application_date": "2024-01-01"
    },
    {
        "country": "USA",
        "visa_type": "Work",
        "application_date": "2024-03-15"
    },
    {
        "country": "UK",
        "visa_type": "Tourist",
        "application_date": "2024-06-10"
    },
    {
        "country": "India",
        "visa_type": "Work",
        "application_date": "2024-11-20"
    }
]

# Run predictions
for i, case in enumerate(test_cases):
    result = predict_processing_time(case)
    print(f"Test Case {i+1}: {result} days")