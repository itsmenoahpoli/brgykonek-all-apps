import mongoose from 'mongoose';
import Complaint from './src/models/Complaint';
import dotenv from 'dotenv';

dotenv.config();

const updateComplaintsWithSitio = async () => {
  try {
    console.log('Starting migration: Adding sitio field to complaints...');
    
    const complaintsWithoutSitio = await Complaint.find({ 
      $or: [
        { sitio: { $exists: false } },
        { sitio: null },
        { sitio: undefined }
      ]
    });
    console.log(`Found ${complaintsWithoutSitio.length} complaints without sitio to update`);
    
    let updatedCount = 0;
    
    for (const complaint of complaintsWithoutSitio) {
      const randomSitio = Math.floor(Math.random() * 100) + 1;
      
      await Complaint.updateOne(
        { _id: complaint._id },
        { $set: { sitio: randomSitio } }
      );
      
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} complaints...`);
      }
    }
    
    console.log(`Migration completed! Updated ${updatedCount} complaints with random sitio values (1-100)`);
    
    const totalComplaints = await Complaint.countDocuments();
    console.log(`Total complaints in database: ${totalComplaints}`);
    
    const complaintsWithSitio = await Complaint.countDocuments({ sitio: { $ne: null, $exists: true } });
    console.log(`Complaints with sitio: ${complaintsWithSitio}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brgykonek');
    console.log('Connected to MongoDB');
    
    await updateComplaintsWithSitio();
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();