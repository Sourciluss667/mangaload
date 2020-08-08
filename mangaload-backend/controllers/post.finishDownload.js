const fs = require('fs')
const archiver = require('archiver')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function postDownload (req, res) {
  // name, chapters
  const info = req.body

  let waitArchive = true
  const fileName = info.name + '-' + Math.floor(Math.random() * 1001)
  const pathFile = 'archives/' + fileName + '.zip'

  if (!fs.existsSync('archives')) {
    fs.mkdirSync('archives')
  }

  const output = fs.createWriteStream(pathFile)
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })

  output.on('close', function () {
    waitArchive = false
  })

  archive.on('error', function(err){
    res.sendStatus(500)
    throw err
  })

  archive.pipe(output)

  // UTILISER info.chapters POUR SELECT LES BONS CHAPITRES !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  info.chapters.forEach(e => {
    archive.directory(`downloads/${info.name}/ch${e}/`, `ch${e}`)
  })
  
  archive.finalize()

  while (waitArchive) {
    await new Promise(r => setTimeout(r, 1000));
  }
  
  res.json({fileName: fileName})
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getDownload (req, res) {
  const fileName = req.params.fileName
  const pathFile = 'archives/' + fileName + '.zip'
  res.download(pathFile)
}

module.exports = { postDownload, getDownload }