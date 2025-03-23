const express = require('express');
const router = express.Router();
const postCtrl = require('../controller/postController');
const upload = require('../middleware/S3upload')
const checkLogin = require('../middleware/checkLogin')

router.get('/list', postCtrl.listPage)

router.get('/write', checkLogin, postCtrl.writePage)

router.post('/add', checkLogin, upload.single('img'), postCtrl.postAdd);

router.get('/detail/:id', postCtrl.detailPage)

router.get('/edit/:id', checkLogin, postCtrl.editPage)

router.post('/edit', checkLogin, postCtrl.postEdit)

router.delete('/delete', checkLogin, postCtrl.delete)

module.exports = router;