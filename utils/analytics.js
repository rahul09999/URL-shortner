const UAParser = require('ua-parser-js');
const requestIp = require('request-ip');

function parseUserAgent(userAgent) {
    if (!userAgent) {
        return {
            deviceType: 'Unknown',
            browserType: 'Unknown'
        };
    }

    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();

    // Normalize device type: default to desktop, map undefined to desktop, detect bots via UA fallback
    let deviceType = device?.type || 'desktop';
    const uaLower = userAgent.toLowerCase();
    if (/bot|crawler|spider|crawling/i.test(uaLower)) {
        deviceType = 'bot';
    }

    const browserType = browser?.name || 'Unknown';

    return {
        deviceType,
        browserType
    };
}

function getClientIP(req) {
    const ip = requestIp.getClientIp(req) // ||
        // req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        // req.headers['x-real-ip'] ||
        // req.connection?.remoteAddress ||
        // req.socket?.remoteAddress ||
        // req.ip;
    return ip || 'Unknown';
}

function getReferrer(req) {
    return req.headers.referer || req.headers.referrer || null;
}


async function getLocationFromIP(ip) {
    // Try below if ip-api fails
    // - ipapi.co (free tier available)
    // - ip-api.com (free tier available)
    // - geoip-lite (offline database)
    // - MaxMind GeoIP2 (commercial)
    
    // Implementation with ip-api.com (free tier: 45 requests/minute)
    try {
        const axios = require('axios');
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
            timeout: 2000
        });
        
        if (response.data && response.data.status === 'success') {
            return {
                country: response.data.country || 'Unknown',
                city: response.data.city || 'Unknown',
                region: response.data.regionName || 'Unknown'
            };
        }
    } catch (error) {
        // Silently fail - don't block redirect if geolocation fails
        console.error('Geolocation error:', error.message);
    }
    
    return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown'
    };
}

module.exports = {
    parseUserAgent,
    getClientIP,
    getReferrer,
    getLocationFromIP
};

