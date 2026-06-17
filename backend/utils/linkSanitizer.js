// server/utils/linkSanitizer.js

/**
 * Sanitizes a link object to safely return it to the frontend.
 * If a password is set on the link, it masks the password string as '********'
 * and adds a boolean `hasPassword: true` flag. If no password is set,
 * `password` is cleared and `hasPassword: false` is set.
 *
 * @param {Object|Document} link - The Mongoose document or plain object.
 * @returns {Object} - The sanitized plain object.
 */
function sanitizeLink(link) {
  if (!link) return null;
  
  // Convert Mongoose document to plain object if necessary
  const obj = typeof link.toObject === 'function' ? link.toObject() : { ...link };
  
  if (obj.password) {
    obj.password = '********';
    obj.hasPassword = true;
  } else {
    obj.password = '';
    obj.hasPassword = false;
  }
  
  return obj;
}

/**
 * Sanitizes an array of link objects.
 *
 * @param {Array} links - Array of Mongoose documents or plain objects.
 * @returns {Array} - Array of sanitized plain objects.
 */
function sanitizeLinks(links) {
  if (!Array.isArray(links)) return [];
  return links.map(sanitizeLink);
}

module.exports = {
  sanitizeLink,
  sanitizeLinks,
};
