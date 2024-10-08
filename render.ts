import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8000", {
  waitUntil: "networkidle2",
});

const html = await page.content(); // serialized HTML of page DOM.
console.log(html);
await page.screenshot({ path: "example.png" });
await browser.close();
