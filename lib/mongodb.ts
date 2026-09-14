import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// check the MongoDB URI
if (!MONGODB_URI) {
    throw new Error('Define the MONGODB_URI environmental variable');
}
const mongoUri = MONGODB_URI

let cachedClient: MongoClient | undefined
let connectionPromise: Promise<MongoClient> | undefined

export async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient
    }

    connectionPromise ??= new MongoClient(mongoUri, {maxPoolSize: 17}).connect()
    cachedClient = await connectionPromise

    return cachedClient
}