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
app.post('/ai/chat', async (req, res) => {
  const { prompt, lang } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  // Latest sensor data
  const data = latestSensorData.temperature === 0
    ? generateRealisticDemoData()
    : latestSensorData;

  // Determine if the user wants a detailed answer
  const isDetailed = /detail|explain|in-depth|full|completely/i.test(prompt);
  const lengthInstruction = isDetailed
    ? "Respond fully in detailed steps, giving examples if needed. Do not cut answers mid-line."
    : "Respond concisely and directly, only what the user asks. dont go in steps or bullets";
  
  const numPredict = isDetailed ? 2500 : 800;

  // Match local advice from dataset
  let matchedAdvice = '';
  const normalized = prompt.toLowerCase();
  for (const entry of aiDataset) {
    if (entry.question && normalized.includes(entry.question.toLowerCase())) {
      matchedAdvice = lang === 'np' ? entry.answer_np : entry.answer_en;
      break;
    }
  }

  // Build the prompt for Ollama
  const contextPrompt = `
You are Krishi Chakra, an organic farm advisor.
No chemicals. Use traditional, local methods only which help the environment and promote sustainable farming.

${lengthInstruction}

Farm Data:
Temp: ${data.temperature}°C
Humidity: ${data.humidity}%
Moisture: ${data.moisture}%
pH: ${data.ph}
Season: ${data.season}

Reference Advice:
${matchedAdvice}

Question:
${prompt}


Do not truncate sentences.
`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3',
        prompt: contextPrompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: numPredict
        }
      })
    });

    const json = await response.json();
    res.json({ reply: json.response });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'AI server error' });
  }
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

 const data = generateRealisticDemoData();
  latestSensorData = data;
  broadcastSensorUpdate(data);


}, 15000);
