require('dotenv').config();
const { connectDB, closeDB } = require('./src/config/database');
const createApp = require('./src/app');
const Blog = require('./src/models/Blog');
const Project = require('./src/models/Project');
const User = require('./src/models/User');
const { initialBlogs, initialProjects } = require('./src/utils/seedData');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Ensure default admin and initial content exist
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No admin user found. Creating initial admin account...');
      const username = process.env.ADMIN_USERNAME || 'ayush';
      const email = process.env.ADMIN_EMAIL || 'reach2kr.ayush@gmail.com';
      const password = process.env.ADMIN_PASSWORD || 'admin123456';
      const passwordHash = await User.hashPassword(password);
      await User.create({ username, email, passwordHash, role: 'admin' });
      console.log(`Created admin: ${username} (${email}) with password: [REDACTED]`);
    }

    const blogCount = await Blog.countDocuments({});
    if (blogCount === 0) {
      console.log('No blogs found in database. Seeding initial articles...');
      for (const b of initialBlogs) {
        await Blog.create(b);
      }
      console.log(`Successfully seeded ${initialBlogs.length} initial articles!`);
    }

    const projectCount = await Project.countDocuments({});
    if (projectCount === 0) {
      console.log('No projects found in database. Seeding initial projects...');
      for (const p of initialProjects) {
        await Project.create(p);
      }
      console.log(`Successfully seeded ${initialProjects.length} initial projects!`);
    }

    // 3. Initialize and Start Express App
    const app = createApp();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(` Ayush Jha's Tech Blog Server is running!`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Admin: http://localhost:${PORT}/admin`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await closeDB();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err) {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  }
}

startServer();
