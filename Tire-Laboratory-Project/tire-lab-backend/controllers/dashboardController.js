import * as dashboardModel from "../models/dashboardModel.js"

  // 1. Get entry counts by date
  export const getEntryCountsByDate = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);
      
      const data = await dashboardModel.getEntryCountsByDate(validStart, validEnd);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 2. Get rings sum by date
  export const getRingsSumByDate = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);
      
      const data = await dashboardModel.getRingsSumByDate(validStart, validEnd);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }}

  // 3. Get entry counts by size
  export const getEntryCountsBySize = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const { startDate: validStart, endDate: validEnd } = 
      dashboardModel.validateDateRange(startDate, endDate);

    const data = await dashboardModel.getEntryCountsTotalsBySize(validStart, validEnd);

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


  // 4. Get entry counts by brand
  export const getEntryCountsByBrand = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);
      
      const data = await dashboardModel.getEntryCountsByBrand(validStart, validEnd);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 5. Get entry counts by customer
  export const getEntryCountsByCustomer = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);
      
      const data = await dashboardModel.getEntryCountsByCustomer(validStart, validEnd);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 6. Get tests by date
  export const getTestsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const { startDate: validStart, endDate: validEnd } =
      dashboardModel.validateDateRange(startDate, endDate);

    const data = await dashboardModel.getTestsByDate(validStart, validEnd);
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


  // 7. Get entry counts by tire type
  export const getEntryCountsByTireType = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);
      
      const data = await dashboardModel.getEntryCountsByTireType(validStart, validEnd);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 8. Get entry counts by tire group
  export const getEntryCountsByTireGroup = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);
      
      const data = await dashboardModel.getEntryCountsByTireGroup(validStart, validEnd);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 9. Get laboratory confirmation status
  export const getLabConfirmationStatus = async (req, res) => {
    try {
      const data = await dashboardModel.getLabConfirmationStatus();
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 10-18. Get depository sums
export const getDepositorySums = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const data = await dashboardModel.getDepositorySumsTotal(startDate, endDate);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



  // 19. Get all data for Excel export
  export const getAllData = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);

      const data = await dashboardModel.getAllData(validStart, validEnd);
      
      res.json({
        success: true,
        data: data,
        count: data.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


import XLSX from "xlsx";

export const downloadAllData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start and end dates required" });
    }
    
    // Fetch data from DB
    const data = await dashboardModel.getAllData(startDate, endDate);
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }
    
    // Process the data to handle array fields
    const processedData = data.map(row => {
      const processedRow = { ...row };
      
      // Convert array fields to strings
      if (Array.isArray(processedRow.تست)) {
        processedRow.تست = processedRow.تست.join(', ');
      }
      
      if (Array.isArray(processedRow.هفته_سال)) {
        processedRow.هفته_سال = processedRow.هفته_سال.join(', ');
      }
      
      // Handle null or undefined arrays
      if (processedRow.تست === null || processedRow.تست === undefined) {
        processedRow.تست = '';
      }
      
      if (processedRow.هفته_سال === null || processedRow.هفته_سال === undefined) {
        processedRow.هفته_سال = '';
      }
      
      return processedRow;
    });
    
    // Build worksheet from processed JSON
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllData");
    
    // Write workbook to buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const filename = "AzmoonTire.xlsx";
    // Send the buffer with correct headers
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(buffer);
    
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ success: false, message: "Server error generating Excel" });
  }
};

export const downloadDepositoryData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start and end dates required" });
    }

    // Fetch data from DB
    const data = await dashboardModel.getDepositoryData(startDate, endDate);

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Process the data to handle array fields
    const processedData = data.map(row => {
      const processedRow = { ...row };
      
      // Convert array fields to strings
      
      if (Array.isArray(processedRow.هفته_سال)) {
        processedRow.هفته_سال = processedRow.هفته_سال.join(', ');
      }
      
      if (processedRow.هفته_سال === null || processedRow.هفته_سال === undefined) {
        processedRow.هفته_سال = '';
      }
      
      return processedRow;
    });

    // Build worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllData");

    // Write workbook to buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Send the buffer with correct headers
    res.setHeader("Content-Disposition", "attachment; filename=depo_data.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(buffer);

  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ success: false, message: "Server error generating Excel" });
  }
};



  // Combined dashboard data endpoint
  export const getDashboardSummary = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const { startDate: validStart, endDate: validEnd } = 
        dashboardModel.validateDateRange(startDate, endDate);

      // Get multiple data sets in parallel
      const [
        entryCountsByDate,
        ringsSumByDate,
        entryCountsBySize,
        entryCountsByBrand,
        entryCountsByCustomer,
        depositorySums,
        labConfirmationStatus
      ] = await Promise.all([
        dashboardModel.getEntryCountsByDate(validStart, validEnd),
        dashboardModel.getRingsSumByDate(validStart, validEnd),
        dashboardModel.getEntryCountsBySize(validStart, validEnd),
        dashboardModel.getEntryCountsByBrand(validStart, validEnd),
        dashboardModel.getEntryCountsByCustomer(validStart, validEnd),
        dashboardModel.getDepositorySums(),
        dashboardModel.getLabConfirmationStatus()
      ]);

      res.json({
        success: true,
        data: {
          entryCountsByDate,
          ringsSumByDate,
          entryCountsBySize,
          entryCountsByBrand,
          entryCountsByCustomer,
          depositorySums,
          labConfirmationStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


