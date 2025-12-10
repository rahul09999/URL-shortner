require('dotenv/config');
const mongoose = require('mongoose');
const { mongooseConnect } = require('../connect');
const { URL } = require('../models/url');

async function clearVisitedHistory() {
    const mongoBase = process.env.MONGO_CONNECT;
    if (!mongoBase) {
        console.error('Missing MONGO_CONNECT environment variable.');
        process.exit(1);
    }

    try {
        await mongooseConnect(`${mongoBase}/url-shortner`);

        const result = await URL.updateMany({}, { $set: { visitedHistory: [] } });
        console.log(`Cleared visitedHistory for ${result.modifiedCount} short URLs.`);
    } catch (error) {
        console.error('Failed to clear visitedHistory:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

clearVisitedHistory();

