[README (1).md](https://github.com/user-attachments/files/29366581/README.1.md)
# 🌾 Agro_Nexus
> **AI-Powered Smart Agriculture Ecosystem**

Agro_Nexus is an end-to-end smart agriculture platform that combines **Artificial Intelligence, IoT, Full-Stack Web Development, and Precision Farming** into one ecosystem. It helps farmers monitor farms in real time, detect crop diseases, receive AI-powered recommendations, estimate crop yield, and sell produce directly through **Krishi Bajar**.

---

## 🚀 Features

- 🌡️ Real-time IoT sensor dashboard (Temperature, Humidity, Soil Moisture, pH, Light)
- 🤖 AI Farming Assistant (chatbot)
- 🌿 Tea Leaf Disease Detection using TensorFlow CNN + FastAPI
- 📈 Smart Yield Prediction
- 🚨 Intelligent alerts and AI farming tips
- 🌍 English / Nepali support
- 🌙 Dark mode
- 🛒 **Krishi Bajar** marketplace connecting farmers directly with buyers
- 📊 Live charts and farm analytics

---

# 🧠 AI Modules

## 1. AI Farming Assistant
Provides contextual farming guidance through natural language conversations.

## 2. Plant Disease Detection
Pipeline:

```text
Leaf Image
   ↓
Image Preprocessing
   ↓
TensorFlow CNN
   ↓
Disease Classification
   ↓
Confidence Score
   ↓
Treatment Recommendation
```

Supports tea leaf disease classification including Healthy, Anthracnose, Brown Blight, White Spot, Red Leaf Spot, Algal Leaf, Bird Eye Spot and Gray Light.

## 3. Yield Prediction
Estimated yield is calculated using:
- Crop type
- Farm area
- Soil moisture
- Soil pH
- Temperature

---

# 📊 Dashboard

The dashboard continuously monitors:

- Temperature
- Humidity
- Soil Moisture
- Soil pH
- Light Intensity
- IR Sensor Data

It automatically updates crop recommendations, plant health, alerts, AI tips and analytics.

---

# 🛒 Krishi Bajar

Krishi Bajar is an AI-powered agricultural marketplace.

Instead of depending on marketing, SEO, or intermediaries, farmers simply upload their produce. Agro_Nexus enriches listings with AI-generated quality insights and farm information, allowing households, retailers, restaurants, and wholesalers to discover fresh, traceable products through a familiar feed-like experience.

---

# 🏗️ Architecture

```text
                 IoT Sensors
                      │
                      ▼
             Node.js + Express API
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 Smart Dashboard              AI Assistant
        │
        ▼
 Yield Prediction
        │
        ▼
 Plant Disease Detection
        │
        ▼
 TensorFlow CNN + FastAPI
        │
        ▼
 Treatment Recommendation
        │
        ▼
     Krishi Bajar
```

---

# 📂 Project Structure

```text
Agro_Nexus/
├── backend/
│   ├── Express Server
│   ├── Sensor APIs
│   ├── AI Chat APIs
│   └── Database Integration
├── frontend/
│   ├── Dashboard
│   ├── Krishi Bajar
│   ├── AI Chat
│   ├── Yield Prediction
│   ├── Disease Detection UI
│   └── Assets
├── teahackathon/
│   ├── FastAPI
│   ├── TensorFlow Model
│   ├── Dataset
│   └── Training Files
└── README.md
```

---

# 🛠️ Tech Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| AI | TensorFlow, Keras |
| AI API | FastAPI |
| IoT | Soil Moisture, Temperature, Humidity, pH, Light Sensors |
| Charts | JavaScript Charts |
| Language | Python, JavaScript |

---

# ⚙️ Installation

## Backend

```bash
cd backend
npm install
npm start
```

## Frontend

Open the frontend in your browser or serve it using a local web server.

## AI Server

```bash
cd teahackathon/fastapi
pip install -r requirements.txt
uvicorn app:app --reload
```

---

# 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /sensors/latest | Latest sensor values |
| POST /ai/chat | AI assistant |
| POST /predict | Plant disease prediction |

---

# 📸 Screenshots

# 📸 Application Preview
## 🏠 Smart Dashboard

<p align="center">
  <img src="https://github.com/user-attachments/assets/e6ed1aae-a70b-4ddc-b2db-8eb8a664c75d" width="100%">
</p>

---

## 🌙 Dark Theme

<p align="center">
  <img src="https://github.com/user-attachments/assets/918eb316-a750-4949-a435-f2df73d65c52" width="100%">
</p>

---

## 🤖 AI Features

<p align="center">
  <img src="https://github.com/user-attachments/assets/bbc489db-b830-45f7-b577-6203a17f08be" width="49%">
  <img src="https://github.com/user-attachments/assets/10fe9409-f9fd-4c1c-b4ac-f38cd83e5485" width="49%">
</p>

<p align="center">
<b>🤖 AI Farming Assistant</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<b>🌿 Plant Disease Detection</b>
</p>

---

## 📈 Smart Yield Prediction

<p align="center">
  <img src="https://github.com/user-attachments/assets/25d236e6-d1e1-4550-b8ba-0c03ba18444a" width="75%">
</p>

---

### ✨ Highlights

- 🏠 Real-Time Smart Farming Dashboard
- 🌡️ Live Sensor Monitoring
- 📊 Interactive Charts & Analytics
- 🤖 AI Farming Assistant
- 🌿 CNN-based Plant Disease Detection
- 📈 Intelligent Yield Prediction
- 🌍 Multi-language Support (English & Nepali)
- 🌙 Modern Dark Theme
- 🛒 Krishi Bajar Digital Marketplace

---

# 🔮 Future Scope

- Mobile application
- Drone integration
- Satellite imagery
- Weather forecasting
- Fertilizer recommendation engine
- Blockchain-based crop traceability
- AI price prediction
- Smart irrigation automation

---

# 👥 Team

Developed as an AI + IoT Smart Agriculture Hackathon Project.

---

# 📄 License

This project is released under the MIT License.

---

## ⭐ Agro_Nexus Vision

**Empowering farmers through Artificial Intelligence, IoT, data-driven agriculture, and a transparent digital marketplace to build a smarter, more sustainable future for farming.**
