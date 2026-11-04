const Blog = require('../models/Blog');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Analytics = require('../models/Analytics');
const Comment = require('../models/Comment');
const Setting = require('../models/Setting');
const User = require('../models/User');
const { formatDate } = require('../utils/helpers');
const upload = require('../middleware/upload');

/**
 * Returns the public URL of an uploaded file.
 * Cloudinary: req.file.path  (full HTTPS URL)
 * Local disk:  /uploads/<filename>
 */
function fileUrl(file) {
  if (!file) return null;
  // Cloudinary storage sets file.path to the secure URL
  if (file.path && file.path.startsWith('http')) return file.path;
  return `/uploads/${file.filename}`;
}

/**
 * Deletes a Cloudinary asset by its URL (best-effort, non-fatal).
 * Does nothing if the URL is not a Cloudinary URL.
 */
async function deleteCloudinaryAsset(url) {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    const cloudinary = upload._cloudinary;
    if (!cloudinary) return;
    // Extract public_id from URL: everything between /upload/ and the extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    if (match && match[1]) {
      await cloudinary.uploader.destroy(match[1]);
    }
  } catch (err) {
    console.warn('[Cloudinary] Could not delete asset:', url, err.message);
  }
}

/**
 * Admin Dashboard Overview
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      publishedBlogsCount,
      draftsCount,
      projectsCount,
      totalViewsAgg,
      unreadContactsCount,
      totalContactsCount,
      totalCommentsCount,
      recentContacts,
      popularBlogs,
      recentBlogs,
    ] = await Promise.all([
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Project.countDocuments({}),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Contact.countDocuments({ status: 'unread' }),
      Contact.countDocuments({}),
      Comment.countDocuments({}),
      Contact.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      Blog.find({ status: 'published' }).sort({ views: -1 }).limit(5).lean(),
      Blog.find({}).sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    const totalBlogViews = totalViewsAgg.length > 0 ? totalViewsAgg[0].total : 0;

    res.render('admin/dashboard', {
      pageTitle: 'Dashboard · Admin',
      activeTab: 'dashboard',
      stats: {
        publishedBlogsCount,
        draftsCount,
        projectsCount,
        totalBlogViews,
        unreadContactsCount,
        totalContactsCount,
        totalCommentsCount,
      },
      recentContacts,
      popularBlogs,
      recentBlogs,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= BLOG MANAGEMENT ================= */

exports.getBlogs = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && ['published', 'draft'].includes(status)) {
      filter.status = status;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();

    res.render('admin/blogs/index', {
      pageTitle: 'Manage Blogs · Admin',
      activeTab: 'blogs',
      blogs,
      categories: Blog.CATEGORIES,
      activeStatus: status || 'all',
      activeCategory: category || 'All',
      searchQuery: search || '',
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

exports.getNewBlog = (req, res) => {
  res.render('admin/blogs/form', {
    pageTitle: 'Create New Article · Admin',
    activeTab: 'blogs',
    isEdit: false,
    blog: {
      title: '',
      slug: '',
      category: Blog.CATEGORIES[0],
      tags: [],
      excerpt: '',
      content: '',
      coverImage: '',
      status: 'draft',
      featured: false,
      seoTitle: '',
      seoDescription: '',
    },
    categories: Blog.CATEGORIES,
  });
};

exports.postNewBlog = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      tags,
      excerpt,
      content,
      status,
      featured,
      seoTitle,
      seoDescription,
    } = req.body;

    const coverImage = fileUrl(req.file) || '';

    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newBlog = new Blog({
      title: title.trim(),
      slug: slug ? slug.trim() : undefined,
      category,
      tags: tagsArray,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      status: status === 'published' ? 'published' : 'draft',
      featured: featured === 'on' || featured === true || featured === 'true',
      seoTitle: seoTitle ? seoTitle.trim() : title.trim(),
      seoDescription: seoDescription ? seoDescription.trim() : excerpt.trim(),
      publishedAt: status === 'published' ? new Date() : null,
    });

    await newBlog.save();
    req.session.success = `Article "${newBlog.title}" successfully created!`;
    res.redirect('/admin/blogs');
  } catch (err) {
    console.error('Error creating blog:', err);
    req.session.error = err.message || 'Failed to create article.';
    res.redirect('/admin/blogs/new');
  }
};

exports.getEditBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).lean();
    if (!blog) {
      req.session.error = 'Article not found.';
      return res.redirect('/admin/blogs');
    }

    res.render('admin/blogs/form', {
      pageTitle: `Edit: ${blog.title} · Admin`,
      activeTab: 'blogs',
      isEdit: true,
      blog,
      categories: Blog.CATEGORIES,
    });
  } catch (err) {
    next(err);
  }
};

