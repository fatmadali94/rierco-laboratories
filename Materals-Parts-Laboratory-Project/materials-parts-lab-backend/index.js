import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dotenv.config();
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: join(__dirname, ".env.production") });
} else {
  dotenv.config({ path: join(__dirname, ".env.development") });
}

import customersRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import ordererRoutes from "./routes/ordererRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import sampleRoutes from "./routes/sampleRoutes.js";
import standardroutes from "./routes/standardroutes.js";
import testRoutes from "./routes/testRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testResultsRoutes from "./routes/testResultsRoutes.js";
import financialInvoicesRoutes from "./routes/financialInvoicesRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import { initializePersianText } from "./utils/persianText.js";

const app = express();

app.use(
  cors({
    origin: [
      "https://lab.rierco.net",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:8080",
      "http://194.180.11.232:8080",
    ],

    credentials: true,
  }),
);

app.use(express.json());

await initializePersianText();
console.log("Persian text support initialized");

app.use("/api/customers", customersRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/orderers", ordererRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/standards", standardroutes);
app.use("/api/tests", testRoutes);
app.use("/api", paymentRoutes);
app.use("/api/test-results", testResultsRoutes);
app.use("/api/financial-invoices", financialInvoicesRoutes);
// app.use("/api/chats", chatRoutes);
app.use("/api", pdfRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
