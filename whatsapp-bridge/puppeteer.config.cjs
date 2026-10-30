const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to be local to the project
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
