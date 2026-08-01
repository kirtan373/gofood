// Creates (or updates) a default admin account so you can log into /admin/login.
// Run with:  node seedAdmin.js
// Then log in with the email/password printed below (change them via the
// ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME env vars if you want different ones).

const mongoose = require('mongoose');
const mongoDB = require('./db');
const Admin = require('./models/Admin');

const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mitho.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const run = async () => {
  try {
    await mongoDB();

    let admin = await Admin.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD; // pre('save') hook re-hashes this
      admin.isActive = true;
      await admin.save();
      console.log('✅ Existing admin updated.');
    } else {
      admin = await Admin.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin account created.');
    }

    console.log('----------------------------------------');
    console.log('Admin login credentials:');
    console.log('  Email:   ', ADMIN_EMAIL);
    console.log('  Password:', ADMIN_PASSWORD);
    console.log('----------------------------------------');
    console.log('Log in at /admin/login. Please change this password afterwards.');

    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
};

run();
