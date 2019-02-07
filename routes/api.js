const Router = require('express-promise-router');
const multer = require('multer');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const config = require('../config');
const User = require('../models/user');

const router = new Router();
const upload = multer({ storage: multer.diskStorage(config.multer) });
const transporter = nodemailer.createTransport({
  host: 'smtp.elasticemail.com',
  port: 2525,
  auth: config.email
});

router.post('/sign-up', upload.single('avatar'), async(req, res) => {
  const { email, password } = req.body;
  const host = req.protocol + '://' + req.get('host');

  try {
    const user = await User.createUser(email, password, req.file, host);
    const session = await user.createSession();
    const data = {
      session,
      avatar: user.avatar,
      thumbnail: user.thumbnail,
    };
    return success(res, data);
  } catch (e) {
    return error(res, e, 500);
  }
});

router.post('/sign-in', async(req, res) => {
  const { email, password } = req.body;

  try {
    const data = await User.login(email, password);
    return success(res, data);
  } catch (e) {
    return error(res, e, 500);
  }
});

router.post('/email', async(req, res) => {
  try {
    validate(req.body);
  } catch (e) {
    return error(res, e, 500);
  }

  const { users, text, token } = req.body;

  // Validate token
  const granted = await User.checkSession(token);
  if (!granted) {
    return error(res, new Error('Access denied'), 403);
  }

  const userArray = users.split(',');

  // Generate Authorization header for GitHub API
  const { github } = config;
  const base = Buffer.from(`${github.user}:${github.pass}`).toString('base64');
  const headers = { 'Authorization': 'Basic ' + base };

  // Send email for each user
  try {
    const data = await Promise.all(userArray.map(u => send(u, text, headers)));
    return success(res, data);
  } catch (e) {
    return error(res, e, 500);
  }
});

function validate(body) {
  if (!body.text) throw new Error('No text provided');
  if (!body.users) throw new Error('No users provided');
  if (!body.token) throw new Error('No token provided');

  return body;
}

function error(res, e, code) {
  res.status(code);
  return res.json({
    status: code,
    error: {
      message: e.message
    }
  });
}

function success(res, data) {
  return res.json({
    status: 200,
    error: null,
    data
  });
}

async function send(name, text, headers) {
  // Get data through GitHub API
  const githubResponse = await fetch(
    `https://api.github.com/users/${name}`, { headers }
  );
  const { email, location } = await githubResponse.json();
  if (!email) {
    return {
      error: {
        message: `No email found for username ${name}`
      }
    };
  }

  // Get weather for user location
  const weatherResponse = await fetch(
    'https://api.openweathermap.org/data/2.5/weather?q=' +
    `${encodeURIComponent(location)}&appid=${config.weather.api.key}`
  );
  const weather = await weatherResponse.json();

  // Generate e-mail and send it
  const signature = await bcrypt.hash(JSON.stringify(weather), config.rounds);
  const mailOptions = {
    text: `${text}\n\nSignature: ${signature}`,
    subject: config.email.subject,
    from: config.email.user,
    to: email,
  };
  console.log(mailOptions);
  const result = await transporter.sendMail(mailOptions);
  console.log(result);

  return result;
}

module.exports = router;
