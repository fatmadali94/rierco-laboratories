// controllers/newEntriesController.js
import * as newEntriesModel from '../models/newEntriesModel.js';

export const getAllNewEntries = async (req, res) => {
  try {
    const entries = await newEntriesModel.getAllNewEntries(); // ✅ use imported model function
    res.status(200).json(entries);
  } catch (error) {
    console.error("❌ Error in getAllNewEntries controller:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to fetch entries", error: error.message });
    }
  }
};


export async function getNewEntryByEntryCode(req, res) {
  try {
    console.log('Fetching newEntry by entry_code:', req.params.entry_code); // ✅ Debug log
    const newEntry = await newEntriesModel.getNewEntryByEntryCode(req.params.entry_code);
    if (!newEntry) return res.status(404).json({ message: 'NewEntry not found' });
    res.status(200).json(newEntry);
  } catch (err) {
    console.error(err); // 👈 See the actual error in terminal
    res.status(500).json({ message: 'Error fetching newEntry' });
  }
}


export async function createNewEntry(req, res) {
  try {
    const newNewEntry = await newEntriesModel.createNewEntry(req.body);
    res.status(201).json(newNewEntry);
  } catch (err) {
    console.error('Error creating new entry:', err);
    res.status(500).json({ 
      message: 'Error creating newEntry',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}


export async function updateNewEntry(req, res) {
  try {
    const updatedNewEntry = await newEntriesModel.updateNewEntry(req.params.entry_code, req.body);
    if (!updatedNewEntry) return res.status(404).json({ message: 'newEntry not found' });
    res.status(200).json(updatedNewEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error updating newEntry' });
  }
}

export async function deleteNewEntry(req, res) {
  try {
    const deletedNewEntry = await newEntriesModel.deleteNewEntry(req.params.entry_code);
    if (!deletedNewEntry) return res.status(404).json({ message: 'NewEntry not found' });
    res.status(200).json({ message: 'newEntry deleted', deleted: deletedNewEntry });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting newEntry' });
  }
}

export async function searchNewEntriesByPartialCode(req, res) {
  try {
    const { q } = req.query; // Get search query from URL params
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const results = await newEntriesModel.searchNewEntriesByPartialCode(q);
    res.status(200).json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Error searching entries' });
  }
}

