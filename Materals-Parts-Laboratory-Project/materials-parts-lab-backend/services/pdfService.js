// services/pdfService.js
// Laboratory Test Report PDF Generation Service
// With Persian text and Shamsi date support

import PDFDocument from "pdfkit";
import { preparePersianText, reverseForRTL } from "../utils/persianText.js";
import { toShamsiDate } from "../utils/shamsiDate.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Path to Persian font
// Download Vazirmatn from: https://github.com/rastikerdar/vazirmatn/raw/master/fonts/ttf/Vazirmatn-Regular.ttf
const persianFontPath = path.join(__dirname, "../fonts/Vazirmatn-Regular.ttf");

// Check if font exists
if (!fs.existsSync(persianFontPath)) {
  console.error("❌ ERROR: Persian font not found!");
  console.error("   Expected location:", persianFontPath);
  console.error(
    "   Download from: https://github.com/rastikerdar/vazirmatn/raw/master/fonts/ttf/Vazirmatn-Regular.ttf",
  );
  console.error("   Place it in: backend/fonts/Vazirmatn-Regular.ttf");
  console.error("");
  console.error(
    "   Without this font, Persian text will appear as garbled characters.",
  );
  console.error("");
} else {
  console.log("✅ Persian font loaded successfully");
}
async function fetchImageBuffer(imageUrl) {
  try {
    console.log("Fetching image from:", imageUrl);
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Image buffer size:", buffer.length);
    return buffer;
  } catch (e) {
    console.error("Failed to load sample image:", e.message);
    return null;
  }
}

