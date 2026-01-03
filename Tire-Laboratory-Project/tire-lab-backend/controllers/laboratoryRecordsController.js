// controllers/laboratoryRecordsController.js
import * as laboratoryModel from "../models/laboratoryModel.js"

export async function getAllLaboratoryRecords(req, res) {
  try {
    const laboratoryRecords = await laboratoryModel.getAllLaboratoryRecords();
    res.status(200).json(laboratoryRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching laboratory records' });
  }
}

export async function getLaboratoryRecordByEntryCode(req, res) {
  try {
    console.log('Fetching laboratory record by EntryCode:', req.params.entry_code);
    const laboratoryRecord = await laboratoryModel.getLaboratoryRecordByEntryCode(req.params.entry_code);
    if (!laboratoryRecord) {
      return res.status(404).json({ message: 'Laboratory record not found' });
    }
    res.status(200).json(laboratoryRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching laboratory record' });
  }
}


export async function createLaboratoryRecord(req, res) {
  try {
    const { entry_code } = req.body;
    const newRecord = await laboratoryModel.createLaboratoryRecord(entry_code);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error creating laboratory record' 
    });
  }
}

export async function updateLaboratoryRecordByEntryCode(req, res) {
  try {
    const { entry_code } = req.params;
    const updatedRecord = await laboratoryModel.updateLaboratoryRecordByEntryCode(entry_code, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Laboratory record not found' });
    }
    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error updating laboratory record' 
    });
    console.log("BODY RECEIVED:", req.body);
  }
}

// export async function deleteLaboratoryRecord(req, res) {
//   try {
//     const deletedRecord = await laboratoryModel.deleteLaboratoryRecord(req.params.entry_code);
//     if (!deletedRecord) {
//       return res.status(404).json({ message: 'Laboratory record not found' });
//     }
//     res.status(200).json({ 
//       message: 'Laboratory record deleted', 
//       deleted: deletedRecord 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error deleting laboratory record' });
//   }
// }


export async function searchLaboratoryRecordsByPartialCode(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await laboratoryModel.searchLaboratoryRecordsByPartialCode(q);
    res.status(200).json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Error searching laboratory records' });
  }
}