// Test that axios can reach Geoapify (same as Node.js https module but using axios)
require('dotenv').config();
const axios = require('axios');

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || '';
const lat = 6.9271, lng = 79.8450;
const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lng},${lat},3000&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

console.log('Testing axios → Geoapify...');
axios.get(url, { timeout: 10000 })
  .then(res => {
    const names = res.data?.features?.map(f => f.properties?.name).filter(Boolean);
    console.log('✅ STATUS:', res.status, 'COUNT:', res.data?.features?.length);
    console.log('✅ NAMES:', names);
    
    // Also verify .env is loaded
    require('dotenv').config();
    console.log('ENV KEY:', process.env.GEOAPIFY_API_KEY ? '✅ loaded' : '❌ NOT loaded');
  })
  .catch(err => console.error('❌ Axios ERR:', err.message));