// Pre-fetch all images BEFORE the Promise
export async function generateTestResultsPDF(recordsData, outputStream) {
  // Pre-fetch images for all records before entering the Promise

  const records = Array.isArray(recordsData) ? recordsData : [recordsData];

  for (const record of records) {
    // Case 1: sample_images is an array
    console.log("Record image fields:", {
      sample_images: record.sample_images,
      sample_image: record.sample_image,
      image: record.image,
      images: record.images,
      // log all keys to find where the image URL is stored
      allKeys: Object.keys(record),
    });
    if (
      record.sample_images &&
      Array.isArray(record.sample_images) &&
      record.sample_images.length > 0
    ) {
      record._imageBuffer = await fetchImageBuffer(record.sample_images[0]);
    }
    // Case 2: sample_images is a direct string URL
    else if (record.sample_images && typeof record.sample_images === "string") {
      record._imageBuffer = await fetchImageBuffer(record.sample_images);
    }
    // Case 3: image is stored directly as sample_image (singular)
    else if (record.sample_image && typeof record.sample_image === "string") {
      record._imageBuffer = await fetchImageBuffer(record.sample_image);
    }

    console.log(
      "_imageBuffer set for record:",
      record.record_number,
      !!record._imageBuffer,
    );
  }
  return new Promise((resolve, reject) => {
    try {
      if (!recordsData || recordsData.length === 0) {
        throw new Error("No records data provided");
      }

      console.log(`Generating PDF for ${recordsData.length} record(s)`);

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape", // ADD THIS LINE
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
      });

      // Register Persian font (if available)
      let hasPersianFont = false;
      if (fs.existsSync(persianFontPath)) {
        doc.registerFont("Persian", persianFontPath);
        hasPersianFont = true;
        console.log("✅ Persian font registered in PDF");
      } else {
        console.warn(
          "⚠️  Persian font not available - text may not display correctly",
        );
      }

      doc.pipe(outputStream);

      const pageWidth = 841.89;
      const pageHeight = 595.28;
      const margin = 30;
      const contentWidth = pageWidth - 2 * margin;

      // Helper functions to switch fonts
      const usePersianFont = (size = 10) => {
        doc.fontSize(size);
        if (hasPersianFont) {
          doc.font("Persian");
        } else {
          doc.font("Helvetica");
        }
      };

      const useEnglishFont = (size = 10) => {
        doc.fontSize(size).font("Helvetica");
      };

      // Generate content
      // Generate content
      let isFirstPage = true;

      recordsData.forEach((record, recordIndex) => {
        const tests = record.tests || [];

        // ========== COVER PAGE: Only for the very first record ==========
        if (recordIndex === 0) {
          drawHeader(
            doc,
            margin,
            contentWidth,
            1,
            recordsData.length + 1, // Total pages = 1 cover + number of records
            usePersianFont,
            useEnglishFont,
          );

          let currentY = drawCustomerInfo(
            doc,
            margin,
            contentWidth,
            record,
            margin + 90,
            usePersianFont,
            useEnglishFont,
          );

          currentY = drawSampleImage(
            doc,
            margin,
            contentWidth,
            record,
            currentY,
            usePersianFont,
          );

          // Address at bottom of cover page
          drawCompanyAddress(
            doc,
            margin,
            contentWidth,
            pageHeight,
            usePersianFont,
            useEnglishFont,
          );

          isFirstPage = false;
        }

        // ========== TEST RESULTS PAGE: One per record ==========
        doc.addPage();

        drawHeader(
          doc,
          margin,
          contentWidth,
          recordIndex + 2, // Page 2, 3, 4... (after cover)
          recordsData.length + 1,
          usePersianFont,
          useEnglishFont,
        );

        let currentY = drawCustomerInfo(
          doc,
          margin,
          contentWidth,
          record,
          margin + 90,
          usePersianFont,
          useEnglishFont,
        );

        // Draw ALL tests of this record in ONE table
        currentY = drawTestResults(
          doc,
          margin,
          contentWidth,
          tests, // Pass entire tests array
          currentY + 10,
          usePersianFont,
          useEnglishFont,
        );

        drawSignatures(doc, margin, contentWidth, pageHeight, usePersianFont);

        drawFooterNotes(doc, margin, contentWidth, pageHeight, usePersianFont);

        drawCompanyAddress(
          doc,
          margin,
          contentWidth,
          pageHeight,
          usePersianFont,
          useEnglishFont,
        );
      });

      doc.end();

      outputStream.on("finish", () => {
        console.log("PDF generation completed successfully");
        resolve();
      });

      outputStream.on("error", reject);
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
}

function drawCompanyAddress(
  doc,
  margin,
  contentWidth,
  pageHeight,
  usePersianFont,
  useEnglishFont,
) {
  const actualPageHeight = doc.page.height;
  const addressY = actualPageHeight - 50; // 25px from bottom

  // Save current position
  const savedY = doc.y;

  usePersianFont(9);
  doc.fillColor("#000000");

  // Manually set Y position to prevent auto page break
  doc.y = addressY;

  doc.text(
    preparePersianText(
      reverseForRTL(
        "آدرس آزمایشگاه: تهران - کرج، خروجی علم و فن آوری، بلوار پژوهش، جنب پژوهشکده هواشناسی، انتهای کوچه، تلفن پذیرش: 021-44787903 • rierco@yahoo.com",
      ),
    ),
    margin,
    addressY,
    {
      width: contentWidth,
      align: "right",
      lineBreak: false, // Prevent text wrapping that might cause page break
    },
  );

  // Restore Y position (optional, since this is last element on page)
  doc.y = savedY;
}

/**
 * Draw header section (repeats on each page)
 */
function drawHeader(
  doc,
  margin,
  contentWidth,
  pageNumber,
  totalPages,
  usePersianFont,
  useEnglishFont,
) {
  const headerHeight = 80;
  const headerY = margin;

  // Header border
  doc.rect(margin, headerY, contentWidth, headerHeight).stroke("#000000");

  // Divide header into 3 columns
  const col1Width = contentWidth * 0.35; // Left - logos
  const col2Width = contentWidth * 0.3; // Center - title
  const col3Width = contentWidth * 0.35; // Right - company name

  // LEFT COLUMN - Certification Info
  let leftX = margin + 10;
  // useEnglishFont(8);
  // doc.text("ISO/IEC 17025", leftX, headerY + 10, {
  //   width: col1Width - 20,
  //   align: "right",
  // });
  // doc.text("NO.259", leftX, headerY + 25, {
  //   width: col1Width - 20,
  //   align: "right",
  // });

  // Document code and page (Persian text)

  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL("کد سند: FR-TM-03")),
    leftX,
    headerY + 7,
    {
      width: col1Width - 15,
      align: "right",
    },
  );
  doc.text(
    preparePersianText(reverseForRTL("بازنگری: 15")),
    leftX,
    headerY + 20,
    {
      width: col1Width - 15,
      align: "right",
    },
  );
  doc.text(
    preparePersianText(reverseForRTL(`صفحه ${pageNumber} از ${totalPages}`)),
    leftX,
    headerY + 35,
    { width: col1Width - 15, align: "right" },
  );
  // Date - Shamsi format
  const todayShamsi = toShamsiDate(new Date());
  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL(`تاریخ بازنگری: ${todayShamsi}`)),
    leftX,
    headerY + 60,
    { width: col1Width - 15, align: "right" },
  );

  // CENTER COLUMN - Title
  const centerX = margin + col1Width;
  usePersianFont(14);
  doc.text(
    preparePersianText(reverseForRTL("فرم گزارش آزمون")),
    centerX,
    headerY + 20,
    {
      width: col2Width,
      align: "center",
    },
  );
  usePersianFont(10);
  doc.text(
    preparePersianText(reverseForRTL("آزمایشگاه قطعات - شیمی")),
    centerX,
    headerY + 40,
    {
      width: col2Width,
      align: "center",
    },
  );

  // RIGHT - Persian
  const rightX = margin + col1Width + col2Width;

  usePersianFont(11);
  doc.text(
    preparePersianText(reverseForRTL("آزمایشگاه")),
    rightX,
    headerY + 10,
    { width: col3Width - 10, align: "center" },
  );

  usePersianFont(11);
  doc.text(
    preparePersianText(reverseForRTL("شرکت مهندسی و تحقیقات")),
    rightX,
    headerY + 25,
    { width: col3Width - 10, align: "center" },
  );

  usePersianFont(10);
  doc.text(
    preparePersianText(reverseForRTL("صنایع لاستیک")),
    rightX,
    headerY + 40,
    {
      width: col3Width - 10,
      align: "center",
    },
  );

  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL(")سهامی خاص(")),
    rightX,
    headerY + 60,
    {
      width: col3Width - 10,
      align: "center",
    },
  );

  // Vertical dividers
  doc
    .moveTo(margin + col1Width, headerY)
    .lineTo(margin + col1Width, headerY + headerHeight)
    .stroke();
  doc
    .moveTo(margin + col1Width + col2Width, headerY)
    .lineTo(margin + col1Width + col2Width, headerY + headerHeight)
    .stroke();

  return headerY + headerHeight;
}

