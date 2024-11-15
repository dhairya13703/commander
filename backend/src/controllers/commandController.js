import { Command } from '../models/Command.js';

export const getAllCommands = async (req, res) => {
  try {
    const query = { user: req.user._id };
    
    // Add mainFolder filter if provided
    if (req.query.mainFolder) {
      query.mainFolder = req.query.mainFolder;
    }
    
    // Add subFolder filter if provided
    if (req.query.subFolder) {
      query.subFolder = req.query.subFolder;
    }

    const commands = await Command.find(query)
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
    
    if (!q) {
      return res.json([]);
    }

    const commands = await Command.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { command: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .populate('mainFolder', 'name')
    .populate('subFolder', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: 'Error searching commands', error: error.message });
  }
};

export const batchCreateCommands = async (req, res) => {
  try {
    const { commands } = req.body;
    
    // Add user ID to each command
    const commandsWithUser = commands.map(command => ({
      ...command,
      user: req.user._id
    }));

    // Insert all commands
    const result = await Command.insertMany(commandsWithUser);
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error importing commands', error: error.message });
  }
};

