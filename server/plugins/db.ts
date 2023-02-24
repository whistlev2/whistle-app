import { Nitro } from 'nitropack';
import mongoose from 'mongoose';

export default async (_nitroApp: Nitro) => {
    const MONGO_USERNAME = process.env.MONGO_USERNAME;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
    const MONGO_HOST = process.env.MONGO_HOST;
    if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_HOST) {
        throw new Error('No database credentials found');
    }
    const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`;

    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(MONGO_URL);
        console.log('Connected to database');
    } catch (error) {
        console.error('Error connecting to database', error); //TODO: Error handling
    }
};