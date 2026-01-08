// chartConfig.js
// This file assumes Chart.js is loaded BEFORE it

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('sensorChart');
  if (!canvas) {
    console.error('❌ sensorChart canvas not found');
    return;
  }

  const sensorCtx = canvas.getContext('2d');

  window.sensorChart = new Chart(sensorCtx, {
    type: 'bar',
    data: {
      labels: [
        'Temperature (°C)',
        'Humidity (%)',
        'Moisture (%)',
        'pH',
        'Light',
        'IR'
      ],
      datasets: [{
        label: 'Sensor Values',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#F87171',
          '#A78BFA'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

});

/**
 * Update chart dynamically from sensor data
 * Called from main script
 */
function updateSensorChart(data = {}) {
  if (!window.sensorChart) return;

  window.sensorChart.data.datasets[0].data = [
    data.temperature ?? 0,
    data.humidity ?? 0,
    data.moisture ?? 0,
    data.ph ?? 0,
    data.light ?? 0,
    data.ir ? 1 : 0
  ];

  window.sensorChart.update();
}
