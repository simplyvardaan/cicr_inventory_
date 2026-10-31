const fs = require('fs');

async function scrape() {
  const res = await fetch('https://cicr-inventory.vercel.app/');
  const html = await res.text();
  fs.writeFileSync('scripts/page.html', html);
  console.log('Saved page.html, size:', html.length);

  // Search for JS bundles or APIs
  const scriptRegex = /<script[^>]*src=["']([^"']+)["']/g;
  let match;
  const scripts = [];
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  console.log('Scripts found:', scripts);

  for (const src of scripts) {
    const fullUrl = src.startsWith('http') ? src : new URL(src, 'https://cicr-inventory.vercel.app/').href;
    console.log('Fetching script:', fullUrl);
    try {
      const sRes = await fetch(fullUrl);
      const js = await sRes.text();
      console.log(`Script ${src} size: ${js.length}`);
      if (js.includes('Arduino') || js.includes('sensors') || js.includes('inventory') || js.includes('components')) {
        console.log(`Script ${src} contains keywords!`);
        fs.writeFileSync(`scripts/${src.replace(/[^a-zA-Z0-9]/g, '_')}.js`, js);
      }
    } catch (e) {
      console.error('Error fetching script', src, e.message);
    }
  }
}

scrape().catch(console.error);

