// ==== script.js ====

// ======================
// Global state
// ======================
let latestData = {}; // sensor data store
let currentLanguage = 'en'; // default language

// ======================
// DOM elements
// ======================
const alertsList = document.getElementById('alerts-list');
const farmDesc = document.getElementById('farm-desc');
const bestCropsList = document.getElementById('best-crops');
const aiTipsList = document.getElementById('ai-tips');
const plantHealth = document.getElementById('plant-health');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('sendBtn');

const SENSOR_URL = 'http://localhost:3000/sensors/latest';
const AI_CHAT_URL = 'http://localhost:3000/ai/chat';

// ======================
// Chart.js Setup
// ======================
const ctx = document.getElementById('sensorChart').getContext('2d');
const sensorChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Temperature', 'Humidity', 'Moisture', 'pH', 'IR'],
    datasets: [{
      label: 'Sensor Values',
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Helper to update chart
function updateSensorChart(data) {
  sensorChart.data.datasets[0].data = [
    data.temperature ?? 0,
    data.humidity ?? 0,
    data.moisture ?? 0,
    data.ph ?? 0,
    data.ir ? 1 : 0
  ];
  sensorChart.update();
}

// ======================
// Translation mappings
// ======================
const plantHealthStatus = {
  en: { good: 'Good ✅', bad: 'Attention ⚠️' },
  np: { good: 'राम्रै छ ✅', bad: 'ध्यान दिनुहोस् ⚠️' }
};

const cropNames = {
  en: { Rice:'Rice', Corn:'Corn', Beans:'Beans', Marigold:'Marigold', Mushroom:'Mushroom', Lentils:'Lentils', Millets:'Millets' },
  np: { Rice:'धान', Corn:'मकै', Beans:'सिमी', Marigold:'सयपत्री', Mushroom:'च्याउ', Lentils:'दाल', Millets:'कोदो' }
};

const aiTipsText = {
  en: { moisture:'Apply mulch to retain moisture.', ph:'Add lime to adjust pH.', temperature:'Provide shade or irrigation.' },
  np: { moisture:'भुमि सुख्खा छ। मल्चिंग गर्नुहोस्।', ph:'माटो अमिलो छ। चुना हाल्नुहोस्।', temperature:'तापक्रम उच्च छ। छाँया वा सिंचाइ गर्नुहोस्।' }
};

const alertsText = {
  en: { moisture:'💧 Soil moisture low!', ph:'⚠️ pH out of range!', temperature:'🌡️ Temperature high!' },
  np: { moisture:'💧 भुमि सुख्खा छ!', ph:'⚠️ pH असामान्य छ!', temperature:'🌡️ तापक्रम धेरै छ!' }
};

// ======================
// Fetch sensor data
// ======================
async function fetchSensorData() {
  try {
    const res = await fetch(SENSOR_URL);
    const data = await res.json();
    latestData = data;

    updateSensorChart(data);

    // Alerts
    alertsList.innerHTML = '';
    if (data.moisture < 35) alertsList.innerHTML += `<li>${alertsText[currentLanguage].moisture}</li>`;
    if (data.ph < 6 || data.ph > 7.5) alertsList.innerHTML += `<li>${alertsText[currentLanguage].ph}</li>`;
    if (data.temperature > 34) alertsList.innerHTML += `<li>${alertsText[currentLanguage].temperature}</li>`;

    // Plant health dynamic
    plantHealth.textContent = plantHealthStatus[currentLanguage][
      (data.moisture > 35 && data.ph >= 6 && data.ph <= 7.5) ? 'good' : 'bad'
    ];

    // Best crops dynamic
    bestCropsList.innerHTML = '';
    const crops = data.season === 'wet'
      ? ['Rice', 'Corn', 'Beans', 'Marigold']
      : ['Mushroom', 'Lentils', 'Millets'];
    crops.forEach(c => {
      const li = document.createElement('li');
      li.innerText = cropNames[currentLanguage][c];
      bestCropsList.appendChild(li);
    });

    // AI tips
    aiTipsList.innerHTML = '';
    if (data.moisture < 35) aiTipsList.innerHTML += `<li>${aiTipsText[currentLanguage].moisture}</li>`;
    if (data.ph < 6) aiTipsList.innerHTML += `<li>${aiTipsText[currentLanguage].ph}</li>`;
    if (data.temperature > 34) aiTipsList.innerHTML += `<li>${aiTipsText[currentLanguage].temperature}</li>`;

    // Farm description
    farmDesc.innerHTML = `
      <strong>Current Season:</strong> ${data.season}<br>
      <strong>Temperature:</strong> ${data.temperature}°C<br>
      <strong>Humidity:</strong> ${data.humidity}%<br>
      <strong>Moisture:</strong> ${data.moisture}%<br>
      <strong>pH:</strong> ${data.ph}<br>
      <strong>Light:</strong> ${data.LightStatus?? 'N/A'}<br>
      <strong>IR Sensor:</strong> ${data.ir ? (currentLanguage==='np'?'वस्तु पत्ता लाग्यो':'Object Detected') : (currentLanguage==='np'?'वस्तु छैन':'No Object')}
    `;
  } catch (err) { console.error(err); }
}


setInterval(fetchSensorData, 5000);
fetchSensorData();



// ======================
// AI Chat
// ======================
async function sendChat() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // Show user message
  chatBox.innerHTML += `<div class="user-msg">You: ${prompt}</div>`;
  userInput.value = '';

  const data = latestData;
  const farmKeywords = ['farm', 'crop', 'soil', 'moisture', 'ph', 'temperature', 'humidity'];
  const includeFarmData = farmKeywords.some(k => prompt.toLowerCase().includes(k));

  const contextPrompt = `
You are Krishi Chakra, a human-like professional AI assistant.
- Talk like a human, friendly and polite.
- Respond in ${currentLanguage === 'np' ? 'Nepali' : 'English'}.
- Only give farming advice if asked (otherwise casual conversation).

${includeFarmData ? `
Farm data (show only if requested, in points):
- Temperature: ${data.temperature}°C
- Humidity: ${data.humidity}%
- Moisture: ${data.moisture}%
- pH: ${data.ph}
- IR Sensor: ${data.ir ? 'Object detected' : 'No object'}
- Season: ${data.season}` : ''}

User message: ${prompt}

Instructions:
- Use bullet points for advice.
- Keep answers short and readable.
- Avoid unnecessary huge dumps of data.
`;

  // Show "thinking..." message
  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'ai-msg';
  thinkingMsg.textContent = 'Krishi Chakra is thinking... 🤔';
  chatBox.appendChild(thinkingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Force DOM update before fetch
  await new Promise(resolve => requestAnimationFrame(resolve));

  try {
    const res = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: contextPrompt, language: currentLanguage })
    });
    const aiData = await res.json();

    // Replace "thinking..." with actual response
    thinkingMsg.textContent = `Krishi Chakra: ${aiData.reply}`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    thinkingMsg.textContent = 'Krishi Chakra: ❌ Error connecting to AI.';
    console.error('Error fetching AI response:', err);
  }
}