exports.putEditBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
      tags,
      excerpt,
      content,
      status,
      featured,
      seoTitle,
      seoDescription,
    } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      req.session.error = 'Article not found.';
      return res.redirect('/admin/blogs');
    }

    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    blog.title = title.trim();
    if (slug) blog.slug = slug.trim();
    blog.category = category;
    blog.tags = tagsArray;
    blog.excerpt = excerpt.trim();
    blog.content = content.trim();
    blog.status = status === 'published' ? 'published' : 'draft';
    blog.featured = featured === 'on' || featured === true || featured === 'true';
    blog.seoTitle = seoTitle ? seoTitle.trim() : title.trim();
    blog.seoDescription = seoDescription ? seoDescription.trim() : excerpt.trim();

    if (req.file) {
      // Delete the old image from Cloudinary when it is replaced
      await deleteCloudinaryAsset(blog.coverImage);
      blog.coverImage = fileUrl(req.file);
    }

    if (blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();
    req.session.success = `Article "${blog.title}" updated successfully!`;
    res.redirect('/admin/blogs');
  } catch (err) {
    console.error('Error updating blog:', err);
    req.session.error = err.message || 'Failed to update article.';
    res.redirect(`/admin/blogs/edit/${req.params.id}`);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (blog) {
      req.session.success = `Article "${blog.title}" was deleted.`;
    }
    res.redirect('/admin/blogs');
  } catch (err) {
    next(err);
  }
};

/* ================= PROJECT MANAGEMENT ================= */

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.render('admin/projects/index', {
      pageTitle: 'Manage Projects · Admin',
      activeTab: 'projects',
      projects,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

exports.getNewProject = (req, res) => {
  res.render('admin/projects/form', {
    pageTitle: 'Add New Project · Admin',
    activeTab: 'projects',
    isEdit: false,
    project: {
      title: '',
      slug: '',
      description: '',
      technologies: [],
      image: '',
      githubUrl: '',
      liveUrl: '',
      featured: true,
      order: 0,
    },
  });
};

exports.postNewProject = async (req, res, next) => {
  try {
    const { title, slug, description, technologies, githubUrl, liveUrl, featured, order } = req.body;
    const image = fileUrl(req.file) || '';
    const techArray = technologies
      ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newProject = new Project({
      title: title.trim(),
      slug: slug ? slug.trim() : undefined,
      description: description.trim(),
      technologies: techArray,
      image,
      githubUrl: (githubUrl || '').trim(),
      liveUrl: (liveUrl || '').trim(),
      featured: featured === 'on' || featured === true || featured === 'true',
      order: parseInt(order) || 0,
    });

    await newProject.save();
    req.session.success = `Project "${newProject.title}" created successfully!`;
    res.redirect('/admin/projects');
  } catch (err) {
    console.error('Error creating project:', err);
    req.session.error = err.message || 'Failed to create project.';
    res.redirect('/admin/projects/new');
  }
};

exports.getEditProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).lean();
    if (!project) {
      req.session.error = 'Project not found.';
      return res.redirect('/admin/projects');
    }

    res.render('admin/projects/form', {
      pageTitle: `Edit: ${project.title} · Admin`,
      activeTab: 'projects',
      isEdit: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

exports.putEditProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, description, technologies, githubUrl, liveUrl, featured, order } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      req.session.error = 'Project not found.';
      return res.redirect('/admin/projects');
    }

    const techArray = technologies
      ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    project.title = title.trim();
    if (slug) project.slug = slug.trim();
    project.description = description.trim();
    project.technologies = techArray;
    project.githubUrl = (githubUrl || '').trim();
    project.liveUrl = (liveUrl || '').trim();
    project.featured = featured === 'on' || featured === true || featured === 'true';
    project.order = parseInt(order) || 0;

    if (req.file) {
      // Delete the old image from Cloudinary when it is replaced
      await deleteCloudinaryAsset(project.image);
      project.image = fileUrl(req.file);
    }

    await project.save();
    req.session.success = `Project "${project.title}" updated successfully!`;
    res.redirect('/admin/projects');
  } catch (err) {
    console.error('Error updating project:', err);
    req.session.error = err.message || 'Failed to update project.';
    res.redirect(`/admin/projects/edit/${req.params.id}`);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (project) {
      req.session.success = `Project "${project.title}" deleted.`;
    }
    res.redirect('/admin/projects');
  } catch (err) {
    next(err);
  }
};

/* ================= CONTACT MANAGEMENT ================= */

