import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development" });
console.log(process.env.NODE_ENV)

const app = express();

// CORS - Allow both frontends
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3003",
      "http://localhost:3004",
      "https://tire.rierco.net",
      "https://lab.rierco.net",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});