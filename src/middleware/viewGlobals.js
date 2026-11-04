const Setting = require('../models/Setting');
const profile = require('../config/profile');

module.exports = async function viewGlobals(req, res, next) {
  res.locals.profile = profile;

  try {
    const settings = await Setting.getSettings();
    res.locals.settings = settings;
    res.locals.siteTitle = settings.siteTitle || profile.siteTitle;
    res.locals.ownerName = settings.ownerName || profile.name;
    res.locals.tagline = settings.tagline || profile.tagline;
    res.locals.bio = settings.bio || profile.shortBio;
    res.locals.contactEmail = settings.contactEmail || profile.contact.email;
    res.locals.githubUrl = settings.githubUrl || profile.contact.github;
    res.locals.linkedinUrl = settings.linkedinUrl || profile.contact.linkedin;
    res.locals.instagramUrl = settings.instagramUrl || '';
    res.locals.xUrl = settings.xUrl || profile.contact.twitter;
    res.locals.allowComments = typeof settings.allowComments === 'boolean' ? settings.allowComments : true;
    res.locals.showRobot = typeof settings.showRobot === 'boolean' ? settings.showRobot : true;
  } catch (err) {
    res.locals.settings = {};
    res.locals.siteTitle = profile.siteTitle;
    res.locals.ownerName = profile.name;
    res.locals.tagline = profile.tagline;
    res.locals.bio = profile.shortBio;
    res.locals.contactEmail = profile.contact.email;
    res.locals.githubUrl = profile.contact.github;
    res.locals.linkedinUrl = profile.contact.linkedin;
    res.locals.instagramUrl = '';
    res.locals.xUrl = profile.contact.twitter;
    res.locals.allowComments = true;
    res.locals.showRobot = true;
  }

  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.isAdmin = req.session && req.session.userRole === 'admin';
  res.locals.currentPath = req.path;
  res.locals.year = new Date().getFullYear();
  res.locals.messages = {
    error: req.session ? req.session.error : null,
    success: req.session ? req.session.success : null,
  };

  // Clear flash messages after reading
  if (req.session) {
    delete req.session.error;
    delete req.session.success;
  }

  next();
};
