const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE UNCAUGHT ERROR:', err.toString());
  });

  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  } catch (e) {
    console.log('Failed to navigate', e);
  }
  
  await browser.close();
})();
