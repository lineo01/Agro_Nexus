/*******************************
 * GLOBAL STATE
 *******************************/
let latestData = {};
let currentLanguage = 'en';

/*******************************
 * DOM ELEMENTS
 *******************************/
const alertsList = document.getElementById('alerts-list');
const farmDesc = document.getElementById('farm-desc');
const bestCropsList = document.getElementById('best-crops');
const aiTipsList = document.getElementById('ai-tips');
const plantHealth = document.getElementById('plant-health');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('sendBtn');
const languageToggle = document.getElementById('languageToggle');
const darkModeToggle = document.getElementById('darkModeToggle');

const SENSOR_URL = 'http://localhost:3000/sensors/latest';
const AI_CHAT_URL = 'http://localhost:3000/ai/chat';

async function fetchSensorData() {
  try {
    const res = await fetch(SENSOR_URL);
    latestData = await res.json();

    // update the UI
    renderDynamicContent();

    // ✅ update the chart
    if (typeof updateSensorChart === 'function') {
      updateSensorChart({
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        moisture: latestData.moisture,
        ph: latestData.ph,
        light: latestData.light ?? 0,
        ir: latestData.ir ?? 0
      });
    }

  } catch (err) {
    console.error('Sensor fetch failed', err);
  }
}



setInterval(fetchSensorData, 10000);
fetchSensorData();


function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  }[m]));
}


