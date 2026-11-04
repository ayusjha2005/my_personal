const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('admin/login', {
    pageTitle: 'Admin Login · Ayush Jha',
    error: req.session.error || null,
  });
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      req.session.error = 'Please provide both username/email and password.';
      return res.redirect('/admin/login');
    }

    const cleanIdentifier = username.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      req.session.error = 'Invalid credentials.';
      return res.redirect('/admin/login');
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      req.session.error = 'Invalid credentials.';
      return res.redirect('/admin/login');
    }

    // Set user session
    req.session.userId = user._id;
    req.session.userName = user.username;
    req.session.userRole = user.role;
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const returnUrl = req.session.returnTo || '/admin';
    delete req.session.returnTo;

    return res.redirect(returnUrl);
  } catch (err) {
    console.error('Login error:', err);
    req.session.error = 'An error occurred during authentication.';
    return res.redirect('/admin/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};
