const fs = require('fs')
const archiver = require('archiver')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function postDownload (req, res) {
  // name, chapters
  const info = req.body
  console.log('finish download')
  console.log(info)

  let waitArchive = true
  const fileName = info.name + '-' + Math.floor(Math.random() * 1001)
  const pathFile = 'archives/' + fileName + '.zip'

  const output = fs.createWriteStream(pathFile)
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
    waitArchive = false
  })

  archive.on('error', function(err){
    res.sendStatus(500)
    throw err
  })

  archive.pipe(output)

  archive.directory(`downloads/${info.name}/`, false)
  
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