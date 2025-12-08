const UAParser = require('ua-parser-js');

/**
 * Utility functions for analytics data collection and processing
 */

/**
 * Anonymize IP address by removing the last octet (IPv4) or last 64 bits (IPv6)
 * @param {string} ip - IP address to anonymize
 * @returns {string} - Anonymized IP address
 */
function anonymizeIP(ip) {
    if (!ip) return null;
    
    // Handle IPv4 addresses
    if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
    }
    
    // Handle IPv6 addresses - remove last 64 bits
    if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length > 0) {
            // Keep first 4 groups, set rest to 0
            const anonymized = parts.slice(0, 4).join(':') + '::0';
            return anonymized;
        }
    }
    
    return ip;
}

/**
 * Parse user agent string to extract device and browser information
 * @param {string} userAgent - User agent string
 * @returns {object} - Object containing deviceType and browserType
 */
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

/**
 * Get client IP address from request
 * @param {object} req - Express request object
 * @returns {string} - Client IP address
 */
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'Unknown';
}

/**
 * Get referrer URL from request headers
 * @param {object} req - Express request object
 * @returns {string|null} - Referrer URL or null
 */
function getReferrer(req) {
    return req.headers.referer || req.headers.referrer || null;
}

/**
 * Get geographic location from IP address (basic implementation)
 * Note: For production, consider using a geolocation service like ipapi.co, ip-api.com, or geoip-lite
 * @param {string} ip - IP address
 * @returns {Promise<object>} - Location object with country, city, region
 */
async function getLocationFromIP(ip) {
    // For now, return null. In production, you can integrate with:
    // - ipapi.co (free tier available)
    // - ip-api.com (free tier available)
    // - geoip-lite (offline database)
    // - MaxMind GeoIP2 (commercial)
    
    // Example implementation with ip-api.com (free tier: 45 requests/minute)
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
    anonymizeIP,
    parseUserAgent,
    getClientIP,
    getReferrer,
    getLocationFromIP
};

