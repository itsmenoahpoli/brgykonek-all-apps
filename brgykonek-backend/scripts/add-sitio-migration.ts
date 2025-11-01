import mongoose from 'mongoose';
import dotenv from 'dotenv';
import updateComplaintsWithSitio from '../src/migrations/add-sitio-to-complaints';

dotenv.config();

const runMigration = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brgykonek');
    console.log('Connected to MongoDB');
    
    await updateComplaintsWithSitio();
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
