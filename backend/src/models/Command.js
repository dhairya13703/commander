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

const Command = mongoose.model('Command', commandSchema);
export { Command };