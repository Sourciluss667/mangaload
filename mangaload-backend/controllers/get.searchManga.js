const fetch = require('node-fetch')
const config = require('../config.js')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function searchManga (req, res) {
  const name = req.params.name

  const requestResult = await fetch(config.JAPSCAN_URL + "/live-search/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    "referrerPolicy": "no-referrer",
    "body": "search=" + name,
    "method": "POST",
    "mode": "cors"
  })

  let resJson = await requestResult.text()
  resJson = JSON.parse(resJson)

  res.json(resJson)
}

module.exports = searchManga
