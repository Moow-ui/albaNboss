const https = require('https');

const candidates = [
  'https://www.youtube.com/watch?v=HRTrJK5b8Ow',
  'https://www.youtube.com/watch?v=ZiyjkGs1YnY',
  'https://www.youtube.com/watch?v=RViHJWO5H_Y'
];

async function checkDetails() {
  for (const url of candidates) {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    https.get(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${b}\n`);
      });
    });
  }
}

checkDetails();
