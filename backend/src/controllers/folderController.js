// backend/src/controllers/folderController.js
import { MainFolder, SubFolder, Command } from '../models/index.js';

// Main Folder Controllers
export const createMainFolder = async (req, res) => {
  try {
    const mainFolder = await MainFolder.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(mainFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating main folder', error: error.message });
  }
};

export const getMainFolders = async (req, res) => {
  try {
    const mainFolders = await MainFolder.find({ user: req.user._id });
    res.json(mainFolders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching main folders', error: error.message });
  }
};

export const updateMainFolder = async (req, res) => {
  try {
    const mainFolder = await MainFolder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!mainFolder) {
      return res.status(404).json({ message: 'Main folder not found' });
    }
    res.json(mainFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating main folder', error: error.message });
  }
};

export const deleteMainFolder = async (req, res) => {
  try {
    const mainFolder = await MainFolder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!mainFolder) {
      return res.status(404).json({ message: 'Main folder not found' });
    }
    // Delete all subfolders and commands in this main folder
    await SubFolder.deleteMany({ mainFolder: req.params.id });
    await Command.deleteMany({ mainFolder: req.params.id });
    res.json({ message: 'Main folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting main folder', error: error.message });
  }
};

// Sub Folder Controllers
export const createSubFolder = async (req, res) => {
  try {
    // Verify main folder exists and belongs to user
    const mainFolder = await MainFolder.findOne({
      _id: req.body.mainFolder,
      user: req.user._id
    });
    if (!mainFolder) {
      return res.status(404).json({ message: 'Main folder not found' });
    }

    const subFolder = await SubFolder.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(subFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sub folder', error: error.message });
  }
};

export const getSubFolders = async (req, res) => {
  try {
    const subFolders = await SubFolder.find({
      mainFolder: req.params.mainFolderId,
      user: req.user._id
    });
    res.json(subFolders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sub folders', error: error.message });
  }
};

export const updateSubFolder = async (req, res) => {
  try {
    const subFolder = await SubFolder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!subFolder) {
      return res.status(404).json({ message: 'Sub folder not found' });
    }
    res.json(subFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating sub folder', error: error.message });
  }
};

export const deleteSubFolder = async (req, res) => {
  try {
    const subFolder = await SubFolder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!subFolder) {
      return res.status(404).json({ message: 'Sub folder not found' });
    }
    // Delete all commands in this subfolder
    await Command.deleteMany({ subFolder: req.params.id });
    res.json({ message: 'Sub folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sub folder', error: error.message });
  }
};

// Get single main folder
export const getMainFolder = async (req, res) => {
  try {
    const mainFolder = await MainFolder.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!mainFolder) {
      return res.status(404).json({ message: 'Main folder not found' });
    }
    res.json(mainFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching main folder', error: error.message });
  }
};

// Get single sub folder
export const getSubFolder = async (req, res) => {
  try {
    const subFolder = await SubFolder.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!subFolder) {
      return res.status(404).json({ message: 'Sub folder not found' });
    }
    res.json(subFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sub folder', error: error.message });
  }
};