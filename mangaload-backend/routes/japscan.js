const express = require('express')
const router = express.Router()

const searchManga = require('../controllers/get.searchManga.js')
const getChapters = require('../controllers/get.getChapters.js')
const startDownload = require('../controllers/post.startDownload.js')
const getStatusDownload = require('../controllers/get.getStatusDownload.js')
const finishDownload = require('../controllers/post.finishDownload.js')

router.get('/searchManga/:name', searchManga)
router.get('/getChapters/:name', getChapters)
router.post('/startDownload', startDownload.startDownload)
router.get('/downloadStatus/:name', getStatusDownload)
router.post('/download', finishDownload.postDownload)
router.get('/download/:fileName', finishDownload.getDownload)

module.exports = router
