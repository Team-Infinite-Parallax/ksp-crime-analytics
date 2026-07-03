const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  // Set CORS headers
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mock-role, x-mock-email, x-mock-employee-id'
  });

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed', message: 'Only POST is supported.' }));
    return;
  }

  // Read request body
  let bodyStr = '';
  req.on('data', chunk => {
    bodyStr += chunk;
  });

  req.on('end', async () => {
    try {
      let payload = {};
      if (bodyStr) {
        payload = JSON.parse(bodyStr);
      }
      const text = payload.text || '';
      const language = payload.language || 'en-US';

      // Default filters structure
      const filters = {
        districtId: 'all',
        unitId: 'all',
        dateRange: '30days',
        gravity: 'all',
        searchTerm: ''
      };

      if (!text) {
        res.end(JSON.stringify({ success: true, filters, transcript: '' }));
        return;
      }

      // Initialize Catalyst App and Zia service
      let app;
      let zia;
      try {
        app = catalyst.initializeApp(req);
        zia = app.zia();
      } catch (err) {
        console.warn('Zia SDK initialization failed, utilizing parser fallback:', err.message);
      }

      // 1. Keyword/Search term extraction (using Zia for English if available)
      let extractedSearchTerm = '';
      if (zia && language.startsWith('en')) {
        try {
          const ziaResult = await zia.getKeywordExtraction([text]);
          if (ziaResult && ziaResult.keywords && ziaResult.keywords.length > 0) {
            // Filter out common query words like "show", "filter", "crime", "cases", "me", "find"
            const queryWords = ['show', 'filter', 'crime', 'crimes', 'case', 'cases', 'me', 'find', 'search', 'display', 'list', 'about', 'for', 'the', 'in', 'of'];
            const relevantKeywords = ziaResult.keywords.filter(kw => !queryWords.includes(kw.toLowerCase()));
            if (relevantKeywords.length > 0) {
              // Take the first relevant keyword or join them
              extractedSearchTerm = relevantKeywords[0];
            }
          }
        } catch (ziaErr) {
          console.warn('Zia Keyword extraction failed:', ziaErr.message);
        }
      }

      // 2. Dictionary / rule-based extraction for Kannada and English
      const textLower = text.toLowerCase();

      // --- District Matching ---
      // Bengaluru Urban: 1
      // Mysuru: 2
      // Belagavi: 3
      // Dakshina Kannada: 4
      // Kalaburagi: 5
      if (textLower.includes('bengaluru') || textLower.includes('bangalore') || textLower.includes('ಬೆಂಗಳೂರು') || textLower.includes('ಬೆಂಗಳೂರಿನ')) {
        filters.districtId = '1';
      } else if (textLower.includes('mysuru') || textLower.includes('mysore') || textLower.includes('ಮೈಸೂರು') || textLower.includes('ಮೈಸೂರಿನ')) {
        filters.districtId = '2';
      } else if (textLower.includes('belagavi') || textLower.includes('belgaum') || textLower.includes('ಬೆಳಗಾವಿ') || textLower.includes('ಬೆಳಗಾವಿಯ')) {
        filters.districtId = '3';
      } else if (textLower.includes('dakshina kannada') || textLower.includes('mangaluru') || textLower.includes('mangalore') || textLower.includes('ದಕ್ಷಿಣ ಕನ್ನಡ') || textLower.includes('ಮಂಗಳೂರು') || textLower.includes('ಮಂಗಳೂರಿನ')) {
        filters.districtId = '4';
      } else if (textLower.includes('kalaburagi') || textLower.includes('gulbarga') || textLower.includes('ಕಲಬುರಗಿ') || textLower.includes('ಕಲಬುರಗಿಯ')) {
        filters.districtId = '5';
      }

      // --- Unit/Station Matching ---
      // Shivajinagar PS = 1, Indiranagar PS = 2, Halasuru PS = 3, Devaraja PS = 4, Lakshmipuram PS = 5, Belagavi Town PS = 6, Mangaluru South PS = 7, Kalaburagi City PS = 8
      if (textLower.includes('shivajinagar') || textLower.includes('ಶಿವಾಜಿನಗರ')) {
        filters.unitId = '1';
      } else if (textLower.includes('indiranagar') || textLower.includes('ಇಂದಿರಾನಗರ')) {
        filters.unitId = '2';
      } else if (textLower.includes('halasuru') || textLower.includes('ulsoor') || textLower.includes('ಹಲಸೂರು')) {
        filters.unitId = '3';
      } else if (textLower.includes('devaraja') || textLower.includes('ದೇವರಾಜ')) {
        filters.unitId = '4';
      } else if (textLower.includes('lakshmipuram') || textLower.includes('ಲಕ್ಷ್ಮಿಪುರಂ')) {
        filters.unitId = '5';
      } else if (textLower.includes('belagavi town') || textLower.includes('ಬೆಳಗಾವಿ ಟೌನ್')) {
        filters.unitId = '6';
      } else if (textLower.includes('mangaluru south') || textLower.includes('ಮಂಗಳೂರು ದಕ್ಷಿಣ') || textLower.includes('south ps')) {
        filters.unitId = '7';
      } else if (textLower.includes('kalaburagi city') || textLower.includes('ಕಲಬುರಗಿ ಸಿಟಿ') || textLower.includes('city ps')) {
        filters.unitId = '8';
      }

      // --- Gravity Matching ---
      // Heinous = 1, Non-heinous = 2
      if (textLower.includes('heinous') || textLower.includes('serious') || textLower.includes('grave') || textLower.includes('ಘೋರ') || textLower.includes('ಗಂಭೀರ')) {
        filters.gravity = '1';
      } else if (textLower.includes('non-heinous') || textLower.includes('non heinous') || textLower.includes('ordinary') || textLower.includes('simple') || textLower.includes('ಘೋರವಲ್ಲದ') || textLower.includes('ಸಾಮಾನ್ಯ')) {
        filters.gravity = '2';
      }

      // --- Date Range Matching ---
      // last 30 days = 30days, last 90 days = 90days, last year = 1year, year to date = ytd
      if (textLower.includes('30 days') || textLower.includes('last month') || textLower.includes('ಕಳೆದ ತಿಂಗಳು') || textLower.includes('೩೦ ದಿನ')) {
        filters.dateRange = '30days';
      } else if (textLower.includes('90 days') || textLower.includes('three months') || textLower.includes('೩ ತಿಂಗಳು')) {
        filters.dateRange = '90days';
      } else if (textLower.includes('1 year') || textLower.includes('last year') || textLower.includes('12 months') || textLower.includes('ಕಳೆದ ವರ್ಷ') || textLower.includes('೧ ವರ್ಷ')) {
        filters.dateRange = '1year';
      } else if (textLower.includes('ytd') || textLower.includes('year to date') || textLower.includes('this year') || textLower.includes('ಈ ವರ್ಷ')) {
        filters.dateRange = 'ytd';
      }

      // --- Search Term Matching ---
      // If we got a search term from Zia, use it. Otherwise, look for specific names or terms.
      if (extractedSearchTerm) {
        filters.searchTerm = extractedSearchTerm;
      } else {
        // Fallback: extract specific entities or words like crime categories/names
        // Let's check for names like Rajesh Choudhary, Imran Basappa, Sneha Yellappa, Vikas Gupta, Anil Deshpande
        const suspects = ['rajesh choudhary', 'rajesh', 'imran basappa', 'imran', 'sneha yellappa', 'sneha', 'vikas gupta', 'vikas', 'anil deshpande', 'anil'];
        for (const name of suspects) {
          if (textLower.includes(name)) {
            // Capitalize first letters for search matching
            filters.searchTerm = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            break;
          }
        }

        // If no suspect matches, check for general crime terms
        if (!filters.searchTerm) {
          const crimeTerms = {
            'cyber': 'Cyber',
            'online': 'Cyber',
            'ಸೈಬರ್': 'Cyber',
            'burglary': 'Burglary',
            'theft': 'Theft',
            'snatching': 'Snatching',
            'fraud': 'Fraud',
            'murder': 'Murder',
            'ಕೊಲೆ': 'Murder',
            'ಕಳ್ಳತನ': 'Theft',
            'ಗಾಂಜಾ': 'Cannabis',
            'cannabis': 'Cannabis',
            'ganja': 'Cannabis',
            'narcotics': 'Narcotics',
            'vehicle': 'Vehicle'
          };
          for (const key in crimeTerms) {
            if (textLower.includes(key)) {
              filters.searchTerm = crimeTerms[key];
              break;
            }
          }
        }
      }

      res.end(JSON.stringify({
        success: true,
        filters,
        transcript: text
      }));

    } catch (err) {
      console.error('Voice AI function error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};
