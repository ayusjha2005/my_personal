require('dotenv').config();
const { connectDB, closeDB } = require('../src/config/database');
const Blog = require('../src/models/Blog');
const Project = require('../src/models/Project');
const User = require('../src/models/User');
const { initialBlogs, initialProjects } = require('../src/utils/seedData');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('--- Starting Database Seed ---');

    // 1. Seed Admin
    const username = process.env.ADMIN_USERNAME || 'ayush';
    const email = process.env.ADMIN_EMAIL || 'ayush@ayushjha.dev';
    const password = process.env.ADMIN_PASSWORD || 'admin123456';

    const existingAdmin = await User.findOne({ username });
    if (!existingAdmin) {
      const passwordHash = await User.hashPassword(password);
      await User.create({ username, email, passwordHash, role: 'admin' });
      console.log(`Created default admin: ${username}`);
    } else {
      console.log(`Admin user "${username}" already exists.`);
    }

    // 2. Seed Blogs
    console.log(`Checking blogs to seed (${initialBlogs.length} articles)...`);
    for (const blogData of initialBlogs) {
      const existing = await Blog.findOne({ slug: blogData.slug });
      if (!existing) {
        await Blog.create(blogData);
        console.log(`+ Seeded blog [${blogData.status}]: "${blogData.title}"`);
      } else {
        console.log(`= Blog already exists: "${blogData.title}"`);
      }
    }

    // 3. Seed Projects
    console.log(`Checking projects to seed (${initialProjects.length} projects)...`);
    for (const projectData of initialProjects) {
      const existing = await Project.findOne({ slug: projectData.slug });
      if (!existing) {
        await Project.create(projectData);
        console.log(`+ Seeded project: "${projectData.title}"`);
      } else {
        console.log(`= Project already exists: "${projectData.title}"`);
      }
    }

    console.log('--- Database Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await closeDB();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
