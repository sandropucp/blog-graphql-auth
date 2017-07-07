import path from 'path';

require('dotenv').config(); // To read process.env from .env file

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  root: path.join(__dirname, '/../../')
};

export default Object.assign(defaults, config);
