// server/services/aiSummaryService.js
const https = require('https');
const dns = require('dns').promises;

function isPrivateIP(ip) {
  if (ip === '::1' || ip === '::') return true;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  const [a, b] = parts.map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

/**
 * Clean HTML to extract text content, description, and title.
 */
function extractMetadata(html, url) {
  try {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Try various description patterns
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
                         html.match(/<meta[^>]*content=["']([\s\S]*?)["']/i) ||
                         html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i);
    
    let description = metaDescMatch ? metaDescMatch[1].trim() : '';
    // Unescape HTML entities simple fallback
    description = description.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");

    // Extract body text for keyword/reading time calculations
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyText = bodyMatch ? bodyMatch[1] : html;
    
    // Strip scripts, styles, and tags
    bodyText = bodyText
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return { title, description, bodyText };
  } catch (err) {
    console.error('Metadata extraction error:', err);
    return { title: '', description: '', bodyText: '' };
  }
}

/**
 * Fetch HTML page with a timeout.
 */
async function fetchUrlHtml(url) {
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (e) {
    throw new Error('Invalid URL', { cause: e });
  }

  // SSRF Protection
  try {
    const lookupResult = await dns.lookup(urlObj.hostname);
    if (isPrivateIP(lookupResult.address)) {
      throw new Error('Blocked private IP');
    }
  } catch (err) {
    throw new Error('DNS resolution failed or blocked private IP', { cause: err });
  }

  return new Promise((resolve, reject) => {

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 5000,
    };

    const client = urlObj.protocol === 'https:' ? https : require('http');
    const req = client.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Simple 1-level redirect follow
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return fetchUrlHtml(redirectUrl).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        if (data.length > 500 * 1024) { // Limit to 500KB
          req.destroy();
          resolve(data);
        }
      });
      res.on('end', () => resolve(data));
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });
  });
}

/**
 * Generate fallback AI summary elements locally.
 */
function generateLocalSummary(metadata, url) {
  const { title, description, bodyText } = metadata;
  const domain = new URL(url).hostname.replace('www.', '');
  
  // Predict category
  let category = 'Technology & Software';
  const urlLower = url.toLowerCase();
  if (urlLower.includes('news') || urlLower.includes('blog')) category = 'News & Blogs';
  else if (urlLower.includes('shop') || urlLower.includes('amazon') || urlLower.includes('store')) category = 'E-commerce & Shopping';
  else if (urlLower.includes('edu') || urlLower.includes('course') || urlLower.includes('learn')) category = 'Education & Learning';
  else if (urlLower.includes('youtube') || urlLower.includes('netflix') || urlLower.includes('media')) category = 'Entertainment & Media';
  else if (urlLower.includes('gov')) category = 'Government & Public Services';
  else if (urlLower.includes('finance') || urlLower.includes('bank') || urlLower.includes('crypto')) category = 'Finance & Business';

  // Generate summary
  let summary = description;
  if (!summary) {
    summary = `This link redirects to ${domain}. The page title is "${title || 'Untitled'}". It appears to offer resources and information related to ${category.toLowerCase()}.`;
  } else if (summary.length < 50) {
    summary = `${summary} (Hosted on ${domain})`;
  }

  // Estimate reading time (average 200 words per minute)
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  let readingTime = Math.max(1, Math.round(wordCount / 200));
  if (readingTime > 30) readingTime = 5; // fallback cap for thin/erroneous page reads

  // Extract keywords
  const stopWords = new Set(['the', 'a', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'an', 'of', 'is', 'are', 'was', 'were', 'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'our', 'your', 'my']);
  const words = bodyText
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  const frequencyMap = {};
  words.forEach(w => frequencyMap[w] = (frequencyMap[w] || 0) + 1);
  
  const keywords = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  // If we couldn't get keywords from body text, fallback
  if (keywords.length === 0) {
    keywords.push(domain.split('.')[0], 'webpage', 'secure-link');
  }

  return {
    summary,
    category,
    readingTime,
    keywords,
  };
}

/**
 * Generate webpage summary using real Gemini API or local fallback.
 */
async function generateAiSummary(url) {
  try {
    const html = await fetchUrlHtml(url);
    const metadata = extractMetadata(html, url);
    const localResult = generateLocalSummary(metadata, url);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('💡 No GEMINI_API_KEY configured. Using rules-based fallback for metadata/summary.');
      return localResult;
    }

    // Call Gemini API directly via native fetch to avoid dependencies
    const prompt = `
      You are an AI assistant analyzing a webpage metadata to produce a summary for a secure link preview.
      URL: ${url}
      Title: ${metadata.title}
      Description: ${metadata.description}
      Body Snippet (first 1000 chars): ${metadata.bodyText.substring(0, 1000)}

      Return a JSON object with the exact keys: "summary", "category", "readingTime", and "keywords".
      - "summary": A concise, engaging 1-to-2 sentence summary of what the webpage is about.
      - "category": A single-word or short phrase category (e.g. "Technology", "News", "E-commerce", "Entertainment", "Finance", "Education").
      - "readingTime": Estimated reading/browsing time in minutes as a number (e.g., 3).
      - "keywords": An array of exactly 3 to 5 lowercase keywords.

      Respond ONLY with the raw JSON. No markdown formatting, no codeblocks.
    `;

    const requestPayload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestPayload,
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      return {
        summary: parsed.summary || localResult.summary,
        category: parsed.category || localResult.category,
        readingTime: parsed.readingTime || localResult.readingTime,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : localResult.keywords,
      };
    }

    return localResult;
  } catch (err) {
    console.error('Error generating AI Summary for URL:', url, err.message);
    // Silent fail open: return fallback result or default values
    try {
      const domain = new URL(url).hostname;
      return {
        summary: `Secure link directing to ${domain}. No summary could be generated.`,
        category: 'Webpage',
        readingTime: 1,
        keywords: [domain, 'redirect'],
      };
    } catch {
      return {
        summary: 'Secure link redirect. No summary could be generated.',
        category: 'Webpage',
        readingTime: 1,
        keywords: ['redirect'],
      };
    }
  }
}

module.exports = {
  generateAiSummary,
};
