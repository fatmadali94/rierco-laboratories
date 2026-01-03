// controllers/receptoryRecordsController.js
import * as receptoryModel from '../models/receptoryModel.js';

export async function getAllReceptoryRecords(req, res) {
  try {
    const receptoryRecords = await receptoryModel.getAllReceptoryRecords();
    res.status(200).json(receptoryRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching receptory records' });
  }
}

export async function getReceptoryRecordByEntryCode(req, res) {
  try {
    console.log('Fetching receptory record by EntryCode:', req.params.entry_code);
    const receptoryRecord = await receptoryModel.getReceptoryRecordByEntryCode(req.params.entry_code);
    if (!receptoryRecord) {
      return res.status(404).json({ message: 'Receptory record not found' });
    }
    res.status(200).json(receptoryRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching receptory record' });
  }
}


export async function createReceptoryRecord(req, res) {
  try {
    const { entry_code } = req.body;
    const newRecord = await receptoryModel.createReceptoryRecord(entry_code);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error creating receptory record' 
    });
  }
}

export async function updateReceptoryRecordByEntryCode(req, res) {
  try {
    const { entry_code } = req.params;
    const updatedRecord = await receptoryModel.updateReceptoryRecordByEntryCode(entry_code, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Receptory record not found' });
    }
    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error updating receptory record' 
    });
  }
}

// export async function deleteReceptoryRecord(req, res) {
//   try {
//     const deletedRecord = await receptoryModel.deleteReceptoryRecord(req.params.entry_code);
//     if (!deletedRecord) {
//       return res.status(404).json({ message: 'Receptory record not found' });
//     }
//     res.status(200).json({ 
//       message: 'Receptory record deleted', 
//       deleted: deletedRecord 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error deleting receptory record' });
//   }
// }


export async function searchReceptoryRecordsByPartialCode(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await receptoryModel.searchReceptoryRecordsByPartialCode(q);
    res.status(200).json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Error searching receptory records' });
  }
}