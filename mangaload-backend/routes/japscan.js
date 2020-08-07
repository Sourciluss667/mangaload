const express = require('express')
const router = express.Router()

const searchManga = require('../controllers/get.searchManga.js')
const getChapters = require('../controllers/get.getChapters.js')

router.get('/searchManga/:name', searchManga)
router.get('/getChapters/:name', getChapters)

module.exports = router
