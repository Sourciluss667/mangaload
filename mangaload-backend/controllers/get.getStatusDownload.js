const startDownload = require('../controllers/post.startDownload.js')
const downloading = startDownload.downloading

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getStatus (req, res) {
  const name = req.params.name
  let result = {}

  downloading.forEach(e => {
    if (e.name === name) {
      result = e
    }
  })

  res.json(result)
}

module.exports = getStatus
