const fetch = require('node-fetch')
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

let downloading = []

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function startDownload (req, res) {
  const info = req.body

  downloading.push({name: info.name, chapters: info.chapters, status: []})

  const browser = await puppeteer.launch({headless: true})

  for (let i = info.chapters.length - 1; i >= 0; i--) {
    downloadChapter(info.name, info.chapters[i], browser)
  }

  res.sendStatus(200)
}

async function downloadChapter (mangaName, chapter, browser, i = -1) {
  try {
  const link = `https://www.japscan.co/lecture-en-ligne/${mangaName}/${chapter}/`
  const path = `downloads/${mangaName}/ch${chapter}`

  if (!fs.existsSync('downloads')) {
    fs.mkdirSync('downloads')
  }
  if (!fs.existsSync(`downloads/${mangaName}`)) {
    fs.mkdirSync(`downloads/${mangaName}`)
  }
  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }

  const res = await fetch(`${link}1.html`)
  const html = await res.text()

  let s = html.indexOf('<p><span class="font-weight-bold">Nombre De Pages</span>: ')
  let e = html.indexOf('</p>', s)

  const pageCount = parseInt(html.substring(s + '<p><span class="font-weight-bold">Nombre De Pages</span>: '.length, e))

  for (let i = 0; i < downloading.length; i++) {
    if (downloading[i].name === mangaName) {
      downloading[i].status.push({chapter: chapter, pageCount: pageCount, lastPageDownloaded: 0, error: false})
    }
  }

  const page = await browser.newPage()
  await page.setViewport({width: 3840, height: 16000})
  await page.setDefaultNavigationTimeout(0)

  for (let i = 1; i <= pageCount; i++) {
    await retry(`downloadPage${i}`, 3, () => downloadPage(pmangaName, chapter, page, link, path, i))
  }
  // Chapter finish download
  await page.close()
  downloading.forEach(e => {
    if (e.name === mangaName) {
      const index = e.chapters.indexOf(chapter)
      e.chapters.splice(index, 1)
    }
  })

  } catch (e) {
    for (let k = 0; k < downloading.length; k++) {
      if (downloading[k].name === mangaName) {
        for (let j = 0; j < downloading[k].status.length; j++) {
          if (downloading[k].status[j].chapter === chapter) {
            downloading[k].status[j].error = true
          }
        }
      }
    }
    console.log('\n\x1b[31mError download chapter ' + chapter + ' !\x1b[0m\n')
    console.error(e)
    throw new Error('Error in download !!!!!')
  }
}

async function downloadPage (mangaName, chapter, page, link, path, i) {
  await retry(`${link}${i}.html`, 3, () => page.goto(`${link}${i}.html`, {waitUntil: 'networkidle0', timeout: 10000}))

  await page.waitForSelector('#image')
  const image = await page.$('#image')
  const box = await image.boundingBox()

  const x = box['x']
  const y = box['y']
  const w = box['width']
  const h = box['height']

  await page.screenshot({'path': `${path}/${i}.png`, 'clip': {'x': x, 'y': y, 'width': w, 'height': h}})

  for (let k = 0; k < downloading.length; k++) {
    if (downloading[k].name === mangaName) {
      for (let j = 0; j < downloading[k].status.length; j++) {
        if (downloading[k].status[j].chapter === chapter) {
          downloading[k].status[j].lastPageDownloaded = i
        }
      }
    }
  }
}

async function retry (name, maxRetries, fn) {
  console.log('fn is')
  console.log(fn)
  return await fn().catch(async function(err) { 
    if (maxRetries <= 0) {
      console.log('error loading page after 3 retries !!')
      throw err
    }
    console.log('Retry ' + name + '!')
    await new Promise(r => setTimeout(r, 10000));
    return retry(maxRetries - 1, fn)
  })
}

module.exports = {startDownload, downloading}
