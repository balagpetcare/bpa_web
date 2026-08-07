const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('request', req => {
    if (req.url().includes('/holds')) {
      console.log('--- REQUEST TO /holds ---');
      console.log('Payload:', req.postData());
    }
  });
  
  page.on('request', req => {
    if (req.url().includes('/holds')) {
      console.log('--- REQUEST TO /holds ---');
      console.log('Payload:', req.postData());
    }
  });

  await page.goto('http://localhost:3000/spay-neuter/509c1bd7-39b8-4021-8f64-1e3327fb5895/book?service=SPAY', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.textContent.includes('Next'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const selects = document.querySelectorAll('[role="combobox"]');
    if (selects.length > 0) selects[0].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const options = document.querySelectorAll('[role="option"]');
    if (options.length > 0) options[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.textContent.includes('Next') && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const dateBtns = buttons.filter(b => b.textContent.includes('2026') || b.textContent.match(/^[A-Z][a-z]{2},/));
    if (dateBtns.length > 0) dateBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const slotBtns = buttons.filter(b => b.textContent.includes(':'));
    if (slotBtns.length > 0) slotBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.textContent.includes('Next') && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const payBtn = buttons.find(b => b.textContent.includes('Confirm'));
    if (payBtn) payBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Finished script');
  await browser.close();
}
run().catch(console.error);