/**
 * Draw customer and record information section
 */
function drawCustomerInfo(
  doc,
  margin,
  contentWidth,
  record,
  yPosition,
  usePersianFont,
  useEnglishFont,
) {
  const infoHeight = 80;
  const infoY = yPosition;

  // Border
  doc.rect(margin, infoY, contentWidth, infoHeight).stroke("#000000");

  // Divide into 3 columns
  const col1Width = contentWidth * 0.35; // Right - Sample (نمونه) - rightmost in RTL
  const col2Width = contentWidth * 0.3; // Center - Dates
  const col3Width = contentWidth * 0.35; // Left - Customer (مشتری) - leftmost in RTL

  const lineHeight = 12;
  let currentLine = 0;

  // RIGHT COLUMN - Sample Information
  const rightX = margin + 5;
  currentLine = 0;

  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL(`کد نمونه: ${record.sample_name || "-"}`)),
    rightX,
    infoY + currentLine * lineHeight + 5,
    { width: col1Width - 10, align: "right" },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(
      reverseForRTL(`نوع نمونه: ${record.sample_type || "-"}`),
    ),
    rightX,
    infoY + currentLine * lineHeight + 5,
    { width: col1Width - 10, align: "right" },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(
      reverseForRTL(`تعداد و شکل نمونه: ${record.sample_description || "-"}`),
    ),
    rightX,
    infoY + currentLine * lineHeight + 5,
    { width: col1Width - 10, align: "right" },
  );

  // CENTER COLUMN - Dates and Record Number
  const centerX = margin + col1Width + 5;
  currentLine = 0;

  const requestDate = record.request_date
    ? toShamsiDate(record.request_date)
    : toShamsiDate(new Date());
  const testDate = record.test_date
    ? toShamsiDate(record.test_date)
    : toShamsiDate(new Date());
  const reportDate = toShamsiDate(new Date());

  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL(`تاریخ درخواست: ${requestDate}`)),
    centerX,
    infoY + currentLine * lineHeight + 5,
    { width: col2Width - 10, align: "right" },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(
      reverseForRTL(`شماره ثبت: ${record.record_number || "-"}`),
    ),
    centerX,
    infoY + currentLine * lineHeight + 5,
    { width: col2Width - 10, align: "right" },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL(`تاریخ انجام آزمون: ${testDate}`)),
    centerX,
    infoY + currentLine * lineHeight + 5,
    { width: col2Width - 10, align: "right" },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL(`تاریخ گزارش آزمون: ${reportDate}`)),
    centerX,
    infoY + currentLine * lineHeight + 5,
    { width: col2Width - 10, align: "right" },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(
      reverseForRTL(`شماره گزارش آزمون: TM-1404-${record.record_number}`),
    ),
    centerX,
    infoY + currentLine * lineHeight + 5,
    { width: col2Width - 10, align: "right" },
  );

  // LEFT COLUMN - Customer Information
  const leftX = margin + col1Width + col2Width + 5;
  currentLine = 0;

  usePersianFont(9);
  doc.text(
    preparePersianText(
      reverseForRTL(
        `نام مشتری: ${record.customer_name || record.orderer_name || "-"}`,
      ),
    ),
    leftX,
    infoY + currentLine * lineHeight + 5,
    { align: "right", width: col3Width - 10 },
  );
  currentLine++;

  usePersianFont(9);
  doc.text(
    preparePersianText(
      reverseForRTL(`آدرس: ${record.customer_address || "-"}`),
    ),
    leftX,
    infoY + currentLine * lineHeight + 5,
    { align: "right", width: col3Width - 10 },
  );
  currentLine += 2;

  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL(`تلفن: ${record.customer_phone || "-"}`)),
    leftX,
    infoY + currentLine * lineHeight + 5,
    { align: "right", width: col3Width - 10 },
  );

  // Vertical dividers
  doc
    .moveTo(margin + col1Width, infoY)
    .lineTo(margin + col1Width, infoY + infoHeight)
    .stroke();
  doc
    .moveTo(margin + col1Width + col2Width, infoY)
    .lineTo(margin + col1Width + col2Width, infoY + infoHeight)
    .stroke();

  return infoY + infoHeight;
}
/**
 * Draw sample image section
 */
