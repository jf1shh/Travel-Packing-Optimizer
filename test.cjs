const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  console.log('Starting preview...');
  const preview = spawn('cmd.exe', ['/c', 'npm run preview -- --port 4173'], { cwd: process.cwd() });
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:4173/Travel-Packing-Optimizer/', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Filling out form...');
    await page.type('input[type="text"]', 'Paris');
    await new Promise(r => setTimeout(r, 1000));
    console.log('Clicking Generate button...');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    console.log('Root length:', rootHtml.length);
    if (rootHtml.trim() === '') console.log('BLANK PAGE ERROR!');
  } catch(e) {
    console.log('Nav error:', e);
  }
  
  await browser.close();
  preview.kill();
  process.exit(0);
})();
