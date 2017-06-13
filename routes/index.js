var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'pug-Bootstrap' });
});

var item = { title: 'shop',
            item_name:"generic item",
            item_description:"about item" }
/* GET test item. */
router.get('/test', function(req, res, next) {
  res.render('item_page',item);
});

/* GET test item. */
router.get('/men', function(req, res, next) {
    res.render('men');
});

module.exports = router;
