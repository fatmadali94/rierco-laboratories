// controllers/depositoryRecordsController.js
import * as depositoryModel from "../models/depositoryModel.js"

export async function getAllDepositoryRecords(req, res) {
  try {
    const depositoryRecords = await depositoryModel.getAllDepositoryRecords();
    res.status(200).json(depositoryRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching depository records' });
  }
}

export async function getDepositoryRecordByEntryCode(req, res) {
  try {
    console.log('Fetching depository record by EntryCode:', req.params.entry_code);
    const depositoryRecord = await depositoryModel.getDepositoryRecordByEntryCode(req.params.entry_code);
    if (!depositoryRecord) {
      return res.status(404).json({ message: 'Depository record not found' });
    }
    res.status(200).json(depositoryRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching depository record' });
  }
}


export async function createDepositoryRecord(req, res) {
  try {
    const { entry_code } = req.body;
    const newRecord = await depositoryModel.createDepositoryRecord(entry_code);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error creating depository record' 
    });
  }
}

export async function updateDepositoryRecordByEntryCode(req, res) {
  try {
    const { entry_code } = req.params;
    const updatedRecord = await depositoryModel.updateDepositoryRecordByEntryCode(entry_code, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Depository record not found' });
    }
    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error updating depository record' 
    });
  }
}

// export async function deleteDepositoryRecord(req, res) {
//   try {
//     const deletedRecord = await depositoryModel.deleteDepositoryRecord(req.params.entry_code);
//     if (!deletedRecord) {
//       return res.status(404).json({ message: 'Depository record not found' });
//     }
//     res.status(200).json({ 
//       message: 'Depository record deleted', 
//       deleted: deletedRecord 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error deleting depository record' });
//   }
// }


export async function searchDepositoryRecordsByPartialCode(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await depositoryModel.searchDepositoryRecordsByPartialCode(q);
    res.status(200).json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Error searching depository records' });
  }
}