sendBtn.addEventListener('click', sendChat);
userInput.addEventListener('keydown', e => { if(e.key==='Enter') sendChat(); });

// ======================
// Yield Calculator
// ======================
function calculateYield() {
  const crop = document.getElementById('cropInput').value;
  const area = parseFloat(document.getElementById('farmArea').value);
  const resultEl = document.getElementById('yieldResult');

  if (!crop || !area || area <= 0) { resultEl.textContent = currentLanguage==='np'?'मान्य बाली र क्षेत्र प्रविष्ट गर्नुहोस्':'Enter valid crop & area'; return; }

  const baseYield = { Rice:2500, Corn:2000, Beans:1500, Marigold:1800, Mushroom:1200, Lentils:1300, Millets:1400 };
  const cropYield = baseYield[crop] || 1000;

  let moistureFactor=1, phFactor=1, tempFactor=1;
  if(latestData.moisture<35) moistureFactor=0.8;
  if(latestData.ph<6 || latestData.ph>7.5) phFactor=0.85;
  if(latestData.temperature<15 || latestData.temperature>34) tempFactor=0.9;

  let estimatedYield = Math.floor(cropYield*area*moistureFactor*phFactor*tempFactor);
  resultEl.textContent = `${currentLanguage==='np'?'अनुमानित उपज':'Estimated yield'}: ${estimatedYield} kg`;

  if(moistureFactor<1) resultEl.textContent += currentLanguage==='np'?' ⚠️ सिंचाइ गर्नुहोस्':' ⚠️ Consider irrigation';
  if(phFactor<1) resultEl.textContent += currentLanguage==='np'?' ⚠️ माटो सुधार गर्नुहोस्':' ⚠️ Consider soil amendment';
  if(tempFactor<1) resultEl.textContent += currentLanguage==='np'?' ⚠️ तापक्रमले उपज प्रभावित गर्न सक्छ':' ⚠️ Temperature may affect yield';
}

