// controllers/retrievalFormsController.js
// import { getJsReportInstance } from "../reporting.js";
import wkhtmltopdf from "wkhtmltopdf";
import {createRetrievalForm, getRetrievalFormWithTires} from "../models/retrievalFormModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import formatCarNumber from '../utils/helper.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe",
  "C:\\Program Files (x86)\\wkhtmltopdf\\bin\\wkhtmltopdf.exe"
];

const found = candidates.find(p => fs.existsSync(p));
if (found) {
  wkhtmltopdf.command = found;
} else {
  console.warn("wkhtmltopdf executable not found at common paths. Falling back to PATH.");
}

// Read + base64-embed a Persian font once at startup
const fontPath = path.resolve(__dirname, "../assets/fonts/Arial.woff");
const fontDataUri = (() => {
  const buf = fs.readFileSync(fontPath);
  const b64 = buf.toString("base64");
  return `data:font/woff2;base64,${b64}`;
})()


export async function handleCreateRetrievalForm(req, res) {
  try {
    const { pickup_name, car_number, pickup_datetime, pickup_hour, entry_codes, count } = req.body;

    if (
  !pickup_name ||
  !car_number ||
  !pickup_datetime ||
  !pickup_hour ||
  !Array.isArray(entry_codes) ||
  !Array.isArray(count) ||
  entry_codes.length !== count.length ||
  count.some((c) => !Number.isFinite(Number(c)) || Number(c) <= 0)
) {
  return res.status(400).json({ message: "Invalid or incomplete input." });
}


    const newForm = await createRetrievalForm({
      pickup_name,
      car_number,
      pickup_datetime,
      pickup_hour,
      entry_codes,
      count
    });

    res.status(201).json(newForm);
  } catch (err) {
    console.error("❌ Error creating form:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}



export async function handleGenerateRetrievalForm(req, res) {
  try {
    const formId = Number(req.params.id);
    if (!Number.isInteger(formId)) return res.status(400).json({ message: "Invalid id." });

    const data = await getRetrievalFormWithTires(formId);
    if (!data) return res.status(404).json({ message: "Form not found." });

    const html = buildRetrievalHTML(data, fontDataUri);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="retrieval_${formId}.pdf"`);

    wkhtmltopdf(html, {
  pageSize: "A5",
  orientation: "Landscape", 
  marginTop: "12mm",
  marginRight: "12mm",
  marginBottom: "12mm",
  marginLeft: "12mm",
  printMediaType: true,
  encoding: "utf-8",
  "enable-local-file-access": true,
}).pipe(res);

  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF." });
  }
}

function buildRetrievalHTML(form, fontDataUri) {
  const formattedDate = new Date(form.pickup_datetime).toLocaleDateString("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  // timeZone: "Asia/Tehran",
});


  const countByCode = {};
  (form.entry_codes || []).forEach((code, i) => {
    countByCode[code] = form.count?.[i] ?? "";
  });

  const rows = (form.retrievals || [])
    .map((r, i) => {
      const code = r["کد_ورودی"] ?? "";
      const c = countByCode[code] ?? "";
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHTML(code)}</td>
          <td>${escapeHTML(String(c))}</td>
          <td>${escapeHTML(r["نوع_تایر"] ?? "")}</td>
          <td>${escapeHTML(r["رادیال_بایاس"] ?? "")}</td>
          <td>${escapeHTML(r["سایز"] ?? "")}</td>
          <td>${escapeHTML(r["مارک_تجاری"] ?? "")}</td>
          <td>${escapeHTML(r["کشور"] ?? "")}</td>
          <td>${escapeHTML(r["مشتری"] ?? "")}</td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>فرم خروج تایر #${form.id}</title>
  <!-- Lock CSS & fonts to inline/data only -->
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src data:; style-src 'unsafe-inline' data:; font-src data:;">
  <style>
    /* Embed Persian font to guarantee glyphs & shaping */
    @font-face {
      font-family: 'PersianPrimary';
      src: url('${fontDataUri}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
      html, body, *:not(i):not([class*="icon"]) {
      font-family: 'PersianPrimary', sans-serif !important;
    }
    html { unicode-bidi: isolate; }
    body { margin: 0; padding: 16px; color: #111; background: #fff; }

      /* 3 columns, robust in wkhtmltopdf */
.header {
  display: table;
  width: 100%;
  margin-bottom: 12px;
  table-layout: fixed;   /* stable column widths */
  direction: rtl;        /* right cell appears on the right, good for Persian */
}
.header > div {
  border: 2px solid #333;
  display: table-cell;
  vertical-align: middle;
  padding: 14px;
}

/* Right: lab name, wrapped */
.h-right {
  width: 35%;
  text-align: right;
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;   /* allow wrapping */
  word-break: break-word;
}

/* Center: big title */
.h-center {
  width: 30%;
  text-align: center;
  font-size: 18px;       /* make it big */
  font-weight: 700;
  padding: 0 6px;
}

/* Left: meta (form id & date) aligned to the left edge of the page */
.h-left {
  width: 35%;
  text-align: right;      /* sends it to the left side of the page */
  font-size: 12px;
  line-height: 1.6;
}

/* Existing meta style (optional) */
.meta { font-size: 12px; line-height: 1.6; }

    .title { font-size: 20px; font-weight: 700; }
    .meta { font-size: 12px; line-height: 1.6; }
    .grid { display: table; width: 100%; margin: 12px 0 16px; }
    .row { display: table-row; }
    .cell { display: table-cell; border: 1px solid #bbb; padding: 6px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #bbb; padding: 6px; text-align: center; }
    th { background: #eee; font-weight: 600; }
    .footer {
  display: table;
  width: 75%;
  margin: 24px;
  font-size: 12px;
  direction: rtl; /* keep Persian text direction */
  border-collapse: separate;
}
.footer > div {
  display: table-cell;
  width: 25%;
  vertical-align: bottom;
}
.footer > div:first-child { text-align: right; }
.footer > div:second-child { text-align: middle; }
.footer > div:last-child  { text-align: left;  }
  .plate {
  unicode-bidi: bidi-override; /* show literal order */
  font-family: 'PersianPrimary', monospace;
}
.alert {
border: 1px solid #333;
  }
border }
  </style>
</head>
<body>
  <div class="header">
  <div class="h-right">
    <div>آزمایشگاه شرکت مهندسی و تحقیقات صنایع لاستیک</div>
    <div>(سهامی خاص)</div>
  </div>

  <div class="h-center">فرم خروج نمونه از انبار</div>

  <div class="h-left meta">
    <div>شماره فرم: ${form.id}</div>
    <div>تاریخ و زمان ثبت: ${formattedDate}</div>
  </div>
</div>


  <div class="grid">
    <div class="row">
      <div class="cell"><strong>نام تحویل‌گیرنده:</strong> ${escapeHTML(form.pickup_name || "")}</div>
      <div class="cell">
  <strong>شماره خودرو:</strong>
  <span dir="ltr" class="plate">${escapeHTML(formatCarNumber(form.car_number || ""))}</span>
</div>

      <div class="cell"><strong>تاریخ تحویل:</strong> ${new Date(form.pickup_datetime).toLocaleDateString("fa-IR")}</div>
      <div class="cell"><strong>ساعت تحویل:</strong> ${escapeHTML(form.pickup_hour || "")}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>کد ورودی</th>
        <th>تعداد حلقه</th>
        <th>نوع تایر</th>
        <th>رادیال/بایاس</th>
        <th>سایز</th>
        <th>مارک تجاری</th>
        <th>کشور</th>
        <th>مشتری</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="grid">
  <p class="cell">تمامی مسئولیت نمونه‌ها پس از تحویل بر عهده مشتری یا نماینده مشتری می‌باشد</p>
  </div>

  <div class="footer" >
    <div>امضای انباردار: </div>
    <div>امضای تحویل‌گیرنده: </div>
    <div>امضای تصویب‌کننده:</div>
  </div>
</body>
</html>`;
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// export async function handleGenerateRetrievalForm(req, res) {
//   try {
//     const formId = req.params.id;
//     const formData = await getRetrievalFormWithTires(formId);
//     if (!formData) return res.status(404).json({ message: "Form not found" });

//     // Map entry_code counts
//     const retrievals = formData.retrievals.map((retrieval) => {
//       const index = formData.entry_codes.findIndex(
//         (code) => code === retrieval["کد_ورودی"]
//       );
//       return {
//         ...retrieval,
//         count: formData.count[index] || "0"
//       };
//     });

//     const reportData = {
//       header: {
//         pickup_name: formData.pickup_name,
//         car_number: formData.car_number,
//         pickup_datetime: formData.pickup_datetime,
//         pickup_hour: formData.pickup_hour
//       },
//       retrievals
//     };

//     const jsreportInstance = await getJsReportInstance();

//     const result = await jsreportInstance.render({
//       template: {
//         content: `
//           <h1>فرم تحویل</h1>
//           <p>تحویل گیرنده: {{:header.pickup_name}}</p>
//           <p>شماره ماشین: {{:header.car_number}}</p>
//           <p>تاریخ: {{:header.pickup_datetime}}</p>
//           <p>ساعت: {{:header.pickup_hour}}</p>
//           <table border="1" style="width: 100%; border-collapse: collapse; text-align: right;">
//             <thead>
//               <tr>
//                 <th>کد ورودی</th>
//                 <th>مارک تجاری</th>
//                 <th>سایز</th>
//                 <th>کشور</th>
//                 <th>نوع تایر</th>
//                 <th>رادیال/بایاس</th>
//                 <th>مشتری</th>
//                 <th>تعداد حلقه</th>
//               </tr>
//             </thead>
//             <tbody>
//               {{for retrievals}}
//                 <tr>
//                   <td>{{:کد_ورودی}}</td>
//                   <td>{{:مارک_تجاری}}</td>
//                   <td>{{:سایز}}</td>
//                   <td>{{:کشور}}</td>
//                   <td>{{:نوع_تایر}}</td>
//                   <td>{{:رادیال_بایاس}}</td>
//                   <td>{{:مشتری}}</td>
//                   <td>{{:count}}</td>
//                 </tr>
//               {{/for}}
//             </tbody>
//           </table>
//         `,
//         engine: "jsrender",
//         recipe: "html" // or "chrome-pdf" if you want PDF output
//       },
//       data: reportData
//     });

//     res.setHeader("Content-Type", "text/html");
//     res.send(result.content);
//   } catch (err) {
//     console.error("❌ Error generating jsreport:", err.message);
//     res.status(500).json({ message: "Failed to generate report" });
//   }
// }