exports.getContacts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['unread', 'read'].includes(status)) {
      filter.status = status;
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 }).lean();

    res.render('admin/contacts/index', {
      pageTitle: 'Contact Messages · Admin',
      activeTab: 'contacts',
      contacts,
      activeStatus: status || 'all',
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

exports.postToggleContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (contact) {
      contact.status = contact.status === 'unread' ? 'read' : 'unread';
      await contact.save();
      req.session.success = `Message marked as ${contact.status}.`;
    }
    res.redirect('/admin/contacts');
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    req.session.success = 'Message deleted.';
    res.redirect('/admin/contacts');
  } catch (err) {
    next(err);
  }
};

/* ================= ANALYTICS ================= */

exports.getAnalytics = async (req, res, next) => {
  try {
    const [popularBlogs, dailyAnalytics, totalViewsAgg] = await Promise.all([
      Blog.find({ status: 'published' }).sort({ views: -1 }).limit(10).lean(),
      Analytics.find({}).sort({ date: -1 }).limit(30).lean(),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    const totalViews = totalViewsAgg.length > 0 ? totalViewsAgg[0].total : 0;

    res.render('admin/analytics/index', {
      pageTitle: 'Analytics Overview · Admin',
      activeTab: 'analytics',
      popularBlogs,
      dailyAnalytics,
      totalViews,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= COMMENTS MANAGEMENT ================= */

exports.getComments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && ['approved', 'spam'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { author: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const comments = await Comment.find(filter)
      .populate('blogId', 'title slug')
      .sort({ createdAt: -1 })
      .lean();

    res.render('admin/comments/index', {
      pageTitle: 'Comments Moderation · Admin',
      activeTab: 'comments',
      comments,
      activeStatus: status || 'all',
      searchQuery: search || '',
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    req.session.success = 'Comment deleted successfully.';
    res.redirect('/admin/comments');
  } catch (err) {
    next(err);
  }
};

exports.postToggleCommentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (comment) {
      comment.status = comment.status === 'approved' ? 'spam' : 'approved';
      await comment.save();
      req.session.success = `Comment marked as ${comment.status}.`;
    }
    res.redirect('/admin/comments');
  } catch (err) {
    next(err);
  }
};

/* ================= SITE SETTINGS ================= */

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSettings();
    res.render('admin/settings/index', {
      pageTitle: 'Site Settings & Preferences · Admin',
      activeTab: 'settings',
      settings,
    });
  } catch (err) {
    next(err);
  }
};

exports.postSettings = async (req, res, next) => {
  try {
    const {
      siteTitle,
      ownerName,
      tagline,
      bio,
      contactEmail,
      githubUrl,
      linkedinUrl,
      instagramUrl,
      xUrl,
      allowComments,
      showRobot,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    settings.siteTitle = (siteTitle || '').trim() || 'Ayush Jha · tech blog';
    settings.ownerName = (ownerName || '').trim() || 'Ayush Jha';
    settings.tagline = (tagline || '').trim() || 'exploring technology · building things · sharing what I learn';
    settings.bio = (bio || '').trim();
    settings.contactEmail = (contactEmail || '').trim() || 'reach2kr.ayush@gmail.com';
    settings.githubUrl = (githubUrl || '').trim();
    settings.linkedinUrl = (linkedinUrl || '').trim();
    settings.instagramUrl = (instagramUrl || '').trim();
    settings.xUrl = (xUrl || '').trim();
    settings.allowComments = allowComments === 'on' || allowComments === true || allowComments === 'true';
    settings.showRobot = showRobot === 'on' || showRobot === true || showRobot === 'true';

    await settings.save();
    Setting.clearCache();

    // Check if admin requested a password change
    if (newPassword && newPassword.trim()) {
      if (newPassword !== confirmPassword) {
        req.session.error = 'Settings saved, but new passwords do not match!';
        return res.redirect('/admin/settings');
      }
      if (newPassword.length < 6) {
        req.session.error = 'Settings saved, but new password must be at least 6 characters.';
        return res.redirect('/admin/settings');
      }

      const adminUser = await User.findById(req.session.user._id);
      if (adminUser) {
        const isMatch = await adminUser.isValidPassword(currentPassword);
        if (!isMatch) {
          req.session.error = 'Settings saved, but current password was incorrect!';
          return res.redirect('/admin/settings');
        }
        adminUser.passwordHash = await User.hashPassword(newPassword);
        await adminUser.save();
        req.session.success = 'Site settings and admin password updated successfully!';
        return res.redirect('/admin/settings');
      }
    }

    req.session.success = 'Site settings updated successfully!';
    res.redirect('/admin/settings');
  } catch (err) {
    console.error('Error saving settings:', err);
    req.session.error = err.message || 'Failed to update settings.';
    res.redirect('/admin/settings');
  }
};
