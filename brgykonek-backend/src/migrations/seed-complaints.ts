import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint';
import User from '../models/User';
import Sitio from '../models/Sitio';

dotenv.config();

const categories = [
  'Noise',
  'Garbage',
  'Vandalism',
  'Water Supply',
  'Road Damage',
  'Stray Animals',
  'Illegal Parking',
  'Street Light',
  'Flooding',
  'Other',
];

const pick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

const randomStatus = () => {
  const opts = ['pending', 'in_progress', 'resolved', 'rejected'] as const;
  return pick(opts);
};

const randomPriority = () => {
  const opts = ['low', 'medium', 'high'] as const;
  return pick(opts);
};

const randomPastDate = (days = 60) => new Date(Date.now() - Math.floor(Math.random() * days) * 86400000);

const ensureResidents = async () => {
  const count = await User.countDocuments({ user_type: 'resident' });
  if (count > 0) return;
  const demo = [
    { name: 'Resident One', email: 'resident1@example.com', password: 'password', user_type: 'resident' },
    { name: 'Resident Two', email: 'resident2@example.com', password: 'password', user_type: 'resident' },
  ];
  await User.insertMany(demo);
};

const run = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/brgykonek';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    await ensureResidents();

    const residents = await User.find({ user_type: 'resident' }).select('_id name');
    const staff = await User.find({ user_type: { $in: ['admin', 'staff'] } }).select('_id name user_type');
    const sitios = await Sitio.find({}).sort({ code: 1 }).select('_id code name');

    if (!residents.length) throw new Error('No residents available to attach complaints to.');
    if (!sitios.length) throw new Error('No sitios found; seed sitios first.');

    console.log('Seeding complaints: 10 per sitio (named sitios)...');
    const complaintsPerSitio: any[] = [];
    for (const sitio of sitios) {
      for (let i = 0; i < 10; i++) {
        const resident = pick(residents);
        const category = pick(categories);
        complaintsPerSitio.push({
          resident_id: resident._id,
          title: `${category} at ${sitio.name} #${i + 1}`,
          category,
          date_of_report: randomPastDate(),
          complaint_content: `${category} issue reported in ${sitio.name}.`,
          attachments: [],
          status: randomStatus(),
          priority: randomPriority(),
          sitio_id: sitio._id,
          sitio_code: sitio.code,
          created_at: randomPastDate(),
          updated_at: new Date(),
        });
      }
    }
    await Complaint.insertMany(complaintsPerSitio);
    console.log(`Inserted ${complaintsPerSitio.length} complaints by sitio.`);

    console.log('Seeding complaints: 10 per employee (admin/staff)...');
    const complaintsPerEmployee: any[] = [];
    for (const employee of staff) {
      for (let i = 0; i < 10; i++) {
        const resident = pick(residents);
        const sitio = pick(sitios);
        const category = pick(categories);
        complaintsPerEmployee.push({
          resident_id: resident._id,
          title: `${category} (created by ${employee.user_type}) #${i + 1}`,
          category,
          date_of_report: randomPastDate(),
          complaint_content: `${category} recorded by staff/admin.`,
          attachments: [],
          status: randomStatus(),
          priority: randomPriority(),
          sitio_id: sitio._id,
          sitio_code: sitio.code,
          created_by_admin: true,
          admin_id: employee._id,
          created_at: randomPastDate(),
          updated_at: new Date(),
        });
      }
    }
    if (complaintsPerEmployee.length) {
      await Complaint.insertMany(complaintsPerEmployee);
    }
    console.log(`Inserted ${complaintsPerEmployee.length} complaints by employee.`);

    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  run();
}


