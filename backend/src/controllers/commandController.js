import { Command } from '../models/Command.js';

export const getAllCommands = async (req, res) => {
  try {
    const commands = await Command.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching commands', error: error.message });
  }
};

export const getCommand = async (req, res) => {
  try {
    const command = await Command.findOne({ _id: req.params.id, user: req.user._id });
    if (!command) {
      return res.status(404).json({ message: 'Command not found' });
    }
    res.json(command);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching command', error: error.message });
  }
};

export const createCommand = async (req, res) => {
  try {
    const command = await Command.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(command);
  } catch (error) {
    res.status(500).json({ message: 'Error creating command', error: error.message });
  }
};

export const updateCommand = async (req, res) => {
  try {
    const command = await Command.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!command) {
      return res.status(404).json({ message: 'Command not found' });
    }
    res.json(command);
  } catch (error) {
    res.status(500).json({ message: 'Error updating command', error: error.message });
  }
};

export const deleteCommand = async (req, res) => {
  try {
    const command = await Command.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!command) {
      return res.status(404).json({ message: 'Command not found' });
    }

    res.json({ message: 'Command deleted successfully' });
  } catch (error) {
    console.error('Error deleting command:', error);
    res.status(500).json({ message: 'Error deleting command' });
  }
};

export const searchCommands = async (req, res) => {
  try {
    const { q } = req.query;
    const commands = await Command.find({
      user: req.user._id,
      $text: { $search: q }
    }).sort({ score: { $meta: 'textScore' } });
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: 'Error searching commands', error: error.message });
  }
};