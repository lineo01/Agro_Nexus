import serial
import requests
import json

# Replace COM3 with your Arduino COM port
ser = serial.Serial('COM4', 9600)
backend_url = 'http://localhost:3000/sensors'

while True:
    try:
        line = ser.readline().decode('utf-8').strip()
        if line:
            data = json.loads(line)
            response = requests.post(backend_url, json=data)
            print("Sent:", data, "Response:", response.status_code)
    except Exception as e:
        print("Error:", e)
