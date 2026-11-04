require('dotenv').config();
const { connectDB, closeDB } = require('../src/config/database');
const User = require('../src/models/User');

async function initAdmin() {
  try {
    await connectDB();

    const username = process.env.ADMIN_USERNAME || 'ayush';
    const email = process.env.ADMIN_EMAIL || 'reach2kr.ayush@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123456';

    let admin = await User.findOne({ username });

    if (admin) {
      console.log(`Admin user "${username}" already exists.`);
      if (process.env.ADMIN_RESET_PASSWORD === 'true') {
        admin.passwordHash = await User.hashPassword(password);
        await admin.save();
        console.log(`Password for "${username}" has been reset.`);
      }
    } else {
      const passwordHash = await User.hashPassword(password);
      admin = await User.create({
        username,
        email,
        passwordHash,
        role: 'admin',
      });
      console.log(`Successfully created admin user: ${username} (${email})`);
    }

    console.log('Admin account ready.');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error('Error initializing admin:', err.message);
  } finally {
    await closeDB();
  }
}

if (require.main === module) {
  initAdmin();
}

module.exports = initAdmin;
