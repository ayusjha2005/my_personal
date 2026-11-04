const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default: 'Ayush Jha · tech blog',
      trim: true,
    },
    ownerName: {
      type: String,
      default: 'Ayush Jha',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'exploring technology · building things · sharing what I learn',
      trim: true,
    },
    bio: {
      type: String,
      default:
        'B.Tech in Computer Science and Engineering at VIT. Building scalable systems, exploring backend architecture, and writing about tech.',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'reach2kr.ayush@gmail.com',
      trim: true,
      lowercase: true,
    },
    githubUrl: {
      type: String,
      default: 'https://github.com/ayusjha2005',
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: 'https://www.linkedin.com/in/kumar-ayush-322294385/',
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: '',
      trim: true,
    },
    xUrl: {
      type: String,
      default: 'https://x.com/ayushjha2005',
      trim: true,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    showRobot: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

let cachedSettings = null;
let lastFetch = 0;

settingSchema.statics.getSettings = async function () {
  const now = Date.now();
  if (cachedSettings && now - lastFetch < 15000) {
    return cachedSettings;
  }
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  cachedSettings = settings;
  lastFetch = now;
  return settings;
};

settingSchema.statics.clearCache = function () {
  cachedSettings = null;
  lastFetch = 0;
};

module.exports = mongoose.model('Setting', settingSchema);
