from flask import Flask, jsonify, render_template
from apscheduler.schedulers.background import BackgroundScheduler
import psycopg2
import pickle
import datetime
import pandas as pd
import matplotlib.pyplot as plt 
import io
import base64
app = Flask(__name__, template_folder="../frontend")


# Database Configuration
DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "Manukonda310",
    "host": "localhost",
    "port": "5432"
}

# Load the trained ARIMA model
with open("flask/arima_model.pkl", "rb") as model_file:
    arima_model = pickle.load(model_file)


def generate_forecast():
    """Generate and update the daily forecast in the database"""
    today = datetime.date.today()

    # Predict electricity demand using ARIMA
    forecast_steps = 1  # Predict for the next day
    forecast_value = round(arima_model.forecast(steps=forecast_steps)[0], 2)

    # Connect to PostgreSQL
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Check if today's forecast already exists
    cursor.execute("SELECT * FROM forecasts WHERE timestamp = %s", (today,))
    existing_row = cursor.fetchone()

    if existing_row:
        # Update existing row
        cursor.execute(
            "UPDATE forecasts SET value = %s WHERE timestamp = %s",
            (forecast_value, today)
        )
        print(f"Updated forecast for {today}: {forecast_value} MU")
    else:
        # Insert new row
        cursor.execute(
            "INSERT INTO forecasts (timestamp, demand) VALUES (%s, %s)",
            (today, forecast_value)
        )
        print(f"Inserted new forecast for {today}: {forecast_value} MU")

    conn.commit()
    cursor.close()
    conn.close()


@app.route("/get_forecast", methods=["GET"])
def get_forecast():
    """API to fetch the latest forecast from the database"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    today = datetime.date.today()
    cursor.execute("SELECT value FROM forecasts WHERE timestamp = %s", (today,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result:
        return jsonify({
            "time_period": today.strftime("%Y-%m-%d"),
            "value": result[0],
            "unit": "MU"
        })
    else:
        return jsonify({"error": "No forecast available for today"})
    # Fetch last 5 forecast values
def get_last_5_forecasts():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, demand FROM forecasts ORDER BY timestamp DESC LIMIT 5")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Convert results into a DataFrame for easier handling
    df = pd.DataFrame(rows, columns=["date", "demand"])
    df.sort_values("date", inplace=True)  # Sort by date to maintain order
    return df

@app.route('/dashboard')
def chart():
    df = get_last_5_forecasts()

    # Plot bar chart
    plt.figure(figsize=(8, 5))
    plt.bar(df["date"].astype(str), df["demand"], color='skyblue')
    plt.xlabel("Day")
    plt.ylabel("Predicted Demand (MU)")
    plt.title("Last 5 Days Forecasted Demand")
    plt.xticks(rotation=45)

    # Save plot to a string buffer
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    encoded_img = base64.b64encode(img.getvalue()).decode("utf-8")
    plt.close()
    print(f"Encoded image: {encoded_img[:100]}")  # Debug - print first 100 characters
    return render_template("dashboard.html", chart_image=encoded_img)

# Run the forecast update daily
scheduler = BackgroundScheduler()
scheduler.add_job(generate_forecast, "interval", days=1)
scheduler.start()


if __name__ == "__main__":
    generate_forecast()  # Run once at startup
    app.run(debug=True)
