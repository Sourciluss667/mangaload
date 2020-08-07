const fetch = require('node-fetch')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getChapters (req, res) {
  const name = req.params.name

  

  res.json({})
}

module.exports = getChapters
