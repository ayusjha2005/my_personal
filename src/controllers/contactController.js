const Contact = require('../models/Contact');

/**
 * Public: Contact page (SSR)
 */
exports.getContact = (req, res) => {
  res.render('pages/contact', {
    pageTitle: "Let's Connect · Ayush Jha",
    metaDescription: "Have an interesting idea, a technical question, or want to talk technology? Reach out to Ayush Jha.",
  });
};

/**
 * Handle contact form submission
 */
exports.postContact = async (req, res) => {
  try {
    const { name, email, subject, message, website } = req.body;

    // Honeypot spam protection: if website is filled, silently ignore
    if (website) {
      console.warn('Spam submission detected via honeypot.');
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Message sent successfully.' });
      }
      return res.redirect('/contact?success=1');
    }

    if (!name || !email || !message) {
      const err = 'Please provide your name, valid email, and message.';
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({ error: err });
      }
      req.session.error = err;
      return res.redirect('/contact');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const err = 'Please provide a valid email address.';
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({ error: err });
      }
      req.session.error = err;
      return res.redirect('/contact');
    }

    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      ip: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
    });

    console.log(`New contact message received from ${newContact.name} (${newContact.email})`);

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({
        success: true,
        message: 'Thank you for reaching out! Your message has been received.',
      });
    }

    req.session.success = 'Thank you for reaching out! Your message has been received.';
    return res.redirect('/contact');
  } catch (err) {
    console.error('Contact submission error:', err);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
    req.session.error = 'Failed to send message. Please try again later.';
    return res.redirect('/contact');
  }
};

/**
 * Handle newsletter subscription
 */
exports.postSubscribe = (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Acknowledge subscription
  console.log(`Newsletter subscription from: ${email}`);
  res.json({
    success: true,
    message: 'Subscribed! You will receive updates on new articles.',
  });
};
