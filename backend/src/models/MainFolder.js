// backend/src/models/MainFolder.js
import mongoose from 'mongoose';

const mainFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📁'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const MainFolder = mongoose.model('MainFolder', mainFolderSchema);