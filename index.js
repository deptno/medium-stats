const puppeteer = require('puppeteer');
const fs = require('fs')
const [_, __, email, pw, weight = 1] = process.argv
const R = require('ramda')
const ora = require('ora')

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();

  await page.goto('https://medium.com');
  await page.click('.js-signInButton')
  await page.click('.js-buttonLabel')
  await spinner('Sign in', delay(2))
  await page.type('input[type=email]', email)
  await page.click('#identifierNext')
  await spinner('Typing', delay(2))
  await page.type('input[type=password]', pw)
  await page.click('#passwordNext')
  await spinner('Login', delay(5))
  await page.goto('https://medium.com/me/stats');
  page.on('response', download);
  page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))
  await spinner('Fetch', delay(5))
  await browser.close();

  console.log('Done 😇')
});

const download = async response => {
  const url = response.url()
  if (url.includes('@deptno')) {
    console.log("> response: ", url, response.status())
    const text = await response.text()
    const stringifed = text.replace('])}while(1);</x>' , '')
    const json = JSON.parse(stringifed)
    const filename = url.replace('https://medium.com/', '').replace(/[:/?&]/g, '-')
    fs.writeFileSync(filename + '.json', stringifed)
  }
}
const delay = t => new Promise(r => setTimeout(r, t * weight * 1000))
const spinner = R.curryN(2, (message, p) => {
  const spinner = ora(message).start()

  return p
    .then(R.nAry(0, R.bind(spinner.succeed, spinner)))
    .catch(R.nAry(0, R.bind(spinner.fail, spinner)))
})

