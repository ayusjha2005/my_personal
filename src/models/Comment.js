const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog ID is required'],
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Your name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
      default: 'Anonymous Reader',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters long'],
      maxlength: [1500, 'Comment cannot exceed 1500 characters'],
    },
    likes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['approved', 'spam'],
      default: 'approved',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);