function drawSampleImage(
  doc,
  margin,
  contentWidth,
  record,
  yPosition,
  usePersianFont,
  useEnglishFont,
) {
  const imageY = yPosition + 10;

  // Title (Persian text)
  usePersianFont(9);
  doc.text(
    preparePersianText(reverseForRTL("تصویر نمونه پذیرش شده)صرفا جهت اطلاع(")),
    margin,
    imageY,
    {
      width: contentWidth,
      align: "center",
    },
  );

  // Image placeholder or actual image
  const imagePlaceholderY = imageY + 20;
  const imageBoxX = margin + 100;
  const imageBoxWidth = contentWidth - 200;
  const imageBoxHeight = 300;
  doc
    .rect(imageBoxX, imagePlaceholderY, imageBoxWidth, imageBoxHeight)
    .stroke("#CCCCCC");

  // Try to load actual sample image if available
  if (record._imageBuffer) {
    doc.image(record._imageBuffer, imageBoxX + 2, imagePlaceholderY + 2, {
      width: imageBoxWidth - 4,
      height: imageBoxHeight - 4,
      fit: [imageBoxWidth - 4, imageBoxHeight - 4],
      align: "center",
      valign: "center",
    });
  } else {
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text("[Sample Image]", imageBoxX, imagePlaceholderY + 55, {
        width: imageBoxWidth,
        align: "center",
      })
      .fillColor("#000000");
  }
  return imagePlaceholderY + imageBoxHeight + 10;
}

