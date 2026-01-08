// Agro Chakra Arduino Nano Demo - IR Sensor + Mock Data

const int irPin = 2; // IR sensor connected to digital pin 2

void setup() {
  Serial.begin(9600);  // Start Serial communication
  pinMode(irPin, INPUT);
}

void loop() {
  int irValue = digitalRead(irPin); // Read IR sensor (0 or 1)

  // Mock other sensor data (replace with real sensors later)
  float temperature = 28.0; // °C
  float humidity = 65.0;    // %
  float moisture = 40.0;    // %
  float ph = 6.5;           // pH
  String season = "wet";

  // Build JSON string
  String json = "{";
  json += "\"ir\":" + String(irValue);
  json += ",\"temperature\":" + String(temperature);
  json += ",\"humidity\":" + String(humidity);
  json += ",\"moisture\":" + String(moisture);
  json += ",\"ph\":" + String(ph);
  json += ",\"season\":\"" + season + "\"}";
  
  // Send JSON over Serial
  Serial.println(json);

  delay(5000); // Wait 5 seconds before sending next reading
}
