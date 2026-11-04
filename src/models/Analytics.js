const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      index: true,
      default: null,
    },
    slug: {
      type: String,
      default: '',
      index: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 1,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ path: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
