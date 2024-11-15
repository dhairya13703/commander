// backend/src/models/Command.js
import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  command: {
    type: String,
    required: true
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
  subFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubFolder'
  },
  tags: [{
    type: String,
    trim: true
  }],
  platform: {
    type: String,
    required: true,
    enum: ['linux', 'macos', 'windows', 'universal']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

commandSchema.index({ title: 'text', description: 'text', command: 'text', tags: 'text' });

export const Command = mongoose.model('Command', commandSchema);