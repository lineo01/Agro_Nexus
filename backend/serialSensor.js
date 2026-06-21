import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import axios from 'axios';

const port = new SerialPort({
  path: 'COM5',
  baudRate: 9600,
  autoOpen: false
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.open((err) => {
  if (err) {
    return console.error('Error opening port:', err.message);
  }
  console.log('Listening to Arduino Nano sensor data...');
});

parser.on('data', async (line) => {
  const data = line.trim();

  if (!data.startsWith('{') || !data.endsWith('}')) {
    console.log('Ignoring invalid JSON line:', data);
    return;
  }

  try {
    const sensorData = JSON.parse(data);

    sensorData.moisture = sensorData.moisture ?? Math.floor(Math.random() * 101);
    sensorData.ph = sensorData.ph ?? Math.floor(Math.random()*10+2);
    sensorData.ir = sensorData.ir ?? Math.floor((Math.random()*2));
    sensorData.season = sensorData.season ?? 'wet';
    sensorData.Light = sensorData.Light ?? 'light';

    const response = await axios.post('http://localhost:3000/sensors', sensorData);
    console.log('Data sent to server:', sensorData);

  } catch (err) {
    console.error('Error parsing or sending:', err.message);
    if (err.response) {
      console.error('Server responded with status:', err.response.status);
      console.error(err.response.data);
    } else if (err.request) {
      console.error('No response received from server');
    } else {
      console.error('Other error:', err);
    }
  }
});
