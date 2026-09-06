const https = require('https');

// Test 1: Overpass API
console.log('Testing Overpass API...');
const query = '[out:json];node(around:2000,6.9271,79.8450)["amenity"="restaurant"];out body 2;';
const url1 = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

const req1 = https.get(url1, { timeout: 8000 }, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(d);
      console.log('Overpass OK! Elements:', json.elements?.length);
    } catch(e) {
      console.log('Overpass OK! Status:', res.statusCode, 'Len:', d.length);
    }
  });
});
req1.on('error', e => console.error('Overpass ERR:', e.message));
req1.on('timeout', () => { req1.destroy(); console.error('Overpass TIMEOUT'); });
req1.setTimeout(8000);

// Test 2: Geoapify
console.log('Testing Geoapify API...');
const req2 = https.get('https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:79.8450,6.9271,2000&limit=2&apiKey=INVALID_KEY', { timeout: 8000 }, (res) => {
  console.log('Geoapify reach! Status:', res.statusCode, '(401=key invalid, 200=ok)');
});
req2.on('error', e => console.error('Geoapify ERR:', e.message));
req2.on('timeout', () => { req2.destroy(); console.error('Geoapify TIMEOUT'); });
req2.setTimeout(8000);
