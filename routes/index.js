const express = require('express');

const Router = express.Router;
const router = new Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/send', (req, res) => {
  res.render('send');
});

module.exports = router;
