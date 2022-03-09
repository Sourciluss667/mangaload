const fetch = require('node-fetch')
const config = require('./config.js')
const prompts = require('prompts')
const fs = require('fs')

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const main = async function () {
  console.log('JAPSCAN SCRAPPER FR\nby Sourciluss667\n------------------\n\n')

  // https://www.japscan.co/live-search/ <-- USE THIS TO SEARCH MANGA
  const mangaName = await menu(0)

  const link = `${config.JAPSCAN_URL}/manga/${mangaName}/`

  const res = await fetch(link)
  const html = await res.text()

  const chapters = getChapters(html)
  console.log(`Il y a ${chapters.length} chapitres !\n`)

  const chToDownload = await menu(1, chapters)

  const asyncDownload = await menu(2)

  const browser = await puppeteer.launch({headless: true})

  if (asyncDownload) {
    for (let i = 0; i < chToDownload.length; i++) {
      downloadChapter(mangaName, chToDownload[i], browser)
    }
  } else {
    for (let i = chToDownload.length - 1; i >= 0; i--) {
      await downloadChapter(mangaName, chToDownload[i], browser)
    }
  }

  await new Promise(r => setTimeout(r, 5000));

  let pagesCount = []
  do {
    pagesCount = await browser.pages()
    // console.log(pagesCount.length)
    await new Promise(r => setTimeout(r, 5000));
  } while (pagesCount.length > 1)

  await browser.close()

}

const menu = async function (index, chapters_list = null) {

  let question = {}
  let chlist = []

  if (chapters_list != null) {
    chapters_list.forEach(e => {
      chlist.push({title: e.title, value: e.ch})
    })
  }


  if (index === 0) {
    question = {
      type: 'text',
      name: 'youknow',
      message: 'Quel manga téléchargé ?'
    }
  }
  else if (index === 1) {
    question = [{
      type: 'select',
      name: 'selectChap',
      message: 'Chapitres a téléchargés ?',
      choices: [
        { title: 'Tout téléchargé', value: 'all' },
        { title: 'Selectionné les chapitres', value: 'select' }
      ],
      initial: 1
    },
    {
      type: prev => prev == 'select' ? 'multiselect' : null,
      name: 'youknow',
      message: 'Chapitres a téléchargés ?',
      choices: chlist
    }
    ]
  } else if (index === 2) {
    question = {
      type: 'select',
      name: 'youknow',
      message: 'Téléchargé un par un ?',
      choices: [
        { title: 'Oui', value: false },
        { title: 'Non', value: true }
      ]
    }
  }

  const res = await prompts(question)

  if (index === 1) {
    if (res.selectChap === 'all') {
      res.youknow = []
      for (let i = chapters_list.length - 1; i >= 0; i--) {
        res.youknow.push(chapters_list[i].ch)
      }
    }
  }

  return res.youknow
}

const getChapters = html => {
  let indexStart = html.indexOf('<div id="chapters_list">')
  let indexEnd = html.indexOf('<div id="sidebar" class="col-md-4">')
  // console.log(`start: ${indexStart}\nend: ${indexEnd}\n`)

  const chaptersHtml = html.substring(indexStart, indexEnd)

  let resArray = []
  const offset = 57
  indexStart = 0
  indexEnd = 0

  do {
    indexStart = chaptersHtml.indexOf('<div class="chapters_list text-truncate">', indexEnd)
    indexEnd = chaptersHtml.indexOf('</div>', indexStart)

    // Stop if index not find
    if (indexStart === -1 || indexEnd === -1) break;

    // Chapter block
    const t = chaptersHtml.substring(indexStart, indexEnd)

    // Retrieve title
    let iS = t.indexOf('<a class="text-dark" href="/lecture-en-ligne/') + offset
    let iE = t.indexOf('</a>')
    
    const title = t.substring(iS, iE).replace(/\t/g, '').replace(/\n/g, '').replace(/&#039;/g, '\'')

    // Retrieve link
    iS = t.indexOf('<a class="text-dark" href="') + '<a class="text-dark" href="'.length
    iE = t.indexOf('"', iS)

    const link = config.JAPSCAN_URL + t.substring(iS, iE)

    // Retrieve chapter number
    iS = link.search(/\/([0-9]+)\//g) + 1
    const ch = link.substring(iS, link.length - 1)

    resArray.push({title: title, link: link, ch: ch})

  } while (indexStart != -1 || indexEnd != -1)

  return resArray
}


const downloadChapter = async function (mangaName, chapter, browser, i = -1) {
  try {
    const link = `${config.JAPSCAN_URL}/lecture-en-ligne/${mangaName}/${chapter}/`
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
  // console.log(`start: ${indexStart}\nend: ${indexEnd}\n`)

  const pageCount = parseInt(html.substring(s + '<p><span class="font-weight-bold">Nombre De Pages</span>: '.length, e))

  console.log('\nDownload chapter ' + chapter + ' start !\n')

  const page = await browser.newPage()
  await page.setViewport({width: 3840, height: 16000})
  await page.setDefaultNavigationTimeout(0)

  for (let i = 1; i <= pageCount; i++) {
    
    await page.goto(`${link}${i}.html`, {waitUntil: 'load'})

    await page.waitForSelector('#image')
    const image = await page.$('#image')
    const box = await image.boundingBox()

    const x = box['x']
    const y = box['y']
    const w = box['width']
    const h = box['height']

    await page.screenshot({'path': `${path}/${i}.png`, 'clip': {'x': x, 'y': y, 'width': w, 'height': h}})

    // console.log(`Page ${i} / ${pageCount} du chapitre ${chapter} téléchargé !\n`)
    process.stdout.write('Page ' + i + ' / ' + pageCount + ' du chapitre ' + chapter + ' téléchargé !\033[0G')
  }

  await page.close()

  console.log('\n\x1b[32mDownload Chapter ' + chapter + ' FINISH !\x1b[0m\n----------------------------\n\n')
  } catch (e) {
    console.log('\x1b[31mError download chapter ' + chapter + ' !\x1b[0m')
    console.error(e)
  }
}

main()
