import mongoose from 'mongoose';
import dotenv from 'dotenv';
import argon2 from 'argon2';
import User from '../models/User';

dotenv.config();

const resetDatabaseAndSeedUsers = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    console.log('\n🗑️  Resetting database...');
    console.log('='.repeat(50));

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Clearing collection: ${collectionName}`);
      await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`✓ Cleared ${collectionName}`);
    }

    console.log('\n🌱 Seeding users...');
    console.log('='.repeat(50));

    const residents = [
      {
        name: 'Juan Dela Cruz',
        email: 'juan@example.com',
        password: 'password123',
        user_type: 'resident',
        address: '123 Main St',
        birthdate: new Date('1990-01-01'),
        mobile_number: '09171234567',
        approved: true,
        approvedAt: new Date(),
      },
      {
        name: 'Maria Santos',
        email: 'maria@example.com',
        password: 'password123',
        user_type: 'resident',
        address: '456 Second St',
        birthdate: new Date('1985-05-15'),
        mobile_number: '09181234567',
        approved: true,
        approvedAt: new Date(),
      },
      {
        name: 'Pedro Garcia',
        email: 'pedro@example.com',
        password: 'password123',
        user_type: 'resident',
        address: '789 Third St',
        birthdate: new Date('1992-03-20'),
        mobile_number: '09191234567',
        approved: true,
        approvedAt: new Date(),
      },
    ];

    const admins = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpass',
        user_type: 'admin',
        address: 'Barangay Hall',
        birthdate: new Date('1980-12-12'),
        mobile_number: '09991234567',
        approved: true,
        approvedAt: new Date(),
      },
    ];

    const staff = [
      {
        name: 'Staff User',
        email: 'staff@example.com',
        password: 'staffpass',
        user_type: 'staff',
        address: 'Barangay Hall',
        birthdate: new Date('1988-06-15'),
        mobile_number: '09881234567',
        approved: true,
        approvedAt: new Date(),
      },
    ];

    console.log('Hashing passwords...');
    for (const user of residents) {
      user.password = await argon2.hash(user.password);
    }
    for (const user of admins) {
      user.password = await argon2.hash(user.password);
    }
    for (const user of staff) {
      user.password = await argon2.hash(user.password);
    }

    console.log('Creating users...');
    const createdResidents = await User.insertMany(residents);
    const createdAdmins = await User.insertMany(admins);
    const createdStaff = await User.insertMany(staff);

    console.log(`✓ Created ${createdResidents.length} resident users`);
    console.log(`✓ Created ${createdAdmins.length} admin users`);
    console.log(`✓ Created ${createdStaff.length} staff users`);

    console.log('\n📋 User Credentials:');
    console.log('='.repeat(50));
    console.log('Residents:');
    console.log('  - juan@example.com / password123');
    console.log('  - maria@example.com / password123');
    console.log('  - pedro@example.com / password123');
    console.log('\nAdmin:');
    console.log('  - admin@example.com / adminpass');
    console.log('\nStaff:');
    console.log('  - staff@example.com / staffpass');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database reset and user seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

if (require.main === module) {
  resetDatabaseAndSeedUsers();
}

export default resetDatabaseAndSeedUsers;
