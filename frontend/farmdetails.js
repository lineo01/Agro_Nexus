// Predefined data for each region/district
const farmDatabase = {
  terai: {
    chitwan: { soil: "Loamy", weather: "Sunny, 28°C", crops: "Rice, Maize, Vegetables" },
    dang: { soil: "Clay Loam", weather: "Moderate, 26°C", crops: "Wheat, Maize, Sugarcane" },
    biratnagar: { soil: "Sandy Loam", weather: "Hot, 30°C", crops: "Rice, Sugarcane, Maize" },
    butwal: { soil: "Loamy", weather: "Warm, 27°C", crops: "Rice, Vegetables, Maize" }
  },
  hills: {
    kathmandu: { soil: "Silt Loam", weather: "Moderate, 23°C", crops: "Vegetables, Maize, Wheat" },
    pokhara: { soil: "Silty Clay", weather: "Moderate, 22°C", crops: "Maize, Millet, Vegetables" },
    kaski: { soil: "Sandy Loam", weather: "Cool, 22°C", crops: "Potato, Maize, Vegetables" },
    lamjung: { soil: "Silt Loam", weather: "Cool, 20°C", crops: "Maize, Millet, Vegetables" },
    bhaktapur: { soil: "Loamy", weather: "Moderate, 23°C", crops: "Vegetables, Wheat, Maize" },
    lalitpur: { soil: "Silty Clay", weather: "Moderate, 23°C", crops: "Vegetables, Wheat, Maize" }
  },
  mountains: {
    mustang: { soil: "Rocky Loam", weather: "Cold, 15°C", crops: "Barley, Buckwheat, Potato" },
    taplejung: { soil: "Silty Clay", weather: "Cold, 18°C", crops: "Maize, Millet, Vegetables" },
    jumla: { soil: "Sandy Loam", weather: "Cold, 16°C", crops: "Barley, Potato, Buckwheat" },
    dolpa: { soil: "Rocky Loam", weather: "Cold, 14°C", crops: "Buckwheat, Barley, Potato" },
    manang: { soil: "Silty Clay", weather: "Cold, 12°C", crops: "Potato, Barley, Millet" }
  }
};


// DOM elements
const regionSelect = document.getElementById("regionSelect");
const districtSelect = document.getElementById("districtSelect");
const soilField = document.getElementById("soilTypeDetail");
const weatherField = document.getElementById("weather");
const cropsField = document.getElementById("recommendedCrops");

// Populate districts based on region
regionSelect.addEventListener("change", () => {
  const region = regionSelect.value;
  districtSelect.innerHTML = "<option value=''>Select District</option>"; // Reset

  if (region && farmDatabase[region]) {
    Object.keys(farmDatabase[region]).forEach(district => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district.charAt(0).toUpperCase() + district.slice(1);
      districtSelect.appendChild(option);
    });
  }

  // Clear details if region changes
  soilField.textContent = "-";
  weatherField.textContent = "-";
  cropsField.textContent = "-";
});

// Populate farm details based on district
districtSelect.addEventListener("change", () => {
  const region = regionSelect.value;
  const district = districtSelect.value;

  if (region && district && farmDatabase[region][district]) {
    const data = farmDatabase[region][district];
    soilField.textContent = data.soil;
    weatherField.textContent = data.weather;
    cropsField.textContent = data.crops;
  } else {
    soilField.textContent = "-";
    weatherField.textContent = "-";
    cropsField.textContent = "-";
  }
});
