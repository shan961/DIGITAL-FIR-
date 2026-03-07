// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/user", require("./routes/userRoutes"));
// app.use("/api/police", require("./routes/policeRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));