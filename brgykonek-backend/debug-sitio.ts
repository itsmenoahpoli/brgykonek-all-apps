import mongoose from 'mongoose';
import Complaint from './src/models/Complaint';
import dotenv from 'dotenv';

dotenv.config();

const debugSitioData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brgykonek');
    console.log('Connected to MongoDB');
    
    console.log('Checking complaint sitio data...');
    
    const sampleComplaints = await Complaint.find({}).limit(5).select('sitio');
    console.log('Sample complaints with sitio:', sampleComplaints);
    
    const complaintsWithSitio = await Complaint.find({ sitio: { $ne: null, $exists: true } }).select('sitio');
    console.log('Complaints with sitio (first 10):', complaintsWithSitio.slice(0, 10));
    
    const aggregationResult = await Complaint.aggregate([
      { $group: { _id: "$sitio", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $project: { sitio: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    
    console.log('Aggregation result:', aggregationResult);
    
    process.exit(0);
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  }
};

debugSitioData();