/**
 * Draw test results table
 */
function drawTestResults(
  doc,
  margin,
  contentWidth,
  tests,
  yPosition,
  usePersianFont,
  useEnglishFont,
) {
  let currentY = yPosition;

  // Test title (Persian text)
  // usePersianFont(9);
  // doc.text(
  //   preparePersianText(
  //     reverseForRTL(`کد نمونه: ${test.test_title || "نمونه"}`),
  //   ),
  //   margin,
  //   currentY,
  //   { align: "right" },
  // );

  // currentY += 15;

  // Environmental conditions (Persian text)
  usePersianFont(7);
  doc.text(
    preparePersianText(
      reverseForRTL("شرایط محیطی آزمایشگاه: دمای °C 2±23 رطوبت 5±%35"),
    ),
    margin,
    currentY,
    {
      width: contentWidth,
      align: "right",
    },
  );

  currentY += 15;

  // Table setup
  const tableY = currentY;
  const rowHeight = 25;
  const headerHeight = 80; // Taller for rotated text

  // Column widths (RTL order: right to left)
  const colWidths = [
    120, // توضیحات (Description) - leftmost
    25, // اظهار نظر Pass
    25, // اظهار نظر Fail
    30, // ریسک پذیرش
    30, // احتمال انطباق
    35, // عدم قطعیت
    60, // محدوده پذیرش
    35, // واحد
    80, // نتیجه آزمون
    100, // روش آزمون
    100, // نام آزمون
    25, // ردیف - rightmost
  ];

  const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
  const scale = contentWidth / totalTableWidth;
  const scaledColWidths = colWidths.map((w) => w * scale);

  // Draw header background
  doc.rect(margin, tableY, contentWidth, headerHeight).fill("#E0E0E0");
  doc.rect(margin, tableY, contentWidth, headerHeight).fill("#E0E0E0");

  let colX = margin;

  // Helper function to draw rotated text
  function drawRotatedText(doc, text, x, y, width, height) {
    doc.save();
    // Rotate 90° counterclockwise from bottom-left of cell
    doc.translate(x + width / 2 - 5, y + height - 5);
    doc.rotate(-90);
    usePersianFont(8);
    doc.fillColor("#000000");
    doc.text(text, 0, 0, {
      width: height - 10,
      align: "center",
    });
    doc.restore();
  }

  // Column headers (RTL order, reversed from your original)
  const headers = [
    { text: "توضیحات", rotate: false, colspan: 1 },
    { text: "اظهار نظر", rotate: true, subHeaders: ["Pass", "Fail"] },
    { text: "ریسک پذیرش (%)", rotate: true },
    { text: "احتمال انطباق (%)", rotate: true },
    { text: "عدم قطعیت", rotate: true },
    { text: "محدوده پذیرش", rotate: false },
    { text: "واحد", rotate: false },
    { text: "نتیجه آزمون", rotate: false },
    { text: "استاندارد آزمون", rotate: false },
    { text: "نام آزمون", rotate: false },
    { text: "ردیف", rotate: false },
  ];

  // Draw headers
  colX = margin;
  let headerColIndex = 0;

  headers.forEach((header, i) => {
    const cellWidth = scaledColWidths[headerColIndex];

    if (header.subHeaders) {
      // Special case for "اظهار نظر" with Pass/Fail sub-columns
      const subWidth = cellWidth / 2;

      // Draw main header text rotated in merged area
      drawRotatedText(
        doc,
        preparePersianText(reverseForRTL(header.text)),
        colX,
        tableY,
        scaledColWidths[headerColIndex] + scaledColWidths[headerColIndex + 1],
        headerHeight,
      );

      // Draw sub-headers at bottom
      usePersianFont(7);
      doc.fillColor("#000000");
      doc.text(header.subHeaders[0], colX + 2, tableY + headerHeight - 15, {
        width: scaledColWidths[headerColIndex] - 4,
        align: "center",
      });

      colX += scaledColWidths[headerColIndex];
      headerColIndex++;

      // ADD THIS LINE - draws the vertical divider between Pass/Fail ONLY at the bottom
      doc
        .moveTo(colX, tableY + headerHeight - 20) // Start 20px from bottom (below rotated text)
        .lineTo(colX, tableY + headerHeight) // End at bottom of header
        .stroke("#000000");

      doc.text(header.subHeaders[1], colX + 2, tableY + headerHeight - 15, {
        width: scaledColWidths[headerColIndex] - 4,
        align: "center",
      });
    } else if (header.rotate) {
      // Rotated header
      drawRotatedText(
        doc,
        preparePersianText(reverseForRTL(header.text)),
        colX,
        tableY,
        cellWidth,
        headerHeight,
      );
    } else {
      // Normal horizontal header
      usePersianFont(9);
      doc.fillColor("#000000");
      doc.text(
        preparePersianText(reverseForRTL(header.text)),
        colX + 2,
        tableY + headerHeight / 2 - 5,
        { width: cellWidth - 4, align: "center" },
      );
    }

    // Draw vertical line
    if (!(header.subHeaders && headerColIndex === i + 1)) {
      doc
        .moveTo(colX, tableY)
        .lineTo(colX, tableY + headerHeight)
        .stroke("#000000");
    }

    colX += scaledColWidths[headerColIndex];
    headerColIndex++;
  });

  // Draw final right border
  doc
    .moveTo(colX, tableY)
    .lineTo(colX, tableY + headerHeight)
    .stroke("#000000");

  // Draw horizontal line below header
  doc
    .moveTo(margin, tableY + headerHeight)
    .lineTo(margin + contentWidth, tableY + headerHeight)
    .stroke("#000000");

  doc
    .moveTo(margin, tableY)
    .lineTo(margin + contentWidth, tableY)
    .stroke("#000000");

  currentY = tableY + headerHeight;

  // Data rows - NOW LOOP THROUGH ALL TESTS
  let rowIndex = 0;
  tests.forEach((test) => {
    // Get all results for this test
    const results = test.results || [test]; // Handle if test itself has results array

    if (results.length === 0) {
      usePersianFont(9);
      doc
        .text(
          preparePersianText(reverseForRTL("هیچ نتیجه‌ای ثبت نشده است")),
          margin,
          currentY,
          {
            width: contentWidth,
            align: "center",
          },
        )
        .fillColor("#000000");
      return currentY + 20;
    }
    results.forEach((result) => {
      const bgColor = rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5";

      doc.rect(margin, currentY, contentWidth, rowHeight).fill(bgColor);

      let colX = margin;

      // Row data in RTL order
      const rowData = [
        preparePersianText(reverseForRTL(result.observations || "-")),
        "PASS_PLACEHOLDER", // We'll handle this separately
        "FAIL_PLACEHOLDER", // We'll handle this separately
        "-",
        "-",
        result.uncertainty || "-",
        result.acceptance_range || "-",
        test.test_measurement_unit || "-",
        result.result_value?.toString() || "-",
        test.standard_title || "-",
        preparePersianText(reverseForRTL(test.test_title || "-")),
        (rowIndex + 1).toString(),
      ];

      rowData.forEach((data, i) => {
        usePersianFont(9);
        doc.fontSize(8);

        // Special handling for Pass/Fail columns
        if (i === 1) {
          // Pass column
          if (result.passed === true) {
            doc.fillColor("#008000"); // Green
            doc.text("Pass", colX + 2, currentY + 8, {
              width: scaledColWidths[i] - 4,
              align: "center",
            });
          } else {
            doc.fillColor("#000000");
            doc.text("-", colX + 2, currentY + 8, {
              width: scaledColWidths[i] - 4,
              align: "center",
            });
          }
        } else if (i === 2) {
          // Fail column
          if (result.passed === false) {
            doc.fillColor("#FF0000"); // Red
            doc.text("Fail", colX + 2, currentY + 8, {
              width: scaledColWidths[i] - 4,
              align: "center",
            });
          } else {
            doc.fillColor("#000000");
            doc.text("-", colX + 2, currentY + 8, {
              width: scaledColWidths[i] - 4,
              align: "center",
            });
          }
        } else {
          // Regular column
          doc.fillColor("#000000");
          doc.text(data, colX + 2, currentY + 8, {
            width: scaledColWidths[i] - 4,
            align: i === 0 ? "right" : "center",
          });
        }

        // Reset color after each cell
        doc.fillColor("#000000");

        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + rowHeight)
          .stroke("#000000");

        colX += scaledColWidths[i];
      });

      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + rowHeight)
        .stroke("#000000");

      doc
        .moveTo(margin, currentY + rowHeight)
        .lineTo(margin + contentWidth, currentY + rowHeight)
        .stroke("#000000");

      currentY += rowHeight;
      rowIndex++;
    });
  });

  return currentY + 20;
}

