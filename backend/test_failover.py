import requests

url = "http://localhost:8000/submit-complaint"
data = {
    "pnr": "1234567890",
    "train_number": "12267",
    "coach_number": "B1",
    "description": "Local failover test",
    "phone_number": "9372267957"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
