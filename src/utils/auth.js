const bcrypt = require('bcryptjs');

/**
 * Generate a password hash that can be consistently recreated
 * Note: This is only for testing purposes
 * @param {string} password The plain text password to hash
 * @returns {string} The hashed password
 */
const generateTestHash = async (password) => {
  // Use a fixed salt round for consistent hashing in tests
  const salt = await bcrypt.genSalt(1);
  return bcrypt.hash(password, salt);
};

module.exports = {
  generateTestHash
};