async function sendChat() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  chatBox.innerHTML += `<div class="user-msg">You: ${escapeHTML(prompt)}</div>`;
  userInput.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        lang: currentLanguage
      })
    });

    const data = await res.json();

    chatBox.innerHTML += `<div class="ai-msg">Krishi Chakra: ${escapeHTML(data.reply)}</div>`;
  } catch (err) {
    console.error(err);
    chatBox.innerHTML += `<div class="ai-msg">❌ AI connection failed</div>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', sendChat);
userInput.addEventListener('keydown', e => e.key === 'Enter' && sendChat());

function calculateYield() {
  const crop = document.getElementById('cropInput').value;
  const area = parseFloat(document.getElementById('farmArea').value);
  const resultEl = document.getElementById('yieldResult');

  if (!crop || area <= 0) {
    resultEl.textContent =
      currentLanguage === 'np'
        ? "कृपया सही विवरण प्रविष्ट गर्नुहोस्।"
        : "Enter valid crop and area.";
    return;
  }

  const baseYield = {
    Rice: 2500, Corn: 2000, Beans: 1500, Marigold: 1800,
    Mushroom: 1200, Lentils: 1300, Millets: 1400,
    Wheat: 2200, Potato: 2400, Grams: 1600
  };

  let factor = 1;
  if (latestData.moisture < 35) factor *= 0.8;
  if (latestData.ph < 6 || latestData.ph > 7.5) factor *= 0.85;
  if (latestData.temperature < 15 || latestData.temperature > 34) factor *= 0.9;

  const yieldKg = Math.floor((baseYield[crop] || 1000) * area * factor);

  resultEl.textContent =
    currentLanguage === 'np'
      ? `${crop} का लागि ${area} एकरमा अनुमानित उपज: ${yieldKg} केजी`
      : `Estimated yield for ${crop} on ${area} acres: ${yieldKg} kg`;
}

document.getElementById('calculateYieldBtn')
  .addEventListener('click', calculateYield);

/*******************************
 * DARK MODE
 *******************************/
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});

/*******************************
 * TRANSLATIONS
 *******************************/
const t = {
  en: {
    plantGood: "Good ✅",
    plantBad: "Attention ⚠️",
    noCrops: "No suitable crops"
  },
  np: {
    plantGood: "राम्रो ✅",
    plantBad: "सावधानी ⚠️",
    noCrops: "उपयुक्त बाली भेटिएन"
  }
};

const cropRules = {
  Rice: { moisture: 50, ph: [5.5, 7.5], temp: [20, 35] },
  Corn: { moisture: 40, ph: [5.8, 7], temp: [18, 32] },
  Beans: { moisture: 35, ph: [6, 7.5], temp: [16, 30] },
  Mushroom: { moisture: 60, ph: [5.5, 7], temp: [15, 28] },
  Lentils: { moisture: 25, ph: [6, 7.5], temp: [15, 30] },
  Millets: { moisture: 20, ph: [5.5, 7.5], temp: [20, 35] },
  Wheat: { moisture: 30, ph: [6, 7.5], temp: [15, 25] },
  Potato: { moisture: 35, ph: [5.5, 7], temp: [15, 25] },
  Grams: { moisture: 25, ph: [6, 7.5], temp: [18, 30] }
};

function renderDynamicContent() {
  if (!latestData || !latestData.moisture) return;

  // AI Tips
  aiTipsList.innerHTML = '';
  if (latestData.moisture < 35) aiTipsList.innerHTML += `<li>💧 Improve irrigation</li>`;
  if (latestData.ph < 6) aiTipsList.innerHTML += `<li>⚠️ Adjust soil pH</li>`;
  if (latestData.temperature > 34) aiTipsList.innerHTML += `<li>🌡️ Heat stress risk</li>`;

  // Alerts
  alertsList.innerHTML = '';
  if (latestData.moisture < 35) alertsList.innerHTML += `<li>Low moisture</li>`;
  if (latestData.ph < 6 || latestData.ph > 7.5) alertsList.innerHTML += `<li>pH out of range</li>`;

  // Best Crops
  bestCropsList.innerHTML = '';
  const suitable = Object.keys(cropRules).filter(c => {
    const r = cropRules[c];
    return (
      latestData.moisture >= r.moisture &&
      latestData.ph >= r.ph[0] &&
      latestData.ph <= r.ph[1] &&
      latestData.temperature >= r.temp[0] &&
      latestData.temperature <= r.temp[1]
    );
  });

  if (!suitable.length) {
    bestCropsList.innerHTML = `<li>${t[currentLanguage].noCrops}</li>`;
  } else {
    suitable.forEach(c => bestCropsList.innerHTML += `<li>${c}</li>`);
  }

  // Plant Health
  const healthy =
    latestData.moisture > 35 &&
    latestData.ph >= 6 &&
    latestData.ph <= 7.5 &&
    latestData.temperature >= 15 &&
    latestData.temperature <= 34;

  plantHealth.textContent =
    healthy ? t[currentLanguage].plantGood : t[currentLanguage].plantBad;

  // Farm Summary
  farmDesc.innerHTML = `
    Temp: ${latestData.temperature}°C<br>
    Humidity: ${latestData.humidity}%<br>
    Moisture: ${latestData.moisture}%<br>
    pH: ${latestData.ph}<br>
    Season: ${latestData.season}
  `;
}

languageToggle.addEventListener('change', () => {
  currentLanguage = languageToggle.value;
  renderDynamicContent();
});
/*******************************
 * PLANT AI MODAL SAFE HANDLER
 *******************************/



// OPEN MODAL
const plantBtn = document.getElementById("plantAiBtn");
const plantModal = document.getElementById("plantAiModal");

if (plantBtn && plantModal) {
  plantBtn.onclick = () => {
    plantModal.classList.remove("hidden");
  };

  // CLOSE ON OUTSIDE CLICK
  plantModal.onclick = (e) => {
    if (e.target.id === "plantAiModal") {
      plantModal.classList.add("hidden");
    }
  };
}

// IMAGE PREVIEW
const imageInput = document.getElementById("imageInput");
const previewImg = document.getElementById("previewImg");

if (imageInput) {
  imageInput.onchange = () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
}

// PREDICT
const predictBtn = document.getElementById("predictBtn");

if (predictBtn) {
  predictBtn.onclick = async () => {
    const file = imageInput?.files?.[0];
    if (!file) return alert("Upload image first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      document.getElementById("resultImg").src = previewImg.src;
      document.getElementById("diseaseName").innerText = data.disease || "Unknown";
      document.getElementById("confidenceText").innerText =
        "Confidence: " + ((data.confidence || 0) * 100).toFixed(2) + "%";

      document.getElementById("treatmentBox").innerHTML = `
        <h4>Treatment</h4>
        <p>${data.info || "Remove infected leaves and apply organic fungicide."}</p>
      `;
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Check backend."+err);
    }
  };
}