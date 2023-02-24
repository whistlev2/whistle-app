import mongoose from 'mongoose';

export default defineNitroPlugin(async (_nitroApp) => {
    const MONGO_USERNAME = process.env.MONGO_USERNAME;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
    const MONGO_HOST = process.env.MONGO_HOST;
    if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_HOST) {
        throw new Error('No database credentials found');
    }
    const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`; //TODO: Check srv

    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(MONGO_URL);
        console.log('Connected to database'); //TODO: Logging
    } catch (error) {
        console.error('Error connecting to database', error); //TODO: Error handling
    }
});