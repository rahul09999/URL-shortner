// Simple rate limiter test script
// Prerequisite: server running locally (default http://localhost:3000)
// Run with: node test/rateLimiter.test.js

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testRateLimit(endpoint, attempts, expectedLimit) {
    console.log(`\n=== Testing ${endpoint} (${attempts} requests, limit ~${expectedLimit}) ===`);
    const requests = [];

    for (let i = 0; i < attempts; i++) {
        requests.push(
            axios
                .get(`${BASE_URL}${endpoint}`, {
                    validateStatus: () => true, // accept all statuses
                })
                .catch((err) => ({
                    status: err.response?.status || 500,
                    data: err.response?.data || { error: err.message },
                })),
        );
    }

    const responses = await Promise.all(requests);
    const success = responses.filter((r) => r.status < 400).length;
    const limited = responses.filter((r) => r.status === 429).length;
    const errors = responses.filter((r) => r.status >= 500).length;

    console.log(`Success (<400): ${success}`);
    console.log(`Rate limited (429): ${limited}`);
    console.log(`Server errors (>=500): ${errors}`);

    const sample = responses.find((r) => r.headers);
    if (sample?.headers) {
        console.log('RateLimit-Limit:', sample.headers['ratelimit-limit']);
        console.log('RateLimit-Remaining:', sample.headers['ratelimit-remaining']);
        console.log('RateLimit-Reset:', sample.headers['ratelimit-reset']);
    }

    if (attempts > expectedLimit && limited === 0) {
        console.log('⚠️  No 429 responses observed; rate limiter may not be active.');
    } else if (limited > 0) {
        console.log('✅  Rate limiter is blocking excess requests.');
    }
}

async function testCreateUrlRateLimit() {
    // Requires an authenticated session; add your cookie or auth header below.
    const authHeaders = {
        // Cookie: 'token=YOUR_TOKEN_HERE',
    };

    console.log('\n=== Testing /url creation (25/min limit) ===');
    const requests = [];
    for (let i = 0; i < 30; i++) {
        requests.push(
            axios
                .post(
                    `${BASE_URL}/url`,
                    { url: `https://example.com/test-${i}` },
                    {
                        headers: authHeaders,
                        validateStatus: () => true,
                    },
                )
                .catch((err) => ({
                    status: err.response?.status || 500,
                    data: err.response?.data || { error: err.message },
                })),
        );
    }

    const responses = await Promise.all(requests);
    const limited = responses.filter((r) => r.status === 429).length;
    console.log(`Rate limited (429) responses: ${limited} / 30`);

    if (limited === 0) {
        console.log('⚠️  No 429 responses observed; ensure auth headers and limiter are applied.');
    } else {
        console.log('✅  Creation rate limiter is blocking excess requests.');
    }
}

async function run() {
    console.log('Base URL:', BASE_URL);
    console.log('Ensure the server is running before executing this script.');

    await testRateLimit('/', 50, 40); // global limiter in index.js

    // Wait briefly between bursts
    await new Promise((r) => setTimeout(r, 2000));

    await testRateLimit('/login', 50, 40);

    // To test the /url creation limiter (requires auth)
    // await testCreateUrlRateLimit();
}

run().catch((err) => {
    console.error('Rate limiter test failed:', err.message);
});

