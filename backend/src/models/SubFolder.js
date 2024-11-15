// backend/src/models/SubFolder.js
import mongoose from 'mongoose';

const subFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  mainFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainFolder',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const SubFolder = mongoose.model('SubFolder', subFolderSchema);