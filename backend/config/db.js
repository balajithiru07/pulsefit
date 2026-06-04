import mongoose from 'mongoose';
import dns from 'dns';

// Set public DNS servers programmatically to bypass local DNS resolution issues with MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsError) {
  console.warn(`⚠️ Warning: Failed to set public DNS servers: ${dnsError.message}`);
}


const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulsefit');
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    global.isMockDB = false;
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ WARNING: Local MongoDB is not running. PulseFit API will run using a dynamic in-memory store fallback so you can preview the app immediately without a local database.');
    global.isMockDB = true;
  }
};

export default connectDB;
