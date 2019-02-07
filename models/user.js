const bcrypt = require('bcrypt');
const thumb = require('node-thumbnail').thumb;
const knex = require('knex');

const config = require('../config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config.database[env];
const db = knex(dbConfig);

class User {
  constructor(email, password, avatar, thumbnail, id) {
    this.email = email;
    this.password = password;
    this.avatar = avatar;
    this.thumbnail = thumbnail;
    this.id = id;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  static async checkSession(token) {
    // Remove expired sessions
    await db('sessions').where('expires', '<', new Date().toISOString()).del();

    // Check for existing session
    const [ id ] = await db('sessions').where({ token }).select();
    return !!id;
  }

  async createSession() {
    // End all sessions for this user
    await db('sessions').where({ user_id: this.id }).del();

    // Generate new token and start a new session
    const token = await bcrypt.hash(`${this.id}${new Date()}`, config.rounds);
    const expires = new Date();
    expires.setMilliseconds(expires.getMilliseconds() + config.tokenExpiry);

    const params = {
      token,
      user_id: this.id,
      expires: expires.toISOString()
    };
    const returning = ['token', 'expires'];
    const [ session ] = await db.insert(params, returning).into('sessions');

    return session;
  }

  static createThumbnail(source, destination) {
    return new Promise((resolve, reject) =>
      thumb({
        source,
        destination,
        suffix: '',
        width: 100
      }).then(() => resolve(null)).catch(reject)
    );
  }

  static async createUser(email, password, file, host) {
    if (!file) throw new Error('No file provided');
    if (!email) throw new Error('No email provided');
    if (!password) throw new Error('No password provided');
    if (!email.match(/.+@.+/)) throw new Error('Invalid e-mail');

    // Encrypt password
    const encryptedPassword = await bcrypt.hash(password, config.rounds);

    // Generate thumbnail
    let avatarPath = file.path;
    let thumbnailPath = `${file.destination}/thumbs/`;
    const error = await User.createThumbnail(avatarPath, thumbnailPath);
    if (error) throw new Error(error.message);

    // Generate urls for avatar and thumb
    avatarPath = avatarPath.replace(/public\//, '');
    thumbnailPath = thumbnailPath.replace(/public\//, '') + file.filename;
    const avatar = host + '/' + avatarPath;
    const thumbnail = host + '/' + thumbnailPath;

    // Create model
    const user = new User(email, encryptedPassword, avatar, thumbnail);

    // Insert model into DB
    return user.persist();
  }

  static async findUser(userEmail) {
    const result = await db('users').where({ email: userEmail }).select();
    const { email, password, avatar, thumbnail, id } = result[0];

    return new User(email, password, avatar, thumbnail, id);
  }

  static async login(email, password) {
    if (!email) throw new Error('No email provided');
    if (!password) throw new Error('No password provided');
    if (!email.match(/.+@.+/)) throw new Error('Invalid email');

    const user = await User.findUser(email);
    if (!user) throw new Error('Invalid email');

    const result = await user.checkPassword(password);
    if (!result) throw new Error('Invalid password');

    const session = await user.createSession();

    return { user, session };
  }

  async persist() {
    const params = {
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      thumbnail: this.thumbnail
    };

    const [ user ] = await db.insert(params, ['id']).into('users');
    this.id = user.id;

    return this;
  }

}

module.exports = User;
