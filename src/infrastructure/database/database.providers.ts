import * as dotenv from 'dotenv';
dotenv.config();
import * as mongoose from 'mongoose';

let mongooseUri: string;

if (process.env.dev === 'local') {
  mongooseUri = 'mongodb://0.0.0.0:27017/BloggersPlatform';
  console.log('Local DB');
} else {
  mongooseUri = process.env.mongooseUri;
  console.log('Mongo Atlas DB');
}

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect(mongooseUri),
  },
];
