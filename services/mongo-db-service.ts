import mongoose from "mongoose";
import { stringIsNullOrEmpty } from "../utils/helpers";

let isConnected = false;

export const mongoClient = async () => {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGOSDB_ENDPOINT;

  if (stringIsNullOrEmpty(uri)) {
    throw new Error("Missing required environment variable for MongoDB URI");
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

export const mongoConfiguration = (): boolean => {
  const uri = process.env.MONGODB_URI;
  return !stringIsNullOrEmpty(uri);
};