// server/scripts/seedAdminUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vanish_link';

// Hardcoded users to seed/upsert
const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@vanish.link', // NOTE: Using admin@vanish.link from instructions
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Demo Mod',
    email: 'mod@vanish.link',
    role: 'premium',
    status: 'active',
  },
];

async function seed() {
  try {
    console.log('Connecting to DB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    for (const u of seedUsers) {
      console.log(`Upserting ${u.email}...`);
      const updated = await User.findOneAndUpdate(
        { email: u.email },
        { $set: u },
        { upsert: true, new: true }
      );
      console.log(` -> OK. Role: ${updated.role}`);
    }

    console.log('\nSeed complete.');
  } catch (err) {
    console.error('Error seeding admin users:', err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
