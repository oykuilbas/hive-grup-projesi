// Reads settings from server/.env if the file exists (it is not committed to Git).
require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });

// Local development works without a .env file (NFR-05): a fixed development
// secret is used. Set your own JWT_SECRET in server/.env if you prefer.
const JWT_SECRET = process.env.JWT_SECRET || 'hive-local-development-secret';

// Login tokens expire after 1 hour (NFR-02).
const JWT_EXPIRES_IN = '1h';

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
