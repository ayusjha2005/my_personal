const Project = require('../models/Project');

/**
 * Public: Projects page (SSR)
 */
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();

    res.render('projects/list', {
      pageTitle: 'Projects & Systems · Ayush Jha',
      metaDescription: 'Software projects, architectures, algorithms, and tools built by Ayush Jha.',
      projects,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * REST API: Get projects list (JSON)
 */
exports.apiGetProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};