/**
 * Draw signature section
 */
function drawSignatures(
  doc,
  margin,
  contentWidth,
  pageHeight,
  usePersianFont,
  useEnglishFont,
) {
  const currentY = pageHeight - 175;
  const signatureHeight = 50;
  const sigWidth = contentWidth / 4;
  let sigX = margin;

  // Outer rectangle
  doc.rect(margin, currentY, contentWidth, signatureHeight).stroke("#000000");

  // ADD THESE LINES - Draw vertical dividers
  doc
    .moveTo(margin + sigWidth, currentY)
    .lineTo(margin + sigWidth, currentY + signatureHeight)
    .stroke("#000000");

  doc
    .moveTo(margin + sigWidth * 2, currentY)
    .lineTo(margin + sigWidth * 2, currentY + signatureHeight)
    .stroke("#000000");

  doc
    .moveTo(margin + sigWidth * 3, currentY)
    .lineTo(margin + sigWidth * 3, currentY + signatureHeight)
    .stroke("#000000");

  // Rest of your code stays the same...
  // Stamp placeholder (Persian text)
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("محل مهر آزمایشگاه")),
    sigX,
    currentY + 5,
    {
      width: sigWidth,
      align: "center",
    },
  );

  // Senior Manager (Persian text)
  sigX += sigWidth;
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("مدیر ارشد آزمایشگاه")),
    sigX,
    currentY + 5,
    {
      width: sigWidth,
      align: "center",
    },
  );
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("عبدالرزاق تفرشی")),
    sigX,
    currentY + 25,
    {
      width: sigWidth,
      align: "center",
    },
  );

  // Lab Head (Persian text)
  sigX += sigWidth;
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("رئیس آزمایشگاه")),
    sigX,
    currentY + 5,
    {
      width: sigWidth,
      align: "center",
    },
  );
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("مهدی میرزایی")),
    sigX,
    currentY + 25,
    {
      width: sigWidth,
      align: "center",
    },
  );

  // Technical Manager (Persian text)
  sigX += sigWidth;
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("مدیرفنی آزمایشگاه")),
    sigX,
    currentY + 5,
    {
      width: sigWidth,
      align: "center",
    },
  );
  usePersianFont(8);
  doc.text(
    preparePersianText(reverseForRTL("لیلا مردانه")),
    sigX,
    currentY + 25,
    {
      width: sigWidth,
      align: "center",
    },
  );
}

