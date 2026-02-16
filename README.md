# Visa Status Prediction Project

## Milestone 1: Data Collection & Preprocessing

Hello! This is my project for predicting US Visa status using machine learning.
I used the EasyVisa dataset which has information about visa applications.

### What is in this folder?
1. **EasyVisa.csv**: The dataset I downloaded.
2. **visa_status_prediction_m1.py**: My python code to clean and prepare the data.
3. **MIT License**: The license for this project.
4. **Readme.md**: This file explaining everything.

### How to Run the Code
You need to have Python installed.
Also install these libraries:
- pandas
- numpy
- matplotlib
- seaborn

You can install them by running:
```
pip install pandas numpy matplotlib seaborn
```

Then run the python file:
```
python visa_status_prediction_m1.py
```

### What does the code do?
- It loads the data from the CSV file.
- Checks if there are any missing values (there were none!).
- Creates some new features like `company_age` and `yearly_wage`.
- Makes some charts to visualize the data (you will see png files appear).
- Encodes the data so it's ready for machine learning in the next milestone.

### Results
After running the code, you will get:
- `visa_data_preprocessed.csv`: The clean data.
- `visa_data_encoded.csv`: The encoded data for ML.
- Several charts like `target_distribution.png` and `correlation_heatmap.png`.

Thanks for checking my project!
