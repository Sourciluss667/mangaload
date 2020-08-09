const fetch = require('node-fetch')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getChapters (req, res) {
  const name = req.params.name
  const link = `https://www.japscan.co/manga/${name}/`

  const response = await fetch(link)
  const html = await response.text()

  let indexStart = html.indexOf('<div id="chapters_list">')
  let indexEnd = html.indexOf('<div id="sidebar" class="col-md-4">')

  const chaptersHtml = html.substring(indexStart, indexEnd)

  let chapters = []
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
    let iS = t.indexOf('<a class="text-dark" href="/lecture-en-ligne/')
    iS = t.indexOf('">', iS) + 2
    let iE = t.indexOf('</a>')
    
    const title = t.substring(iS, iE).replace(/\t/g, '').replace(/\n/g, '').replace(/&#039;/g, '\'')

    // Retrieve link
    iS = t.indexOf('<a class="text-dark" href="') + '<a class="text-dark" href="'.length
    iE = t.indexOf('"', iS)

    const link = 'https://www.japscan.co' + t.substring(iS, iE)

    // Check if VOLUME or CHAPTER
    if (link.search('/volume-') !== -1) {
      // It's a volume
      iS = link.search(/\/volume-([0-9]+)\//g) + 1
    } else {
      // It's a chapter
      iS = link.search(/\/([0-9]+)\//g) + 1
    }

    // Retrieve chapter number
    const ch = link.substring(iS, link.length - 1)

    chapters.push({title: title, link: link, ch: ch})

  } while (indexStart != -1 || indexEnd != -1)

  res.json(chapters)
}

module.exports = getChapters
