import { MongoClient } from 'mongodb';
import { ConnectionOptions } from 'tls';

const MONGODB_URI = process.env.MONGODB_URI;

// check the MongoDB URI
if (!MONGODB_URI) {
    throw new Error('Define the MONGODB_URI environmental variable');
}

export async function connectToDatabase() {

    // set the connection options
    const options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      maxPoolSize: 17
    } as ConnectionOptions

    // Connect to cluster
    let client = new MongoClient((MONGODB_URI as string), options);
    await client.connect();

    return client
}