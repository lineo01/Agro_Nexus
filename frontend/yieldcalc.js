// ==== yieldCalc.js ====
const calculateBtn = document.getElementById('calculateYieldBtn');

calculateBtn.addEventListener('click', () => {
  const crop = document.getElementById('cropInput').value.trim();
  const area = parseFloat(document.getElementById('farmArea').value);
  const soil = document.getElementById('soilType').value;
  const rainfall = parseFloat(document.getElementById('expectedRain').value);
  const fertilizer = parseFloat(document.getElementById('fertilizer').value);

  if (!crop || isNaN(area) || isNaN(rainfall) || isNaN(fertilizer)) {
    document.getElementById('yieldResult').textContent = '❌ Please fill all fields correctly.';
    return;
  }

  // Base yield per acre (example values, can be updated per crop)
  let baseYieldPerAcre = 500; // kg
  switch (crop.toLowerCase()) {
    case 'rice': baseYieldPerAcre = 600; break;
    case 'corn': baseYieldPerAcre = 550; break;
    case 'wheat': baseYieldPerAcre = 500; break;
    case 'beans': baseYieldPerAcre = 400; break;
    default: baseYieldPerAcre = 450; break;
  }

  // Soil factor
  let soilFactor = 1;
  if (soil === 'clay') soilFactor = 0.9;
  if (soil === 'sandy') soilFactor = 0.8;
  if (soil === 'silt') soilFactor = 1.05;

  // Rainfall factor
  let rainFactor = 1;
  if (rainfall < 200) rainFactor = 0.85;
  else if (rainfall > 500) rainFactor = 1.1;

  // Fertilizer factor
  let fertFactor = 1 + (fertilizer / 1000); // simple proportionality

  const estimatedYield = Math.floor(baseYieldPerAcre * area * soilFactor * rainFactor * fertFactor);

  document.getElementById('yieldResult').innerHTML = `
    ✅ Estimated Yield for ${crop}: <strong>${estimatedYield} kg</strong> for ${area} acres.
  `;
});
