var express = require('express');
var router = express.Router();
import cors from 'cors';

var user = require('../api/v1/user');
var words = require('../api/v1/words');
var img = require('../api/v1/image');
var item = require('../api/v1/item');

var common = require('../api/v1/common');

router.post('/user/register', cors(), user.register);

router.post('/user/login', cors(), user.login);

// 写入一张表
router.post('/say/item', cors(), item.say);
router.get('/read/item', cors(), item.read);
router.post('/delete/item', cors(), item.delete);

router.post('/upVote/item', cors(), item.upVote);
router.post('/downVote/item', cors(), item.downVote);

router.post('/say/words', cors(), words.say);
router.get('/read/words', cors(), words.read);

router.options('/upload/token', cors());

router.get('/upload/token', cors(), common.uploadToken);

router.post('/say/img', cors(), img.say);

module.exports = router;