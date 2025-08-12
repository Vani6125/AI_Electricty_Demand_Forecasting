import pandas as pd
import pickle
from statsmodels.tsa.arima.model import ARIMA

# Load the dataset
df = pd.read_excel(r"C:\Users\vanim\Downloads\All_Datasets\final_data.xlsx", parse_dates=["Date"])
df.set_index('Date', inplace=True)


# Train ARIMA Model (update p, d, q as per your model tuning)
def train_model():
    model = ARIMA(df["Energy Required (MU)"], order=(5 ,1 , 0))  # Example ARIMA(p,d,q)
    fitted_model = model.fit()
    # Save the trained model
    with open("forecast_model.pkl", "wb") as f:
        pickle.dump(fitted_model, f)
        

def generate_forecast():
    with open("forecast_model.pkl", "rb") as f:
        model = pickle.load(f)
    forecast = model.forecast(steps=1)  # Predict next time step
    return round(forecast[0], 2)  # Return the forecasted value
# Train and save model initially


train_model()

