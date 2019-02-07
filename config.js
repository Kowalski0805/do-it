const mime = require('mime-types');

module.exports = {
  rounds: 10,
  tokenExpiry: 1000 * 60 * 15, // 15 minutes in milliseconds
  github: {
    user: '',
    pass: '',
  },
  email: {
    user: '',
    pass: '',
    subject: 'Letter from Node.js'
  },
  weather: {
    api: {
      key: 'cc41416a11500a9bd5ff5f3dcbe2e721'
    }
  },
  database: {
    development: {
      client: 'postgresql',
      connection: 'postgresql://postgres:postgres@localhost:5432/postgres',
    },
    production: {
      client: 'postgresql',
      connection: 'postgresql://postgres:postgres@postgres:5432/postgres',
    },
  },
  multer: {
    destination: (req, file, cb) => { cb(null, 'public/images'); },
    filename: (req, file, cb) => {
      const extension = mime.extension(file.mimetype);
      const name = `${Date.now()}.${extension}`;
      cb(null, name);
    },
  },
};