/**
 * Draw footer notes
 */
function drawFooterNotes(
  doc,
  margin,
  contentWidth,
  pageHeight,
  usePersianFont,
  useEnglishFont,
) {
  const currentY = pageHeight - 125;
  const footerHeight = 70;
  const footerY = currentY;

  doc.rect(margin, footerY, contentWidth, footerHeight).stroke("#000000");
  // Main notes section
  usePersianFont(7);

  // Right side notes
  doc.text(
    preparePersianText(
      reverseForRTL(".1 نتایج گزارش آزمون فقط در خصوص نمونه ارائه شده می‌باشد"),
    ),
    margin + contentWidth / 2 + 5,
    currentY,
    { width: contentWidth / 2 - 10, align: "right" },
  );

  doc.text(
    preparePersianText(
      reverseForRTL(
        ".3 باقیمانده نمونه‌ها حداکثر تا یک ماه پس از انجام آزمون در آزمایشگاه نگهداری می‌شود",
      ),
    ),
    margin + contentWidth / 2 + 5,
    currentY + 10,
    { width: contentWidth / 2 - 10, align: "right" },
  );

  // Left side notes
  doc.text(
    preparePersianText(
      reverseForRTL(".2 نمونه‌گیری توسط مشتری انجام گرفته است"),
    ),
    margin,
    currentY,
    { width: contentWidth / 2 - 10, align: "right" },
  );

  doc.text(
    preparePersianText(
      reverseForRTL(
        ".4 اصل گزارش آزمون با مهر برجسته قابل استناد است و کپی آن فاقد ارزش قانونی است",
      ),
    ),
    margin,
    currentY + 10,
    { width: contentWidth / 2 - 10, align: "right" },
  );

  // Asterisk note about Pass/Fail
  doc.text(
    preparePersianText(
      reverseForRTL(
        "* تنها برای آزمون‌هایی که بیانیه انطباق یا مشخصات با استاندارد توسط مشتری ارایه شده، قواعد تصمیم‌گیری زیر اعمال شده‌اند:",
      ),
    ),
    margin,
    currentY + 25,
    { width: contentWidth - 10, align: "right" },
  );

  // Pass bullet
  usePersianFont(7);
  doc.fillColor("#008000");
  doc.text(
    preparePersianText(
      reverseForRTL(
        "• Pass – نتایج ± عدم قطعیت گسترده در محدوده/ الزامات )اسپک(",
      ),
    ),
    margin,
    currentY + 35,
    { width: contentWidth - 10, align: "right" },
  );

  // Fail bullet
  usePersianFont(7);
  doc.fillColor("#FF0000");
  doc.text(
    preparePersianText(
      reverseForRTL(
        "• Fail – نتایج ± عدم قطعیت گسترده خارج از محدوده/ الزامات )اسپک(",
      ),
    ),
    margin,
    currentY + 42,
    { width: contentWidth - 10, align: "right" },
  );

  // Uncertainty note
  usePersianFont(7);
  doc.fillColor("#000000");
  doc.text(
    preparePersianText(
      reverseForRTL(
        "• عدم قطعیت گسترده با سطح اطمینان 95% و ضریب همپوشانی 2 = k محاسبه شده است.",
      ),
    ),
    margin,
    currentY + 52,
    { width: contentWidth - 10, align: "right" },
  );

  doc.fillColor("#000000");
}

// Export the main function
export default {
  generateTestResultsPDF,
};
