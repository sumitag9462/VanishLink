const dns = require('dns').promises;
const net = require('net');

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const PRIVATE_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);
const METADATA_IPS = new Set(['169.254.169.254']);

function isPrivateIp(ip) {
  if (!ip) return true;
  const clean = ip.replace('::ffff:', '');
  if (METADATA_IPS.has(clean)) return true;
  if (clean === '127.0.0.1' || clean === '0.0.0.0' || clean === '::1') return true;
  if (clean.startsWith('10.')) return true;
  if (clean.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(clean)) return true;
  if (clean.startsWith('169.254.')) return true;
  if (clean.startsWith('fc') || clean.startsWith('fd') || clean.startsWith('fe80:')) return true;
  return false;
}

function parseHttpUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
  if (!parsed.hostname || PRIVATE_HOSTNAMES.has(parsed.hostname.toLowerCase())) return null;
  if (net.isIP(parsed.hostname) && isPrivateIp(parsed.hostname)) return null;
  return parsed;
}

async function assertPublicHttpUrl(url) {
  const parsed = parseHttpUrl(url);
  if (!parsed) {
    const err = new Error('Only public http(s) URLs are allowed');
    err.statusCode = 400;
    throw err;
  }

  const addresses = await dns.lookup(parsed.hostname, { all: true }).catch(() => []);
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    const err = new Error('URL host is not allowed');
    err.statusCode = 400;
    throw err;
  }

  return parsed.toString();
}

function isSafeRedirectUrl(url) {
  return !!parseHttpUrl(url);
}

module.exports = {
  assertPublicHttpUrl,
  isSafeRedirectUrl,
  parseHttpUrl,
};
