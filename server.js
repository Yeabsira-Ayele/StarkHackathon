
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config(); // must run before anything reads process.env

const connectDB = require("./src/config/db");
const Donation = require("./src/models/Donation");
const campaignRoutes = require("./src/routes/CampaignRoutes");
const donationRoutes = require("./src/routes/donationRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
// Person 1: authentication and users
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use("/api/campaigns", express.json({ limit: "5mb" }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// API routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", organizationRoutes);
app.use("/api", campaignRoutes);
app.use("/api", donationRoutes);
app.use("/api", adminRoutes);
app.use("/api", reportRoutes);

// 404 handler and error handler (standard { success, message, error } format)
app.use(notFound);
app.use(errorHandler);

// Create the receipt uniqueness index before accepting donation requests.
connectDB().then(async () => {
  await Donation.init();
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Backend startup failed:", error.name);
  process.exitCode = 1;
});
