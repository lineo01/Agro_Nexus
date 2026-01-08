// server.js
import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// --------------------------------------------------------
// LOAD LOCAL AI DATASET
// --------------------------------------------------------
const datasetPath = path.join('.', 'AIRefining.jsonl');
const aiDataset = fs.readFileSync(datasetPath, 'utf-8')
  .split('\n')
  .filter(line => line.trim() !== '')
  .map(line => JSON.parse(line));

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));

// --------------------------------------------------------
// SENSOR STATE
// --------------------------------------------------------
let latestSensorData = {
  temperature: 0,
  humidity: 0,
  moisture: 0,
  ph: 0,
  ir: 0,
  season: 'wet'
};

let simulatedTime = new Date();
let basePH = 6.5;

// --------------------------------------------------------
// DEMO SIMULATION (REALISTIC)
// --------------------------------------------------------
function generateRealisticDemoData() {
  simulatedTime = new Date(simulatedTime.getTime() + 3 * 60 * 60 * 1000);
  const hour = simulatedTime.getHours();

  const dayOfYear = Math.floor(simulatedTime.getTime() / (1000 * 60 * 60 * 24));
  const season = (dayOfYear % 180) < 90 ? 'wet' : 'dry';

  const dailyTempVariation = Math.sin((hour - 3) * Math.PI / 12) * 8;

  let temperature = season === 'wet'
    ? 26 + dailyTempVariation + (Math.random() - 0.5) * 2
    : 22 + dailyTempVariation + (Math.random() - 0.5) * 3;

  temperature = Math.round(temperature * 10) / 10;

  let humidity = season === 'wet'
    ? 75 - dailyTempVariation * 2 + (Math.random() - 0.5) * 10
    : 55 - dailyTempVariation * 1.5 + (Math.random() - 0.5) * 15;

  humidity = Math.min(95, Math.max(30, humidity));
  humidity = Math.round(humidity * 10) / 10;

  let moisture = season === 'wet'
    ? 45 + Math.random() * 10
    : 40 + Math.random() * 15;

  if (hour < 6 || hour > 18) moisture += 5;
  if (hour >= 13 && hour <= 16 && season === 'wet') moisture -= 7;

  moisture = Math.min(60, Math.max(35, moisture));
  moisture = Math.round(moisture * 10) / 10;

  basePH += (Math.random() - 0.5) * 0.05;
  basePH = Math.min(7.8, Math.max(5.5, basePH));
  const ph = Math.round(basePH * 10) / 10;

  const isDay = hour >= 6 && hour <= 18;
  let ir = 0;

  if (isDay && Math.random() < 0.98) ir = 1;
  else if (!isDay && Math.random() < 0.94) ir = 0;
  else {
    const dawnDusk = (hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19);
    ir = dawnDusk && Math.random() < 0.4 ? 1 : 0;
  }

  return {
    temperature,
    humidity,
    moisture,
    ph,
    ir,
    season,
    LightStatus: ir ? 'Daylight' : 'Night/Dark',
    timestamp: simulatedTime.toISOString()
  };
}

// --------------------------------------------------------
// SANITIZE PAYLOADS
// --------------------------------------------------------
function sanitizeSensorPayload(payload) {
  const { temperature, humidity, moisture, ph, season, ir } = payload || {};
  return {
    temperature: Number(temperature) || 0,
    humidity: Number(humidity) || 0,
    moisture: Number(moisture) || 0,
    ph: Number(ph) || 0,
    season: (season === 'wet' || season === 'dry') ? season : 'wet',
    ir: ir ? 1 : 0
  };
}

// --------------------------------------------------------
// SSE STREAMING
// --------------------------------------------------------
const sseClients = new Set();

function broadcastSensorUpdate(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) res.write(msg);
}

// --------------------------------------------------------
// ROUTE: POST SENSOR DATA
// --------------------------------------------------------
app.post('/sensors', (req, res) => {
  const sanitized = sanitizeSensorPayload(req.body);

  latestSensorData = {
    ...sanitized,
    LightStatus: sanitized.ir ? 'Daylight' : 'Night/Dark'
  };

  broadcastSensorUpdate(latestSensorData);
  res.json({ status: 'ok', data: latestSensorData });
});

// --------------------------------------------------------
// ROUTE: GET LATEST
// --------------------------------------------------------
app.get('/sensors/latest', (req, res) => {
  if (latestSensorData.temperature === 0) {
    latestSensorData = generateRealisticDemoData();
  }
  res.json(latestSensorData);
});

// --------------------------------------------------------
// ROUTE: STREAM (SSE)
// --------------------------------------------------------
app.get('/sensors/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.flushHeaders?.();
  sseClients.add(res);

  const initial = {
    type: 'init',
    data: latestSensorData.temperature === 0 ? generateRealisticDemoData() : latestSensorData
  };
  res.write(`data: ${JSON.stringify(initial)}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
    res.end();
  });
});

// --------------------------------------------------------
// AI CHAT (Ollama)
// --------------------------------------------------------
app.post('/ai/chat', (req, res) => {
  const { prompt, lang } = req.body; // lang: 'en' or 'np'
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  const data = latestSensorData.temperature === 0
    ? generateRealisticDemoData()
    : latestSensorData;

  const promptNormalized = prompt.trim().toLowerCase();
  let matchedAdvice = '';

  for (const entry of aiDataset) {
    if (entry.question && entry.question.toLowerCase().includes(promptNormalized)) {
      matchedAdvice = (lang === 'np') ? entry.answer_np : entry.answer_en;
      break;
    }
  }

  if (!matchedAdvice) {
    matchedAdvice = (lang === 'np')
      ? "माफ गर्नुहोस्, म यसबारे सल्लाह दिन सक्दिन। माटो, नमी वा बालीका बारेमा सोध्नुहोस्।"
      : "Sorry, I don't have advice for that yet. Try asking about soil, moisture, or crops.";
  }

  // Send to Ollama
  const contextPrompt = `
You are Krishi Chakra, a friendly AI farm assistant providing farmers the best sustainable practices to earn the most from their farm and fully utilize their farmland by seeing and analysing their farm data .

User message:
${prompt}

Farm data:
Temperature: ${data.temperature}
Humidity: ${data.humidity}
Moisture: ${data.moisture}
pH: ${data.ph}

Local advice (from dataset):
${matchedAdvice}

Respond concisely, only what the user asks. Focus on sustainable, locally available, traditional methods. Do not give chemical advice.

`;

  const ollamaPath = "C:\\Users\\NITRO\\AppData\\Local\\Programs\\Ollama\\ollama.exe";
  const child = spawn(ollamaPath, ['run', 'phi3'], { stdio: ['pipe', 'pipe', 'pipe'] });

  let output = '', errorOutput = '';

  child.stdin.write(contextPrompt);
  child.stdin.end();

  child.stdout.on('data', chunk => output += chunk.toString());
  child.stderr.on('data', chunk => errorOutput += chunk.toString());

  child.on('close', code => {
    if (code !== 0) return res.status(500).json({ reply: 'AI model error', errorOutput });
    res.json({ reply: output.trim() });
  });

  child.on('error', () => res.status(500).json({ reply: 'AI model error' }));
});

// --------------------------------------------------------
// ROOT
// --------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Agro Chakra Backend is running!');
});

// --------------------------------------------------------
// SERVER + SIM LOOP
// --------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
setInterval(() => {
  for (const res of sseClients) {
    try {
      res.write(':keep-alive\n\n');
    } catch {
      sseClients.delete(res);
    }
  }
}, 15000);
