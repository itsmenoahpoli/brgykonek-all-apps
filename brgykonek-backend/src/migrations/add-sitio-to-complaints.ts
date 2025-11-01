import mongoose from 'mongoose';
import Complaint from '../models/Complaint';

const updateComplaintsWithSitio = async () => {
  try {
    console.log('Starting migration: Adding sitio field to complaints...');
    
    const complaints = await Complaint.find({ sitio: { $exists: false } });
    console.log(`Found ${complaints.length} complaints to update`);
    
    let updatedCount = 0;
    
    for (const complaint of complaints) {
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
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export default updateComplaintsWithSitio;
