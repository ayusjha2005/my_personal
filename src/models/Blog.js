const mongoose = require('mongoose');
const slugify = require('slugify');

const CATEGORIES = [
  'Web Development',
  'Backend Engineering',
  'Data Structures and Algorithms',
  'Database Management Systems',
  'Computer Science Fundamentals',
  'Linux and Open Source',
  'Artificial Intelligence',
  'Cloud Computing',
  'Software Engineering',
  'Developer Journey',
];

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: String,
      default: 'Ayush Jha',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 3,
    },
    seoTitle: {
      type: String,
      default: '',
    },
    seoDescription: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug and calculate reading time
blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  }

  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    this.readTime = Math.max(1, Math.round(wordCount / 200));
  }

  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }

  if (!this.seoTitle) {
    this.seoTitle = this.title;
  }
  if (!this.seoDescription) {
    this.seoDescription = this.excerpt;
  }

  next();
});

blogSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Blog', blogSchema);
