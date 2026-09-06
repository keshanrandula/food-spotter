require('dotenv').config();
const https = require('https');

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || '';
const lat = 6.9271, lng = 79.8450;
const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lng},${lat},3000&bias=proximity:${lng},${lat}&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

console.log('Testing Geoapify Places URL:', url);
const req = https.get(url, { timeout: 12000 }, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(d);
      const names = json.features?.map(f => f.properties?.name).filter(Boolean);
      console.log('✅ STATUS:', res.statusCode);
      console.log('✅ COUNT:', json.features?.length);
      console.log('✅ NAMES:', names);
    } catch(e) {
      console.log('Parse error, raw:', d.slice(0, 500));
    }
  });
});
req.on('error', e => console.error('❌ ERR:', e.message));
req.setTimeout(12000, () => { req.destroy(); console.error('❌ TIMEOUT'); });
