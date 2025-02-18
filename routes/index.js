const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: '天气查询' });
});

module.exports = router;