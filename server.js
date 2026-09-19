const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config(); // must run before anything reads process.env

const connectDB = require("./src/config/db");
const campaignRoutes = require("./src/routes/CampaignRoutes");
const donationRoutes = require("./src/routes/donationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// API routes
app.use("/api", campaignRoutes);
app.use("/api", donationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? "Server error" : err.message,
  });
});

// Connect to MongoDB, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});