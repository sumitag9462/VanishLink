const mongoose = require('mongoose');

const BiolinkLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String }, // e.g., 'twitter', 'github'
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const BiolinkSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // e.g., vanish.link/bio/sumit
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  profileName: { type: String, required: true },
  bio: { type: String },
  avatarUrl: { type: String },
  theme: {
    backgroundColor: { type: String, default: '#0f172a' },
    textColor: { type: String, default: '#ffffff' },
    buttonColor: { type: String, default: '#1e293b' },
    buttonTextColor: { type: String, default: '#ffffff' }
  },
  links: [BiolinkLinkSchema],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Biolink', BiolinkSchema);
