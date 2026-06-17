const axios = require('axios');

const KNOWN_SHORTENERS = [
  'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'is.gd', 'cli.gs', 
  'pic.gd', 'DwarfURL.com', 'ow.ly', 'yfrog.com', 'migre.me', 'ff.im'
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.pw', '.cc', '.club', '.stream'];

const BLACKLISTED_DOMAINS = [
  'malware.example.com',
  'phishing.example.com'
];

/**
 * Scan a URL for malware/phishing indicators.
 * @param {string} url - The URL to scan
 * @returns {Promise<{riskScore: number, scanStatus: string}>}
 */
exports.scanUrl = async (url) => {
  let riskScore = 0;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // 1. Check known blacklisted domains
    if (BLACKLISTED_DOMAINS.some(d => hostname.includes(d))) {
      riskScore += 90;
    }
    
    // 2. Check for raw IP address
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isIp) {
      riskScore += 40;
    }
    
    // 3. Check for suspicious TLDs
    if (SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld))) {
      riskScore += 30;
    }
    
    // 4. Check for shortener chains
    if (KNOWN_SHORTENERS.some(shortener => hostname === shortener)) {
      riskScore += 50;
    }

    // Google Safe Browsing / VirusTotal would go here when API keys are available
    // if (process.env.GOOGLE_SAFE_BROWSING_KEY) { ... }

  } catch (err) {
    // If URL is invalid, it's highly suspicious
    riskScore += 100;
  }

  let scanStatus = 'safe';
  if (riskScore >= 70) scanStatus = 'dangerous';
  else if (riskScore >= 30) scanStatus = 'suspicious';

  return { riskScore: Math.min(riskScore, 100), scanStatus };
};
