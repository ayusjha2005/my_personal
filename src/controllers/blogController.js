const Blog = require('../models/Blog');
const Analytics = require('../models/Analytics');
const Comment = require('../models/Comment');
const { formatDate, renderContent, extractToc } = require('../utils/helpers');

/**
 * Public: List published blogs (SSR)
 */
exports.getBlogs = async (req, res, next) => {
  try {
    const { category, search, sort = 'newest', page = 1 } = req.query;
    const limit = 10;
    const currentPage = Math.max(1, parseInt(page) || 1);
    const skip = (currentPage - 1) * limit;

    const filter = { status: 'published' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const sortOption = sort === 'oldest' ? { publishedAt: 1 } : { publishedAt: -1 };

    const [blogs, totalBlogs, categories] = await Promise.all([
      Blog.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      Blog.countDocuments(filter),
      Blog.distinct('category', { status: 'published' }),
    ]);

    const totalPages = Math.ceil(totalBlogs / limit) || 1;

    res.render('blogs/list', {
      pageTitle: 'Technical Blogs · Ayush Jha',
      metaDescription: 'In-depth notes on backend engineering, data structures, systems, and databases by Ayush Jha.',
      blogs,
      categories: Blog.CATEGORIES,
      activeCategory: category || 'All',
      searchQuery: search || '',
      currentSort: sort,
      currentPage,
      totalPages,
      totalBlogs,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Single Blog post (SSR)
 */
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).render('pages/404', {
        pageTitle: 'Blog Not Found · 404',
        message: 'The blog article you are looking for does not exist or may have been moved.',
      });
    }

    // If draft, only accessible by logged-in admin
    if (blog.status === 'draft' && (!req.session || req.session.userRole !== 'admin')) {
      return res.status(404).render('pages/404', {
        pageTitle: 'Blog Not Found · 404',
        message: 'This article is currently an unpublished draft.',
      });
    }

    // Debounced View Tracking
    const viewSessionKey = `viewed_blog_${blog._id}`;
    if (!req.session[viewSessionKey] && (!req.session || req.session.userRole !== 'admin')) {
      req.session[viewSessionKey] = true;
      blog.views += 1;
      await blog.save();

      // Record daily analytics
      const todayStr = new Date().toISOString().split('T')[0];
      await Analytics.findOneAndUpdate(
        { path: `/blog/${blog.slug}`, date: todayStr },
        {
          $inc: { views: 1 },
          $set: { blogId: blog._id, slug: blog.slug },
        },
        { upsert: true, new: true }
      ).catch(() => {});
    }

    // Render HTML content and TOC
    const renderedHtml = renderContent(blog.content);
    const toc = extractToc(renderedHtml);

    // Fetch related blogs (prefer same category, fallback to recent published)
    let relatedBlogs = await Blog.find({
      status: 'published',
      _id: { $ne: blog._id },
      category: blog.category,
    })
      .sort({ publishedAt: -1 })
      .limit(2)
      .lean();

    if (relatedBlogs.length === 0) {
      relatedBlogs = await Blog.find({
        status: 'published',
        _id: { $ne: blog._id },
      })
        .sort({ publishedAt: -1 })
        .limit(2)
        .lean();
    }

    // Previous and Next blogs
    const [prevBlog, nextBlog] = await Promise.all([
      Blog.findOne({ status: 'published', publishedAt: { $lt: blog.publishedAt } })
        .sort({ publishedAt: -1 })
        .select('title slug')
        .lean(),
      Blog.findOne({ status: 'published', publishedAt: { $gt: blog.publishedAt } })
        .sort({ publishedAt: 1 })
        .select('title slug')
        .lean(),
    ]);

    // Fetch approved comments for this writing
    const comments = await Comment.find({ blogId: blog._id, status: 'approved' })
      .sort({ createdAt: -1 })
      .lean();

    res.render('blogs/detail', {
      pageTitle: `${blog.seoTitle || blog.title} · Ayush Jha`,
      metaDescription: blog.seoDescription || blog.excerpt,
      blog,
      renderedHtml,
      toc,
      comments,
      relatedBlogs,
      prevBlog,
      nextBlog,
      formatDate,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * REST API: List posts (JSON) for dynamic frontend searching
 */
exports.apiGetPosts = async (req, res) => {
  try {
    const { category, search, sort = 'newest' } = req.query;
    const filter = { status: 'published' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const sortOption = sort === 'oldest' ? { publishedAt: 1 } : { publishedAt: -1 };
    const posts = await Blog.find(filter).sort(sortOption).lean();

    // Map to client-expected format
    const formatted = posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : p.createdAt.toISOString().split('T')[0],
      category: p.category,
      tags: p.tags,
      views: p.views,
      likes: p.likes,
      readTime: p.readTime,
      body: renderContent(p.content),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * REST API: Single post details (JSON)
 */
exports.apiGetPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Blog.findOne({ slug, status: 'published' }).lean();
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.publishedAt ? post.publishedAt.toISOString().split('T')[0] : post.createdAt.toISOString().split('T')[0],
      category: post.category,
      tags: post.tags,
      views: post.views,
      likes: post.likes,
      readTime: post.readTime,
      body: renderContent(post.content),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load post' });
  }
};

/**
 * REST API: Like a post
 */
exports.apiLikePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const { liked } = req.body;

    const inc = liked ? 1 : -1;
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { likes: inc } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ success: true, likes: Math.max(0, blog.likes) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update likes' });
  }
};

/**
 * REST API: Track view
 */
exports.apiTrackView = async (req, res) => {
  try {
    const { slug } = req.params;
    const isAdmin = req.session && req.session.userRole === 'admin';

    if (!isAdmin) {
      const blog = await Blog.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } },
        { new: true }
      );
      if (blog) {
        const todayStr = new Date().toISOString().split('T')[0];
        await Analytics.findOneAndUpdate(
          { path: `/blog/${slug}`, date: todayStr },
          { $inc: { views: 1 }, $set: { blogId: blog._id, slug: blog.slug } },
          { upsert: true }
        ).catch(() => {});
        return res.json({ success: true, views: blog.views });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track view' });
  }
};

/**
 * Public: Post a comment on an article
 */
exports.postComment = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { author, email, content, honeypot } = req.body;

    // Honeypot spam trap
    if (honeypot) {
      return res.redirect(`/writings/${slug}#comments`);
    }

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).render('pages/404', {
        pageTitle: 'Writing Not Found · 404',
        message: 'Writing not found',
      });
    }

    if (!content || content.trim().length < 2) {
      req.session.error = 'Comment must be at least 2 characters long.';
      return res.redirect(`/writings/${slug}#comments`);
    }

    await Comment.create({
      blogId: blog._id,
      author: author && author.trim() ? author.trim() : 'Reader',
      email: email && email.trim() ? email.trim() : '',
      content: content.trim(),
      status: 'approved',
    });

    req.session.success = 'Thank you! Your comment has been posted.';
    res.redirect(`/writings/${slug}#comments`);
  } catch (err) {
    next(err);
  }
};

/**
 * REST API: Like a comment
 */
exports.apiLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ success: true, likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like comment' });
  }
};