document.getElementById('calculateYieldBtn').addEventListener('click', calculateYield);

// ======================
// Dark/Light Mode
// ======================
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});

// ======================
// Language Toggle
// ======================
const languageToggle = document.getElementById('languageToggle');
languageToggle.addEventListener('change', () => {
  currentLanguage = languageToggle.value;
  updateLanguage(currentLanguage);
});

function updateLanguage(lang) {
  const t = {
    en: {
      sensor:"📊 Sensor Data",
      farmMap:"3D Farm Map",
      yield:"Yield Calculator",
      aiChat:"AI Chat & Alerts",
      plantHealth:"🌱 Plant Health Status",
      bestCrops:"🌾 Best Crops",
      aiTips:"💡 Quick AI Tips",
      alerts:"🔔 Alerts",
      farmSummary:"📝 Farm Summary",
      cropPlaceholder:"Enter Crop Name",
      areaPlaceholder:"Farm Area in Acres",
      calculateBtn:"Calculate Yield",
      userInput:"Ask AI about your farm..."
    },
    np: {
      sensor:"📊 सेन्सर डेटा",
      farmMap:"३डी फार्म नक्शा",
      yield:"उपज गणक",
      aiChat:"एआई कुरा र सूचनाहरू",
      plantHealth:"🌱 बिरुवा स्वास्थ्य स्थिति",
      bestCrops:"🌾 उत्तम बालीहरू",
      aiTips:"💡 छिटो एआई सुझावहरू",
      alerts:"🔔 चेतावनीहरू",
      farmSummary:"📝 फार्म सारांश",
      cropPlaceholder:"बालीको नाम चयन गर्नुहोस्",
      areaPlaceholder:"फार्म क्षेत्र (एकरमा)",
      calculateBtn:"उपज गणना गर्नुहोस्",
      userInput:"तपाईंको फार्मको बारेमा एआईसँग सोध्नुहोस्..."
    }
  };

  document.querySelector('#sensorChart').previousElementSibling.textContent = t[lang].sensor;
  document.querySelector('#mapContainer').previousElementSibling.textContent = t[lang].farmMap;
  document.getElementById('calculateYieldBtn').textContent = t[lang].calculateBtn;
  document.getElementById('user-input').placeholder = t[lang].userInput;
  document.getElementById('cropInput').placeholder = t[lang].cropPlaceholder;
  document.getElementById('farmArea').placeholder = t[lang].areaPlaceholder;

  const cards = document.querySelectorAll('.right-panel .card h2');
  cards[0].textContent = t[lang].aiChat;
  cards[1].textContent = t[lang].plantHealth;
  cards[2].textContent = t[lang].bestCrops;
  cards[3].textContent = t[lang].aiTips;
  cards[4].textContent = t[lang].alerts;
  cards[5].textContent = t[lang].farmSummary;

  // Refresh dynamic UI (plant health, best crops, alerts) in the selected language
  fetchSensorData();
}


